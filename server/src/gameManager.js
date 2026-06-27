'use strict';

const { rankingQuestions, voteQuestions, shuffle } = require('./data/questions');

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const GRACE_PERIOD_MS = 10_000;
const MIN_PLAYERS = 3;

/**
 * Generates a 5-character room code from the safe character set.
 * @returns {string}
 */
function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

/**
 * Central game state manager.
 * All rooms live in memory — no persistence between server restarts.
 */
class GameManager {
  constructor() {
    /** @type {Map<string, GameRoom>} roomCode → room */
    this.rooms = new Map();
    /** @type {Map<string, string>} socketId → roomCode */
    this.playerRooms = new Map();
  }

  // ─── Room lifecycle ────────────────────────────────────────────────────────

  /**
   * Create a new room and register the host player.
   * @param {string} socketId
   * @param {string} hostName
   * @returns {GameRoom}
   */
  createRoom(socketId, hostName, device = {}) {
    let code;
    do { code = generateRoomCode(); } while (this.rooms.has(code));

    /** @type {GameRoom} */
    const room = {
      roomCode: code,
      hostId: socketId,
      hostGraceTimer: null,
      gameSessionId: null, // set by index.js after DB record is created
      players: [
        { id: socketId, name: hostName, connected: true, disconnectTimer: null, device, joinedAt: new Date() },
      ],
      settings: { votesEnabled: true, anonymous: false },
      status: 'lobby',
      phase: null,
      rankingQuestions: [],
      voteQuestions: [],
      rankingIndex: -1,
      voteIndex: -1,
      currentQuestion: null,
      currentResults: null,
      answers: {},
      voteAnswers: {},
      roundsCompleted: 0,
      gamePaused: false,
    };

    this.rooms.set(code, room);
    this.playerRooms.set(socketId, code);
    return room;
  }

  /**
   * Add a player to an existing lobby room.
   * @param {string} socketId
   * @param {string} roomCode
   * @param {string} name
   * @returns {{ room: GameRoom, player: Player } | { error: string }}
   */
  joinRoom(socketId, roomCode, name, device = {}) {
    const room = this.rooms.get(roomCode);
    if (!room) return { error: 'ROOM_NOT_FOUND' };
    if (room.status !== 'lobby') return { error: 'GAME_ALREADY_STARTED' };

    const player = { id: socketId, name, connected: true, disconnectTimer: null, device, joinedAt: new Date() };
    room.players.push(player);
    this.playerRooms.set(socketId, roomCode);
    return { room, player };
  }

  /**
   * Attempt to reconnect a previously-seen player.
   * Matches by stored playerId (socket id from prior session).
   * @param {string} newSocketId
   * @param {string} roomCode
   * @param {string} storedPlayerId
   * @param {string} name
   * @returns {{ room: GameRoom, player: Player, wasHost: boolean } | { error: string }}
   */
  reconnectPlayer(newSocketId, roomCode, storedPlayerId, name) {
    const room = this.rooms.get(roomCode);
    if (!room) return { error: 'ROOM_NOT_FOUND' };

    const player = room.players.find(p => p.id === storedPlayerId);
    if (!player) return { error: 'PLAYER_NOT_IN_ROOM' };

    const wasHost = room.hostId === storedPlayerId;

    // Cancel any pending removal timer
    if (player.disconnectTimer) {
      clearTimeout(player.disconnectTimer);
      player.disconnectTimer = null;
    }

    // Update the player's socket id to their new connection
    this.playerRooms.delete(storedPlayerId);
    this.playerRooms.set(newSocketId, roomCode);

    // Reassign stored player id to new socket id throughout room state
    player.id = newSocketId;
    player.connected = true;

    if (wasHost) {
      // Cancel host grace timer if it hasn't fired yet
      if (room.hostGraceTimer) {
        clearTimeout(room.hostGraceTimer);
        room.hostGraceTimer = null;
      }
      room.hostId = newSocketId;

      // Fix answers keyed by old socket id
      this._reKeyPlayer(room, storedPlayerId, newSocketId);
    } else {
      this._reKeyPlayer(room, storedPlayerId, newSocketId);
    }

    return { room, player, wasHost };
  }

  /**
   * Re-key all answer maps when a player's socket id changes.
   */
  _reKeyPlayer(room, oldId, newId) {
    for (const questionId of Object.keys(room.answers)) {
      if (oldId in room.answers[questionId]) {
        room.answers[questionId][newId] = room.answers[questionId][oldId];
        delete room.answers[questionId][oldId];
      }
    }
    for (const questionId of Object.keys(room.voteAnswers)) {
      if (oldId in room.voteAnswers[questionId]) {
        room.voteAnswers[questionId][newId] = room.voteAnswers[questionId][oldId];
        delete room.voteAnswers[questionId][oldId];
      }
      // Also fix votes that targeted the old id
      for (const [voterId, targetId] of Object.entries(room.voteAnswers[questionId])) {
        if (targetId === oldId) room.voteAnswers[questionId][voterId] = newId;
      }
    }
  }

  /**
   * Mark a player as disconnected and set a grace-period timer.
   * @param {string} socketId
   * @param {function(GameRoom, boolean, string): void} onExpiry  called when grace period ends
   * @returns {{ room: GameRoom | null, isHost: boolean }}
   */
  handleDisconnect(socketId, onExpiry) {
    const roomCode = this.playerRooms.get(socketId);
    if (!roomCode) return { room: null, isHost: false };

    const room = this.rooms.get(roomCode);
    if (!room) return { room: null, isHost: false };

    const player = room.players.find(p => p.id === socketId);
    if (!player) return { room: null, isHost: false };

    player.connected = false;
    const isHost = room.hostId === socketId;

    if (isHost && room.status === 'lobby') {
      // Host left lobby — destroy room immediately (handled in caller)
      return { room, isHost: true, immediate: true };
    }

    const timer = setTimeout(() => {
      onExpiry(room, isHost, socketId);
    }, GRACE_PERIOD_MS);

    if (isHost) {
      room.hostGraceTimer = timer;
    } else {
      player.disconnectTimer = timer;
    }

    return { room, isHost };
  }

  /**
   * Permanently remove a player from a room.
   * Returns the new host id if host was promoted.
   * @param {GameRoom} room
   * @param {string} playerId
   * @returns {{ newHostId: string | null, belowMin: boolean }}
   */
  removePlayer(room, playerId) {
    room.players = room.players.filter(p => p.id !== playerId);
    this.playerRooms.delete(playerId);

    let newHostId = null;
    if (room.hostId === playerId) {
      const connected = room.players.filter(p => p.connected);
      if (connected.length > 0) {
        room.hostId = connected[0].id;
        newHostId = room.hostId;
      }
    }

    const connectedCount = room.players.filter(p => p.connected).length;
    const belowMin = room.status === 'playing' && connectedCount < MIN_PLAYERS;
    if (belowMin) room.gamePaused = true;

    return { newHostId, belowMin };
  }

  /**
   * Destroy a room entirely.
   * @param {string} roomCode
   */
  destroyRoom(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room) return;
    // Clear all timers
    if (room.hostGraceTimer) clearTimeout(room.hostGraceTimer);
    for (const p of room.players) {
      if (p.disconnectTimer) clearTimeout(p.disconnectTimer);
    }
    for (const p of room.players) this.playerRooms.delete(p.id);
    this.rooms.delete(roomCode);
  }

  // ─── Settings ──────────────────────────────────────────────────────────────

  updateSetting(room, key, value) {
    if (key in room.settings) room.settings[key] = value;
  }

  // ─── Game flow ─────────────────────────────────────────────────────────────

  /**
   * Initialise and start the game.
   * @param {GameRoom} room
   * @returns {{ question: object, phase: string, submitCount: SubmitCount }}
   */
  startGame(room) {
    room.status = 'playing';
    room.rankingQuestions = shuffle(rankingQuestions);
    room.voteQuestions = shuffle(voteQuestions);
    room.rankingIndex = 0;
    room.voteIndex = 0;
    room.roundsCompleted = 0;
    room.gamePaused = false;

    return this._beginRankingPhase(room);
  }

  _beginRankingPhase(room) {
    const question = room.rankingQuestions[room.rankingIndex];
    room.phase = 'ranking';
    room.currentQuestion = question;
    room.currentResults = null;
    room.answers[question.id] = {};
    return {
      phase: 'ranking',
      question,
      submitCount: this._submitCount(room, 'ranking'),
    };
  }

  _beginVotePhase(room) {
    const question = room.voteQuestions[room.voteIndex];
    room.phase = 'vote';
    room.currentQuestion = question;
    room.currentResults = null;
    room.voteAnswers[question.id] = {};
    return {
      phase: 'vote',
      question,
      submitCount: this._submitCount(room, 'vote'),
    };
  }

  /**
   * Record a ranking answer. Returns updated submit count.
   * @param {GameRoom} room
   * @param {string} playerId
   * @param {string} questionId
   * @param {number} value 1–5
   */
  submitRanking(room, playerId, questionId, value) {
    if (!room.answers[questionId]) room.answers[questionId] = {};
    room.answers[questionId][playerId] = value;
    return this._submitCount(room, 'ranking');
  }

  /**
   * Record a vote answer. Returns updated submit count.
   */
  submitVote(room, playerId, questionId, targetId) {
    if (!room.voteAnswers[questionId]) room.voteAnswers[questionId] = {};
    room.voteAnswers[questionId][playerId] = targetId;
    return this._submitCount(room, 'vote');
  }

  /**
   * How many active players have submitted for the current question.
   */
  _submitCount(room, phase) {
    const active = room.players.filter(p => p.connected);
    const qId = room.currentQuestion?.id;
    if (!qId) return { submitted: 0, total: active.length };

    const answers = phase === 'ranking' ? room.answers : room.voteAnswers;
    const submitted = Object.keys(answers[qId] || {}).filter(pid =>
      active.some(p => p.id === pid)
    ).length;

    return { submitted, total: active.length };
  }

  allAnswered(room, phase) {
    const count = this._submitCount(room, phase);
    return count.submitted >= count.total && count.total > 0;
  }

  /**
   * Build the results payload to broadcast.
   * @param {GameRoom} room
   * @param {'ranking' | 'vote'} phase
   */
  buildResults(room, phase) {
    const qId = room.currentQuestion.id;
    const { anonymous, votesEnabled } = room.settings;
    const activePlayers = room.players.filter(p => p.connected);

    if (phase === 'ranking') {
      room.phase = 'ranking_reveal';
      const rawAnswers = room.answers[qId] || {};
      const playerAnswers = activePlayers.map((p, idx) => ({
        playerId: p.id,
        name: anonymous ? null : p.name,
        label: anonymous ? `Player ${idx + 1}` : p.name,
        value: rawAnswers[p.id] ?? null,
      }));
      const results = { type: 'ranking', questionId: qId, playerAnswers };
      room.currentResults = results;
      return results;
    } else {
      room.phase = 'vote_reveal';
      const rawVotes = room.voteAnswers[qId] || {};

      // Count votes per player
      const voteCounts = {};
      for (const p of activePlayers) voteCounts[p.id] = 0;
      for (const targetId of Object.values(rawVotes)) {
        if (voteCounts[targetId] !== undefined) voteCounts[targetId]++;
      }

      const ranked = activePlayers
        .map((p, idx) => ({
          playerId: p.id,
          name: anonymous ? null : p.name,
          label: anonymous ? `Player ${idx + 1}` : p.name,
          votes: voteCounts[p.id] ?? 0,
          voters: anonymous ? [] : Object.entries(rawVotes)
            .filter(([, tid]) => tid === p.id)
            .map(([vid]) => {
              const voter = activePlayers.find(x => x.id === vid);
              return voter ? voter.name : vid;
            }),
        }))
        .sort((a, b) => b.votes - a.votes);

      const results = { type: 'vote', questionId: qId, ranked };
      room.currentResults = results;
      return results;
    }
  }

  /**
   * Advance to the next phase after results are shown.
   * Returns the next action descriptor.
   * @param {GameRoom} room
   * @returns {{ action: 'next_question'|'end_available', phase?: string, question?: object, submitCount?: object }}
   */
  nextQuestion(room) {
    const { votesEnabled } = room.settings;

    if (room.phase === 'ranking_reveal') {
      if (votesEnabled && room.voteIndex < room.voteQuestions.length) {
        const payload = this._beginVotePhase(room);
        return { action: 'next_question', ...payload };
      }
      // No votes — move to next ranking question
      room.rankingIndex++;
      room.roundsCompleted++;
      if (room.rankingIndex >= room.rankingQuestions.length) {
        // Ran out of questions — host must end game
        return { action: 'end_available' };
      }
      const payload = this._beginRankingPhase(room);
      return { action: 'next_question', ...payload };
    }

    if (room.phase === 'vote_reveal') {
      room.voteIndex++;
      room.rankingIndex++;
      room.roundsCompleted++;
      if (room.rankingIndex >= room.rankingQuestions.length) {
        return { action: 'end_available' };
      }
      const payload = this._beginRankingPhase(room);
      return { action: 'next_question', ...payload };
    }

    return { action: 'end_available' };
  }

  // ─── Final statistics ──────────────────────────────────────────────────────

  /**
   * Compute and return the final statistics object.
   * @param {GameRoom} room
   * @returns {FinalStats}
   */
  computeStats(room) {
    room.status = 'finished';
    const players = room.players;
    const { votesEnabled } = room.settings;

    // Ranking stats
    const playedRankingQ = room.rankingQuestions.slice(0, room.rankingIndex + 1)
      .filter(q => room.answers[q.id] && Object.keys(room.answers[q.id]).length > 0);

    const agreementPairs = this._calcAgreementPairs(players, room.answers, playedRankingQ);
    const rankingTags = this._calcRankingTags(players, room.answers, playedRankingQ);

    let voteStats = null;
    if (votesEnabled) {
      const playedVoteQ = room.voteQuestions.slice(0, room.voteIndex + 1)
        .filter(q => room.voteAnswers[q.id] && Object.keys(room.voteAnswers[q.id]).length > 0);
      const voteTags = this._calcVoteTags(players, room.voteAnswers, playedVoteQ);
      const selfVotes = this._calcSelfVotes(players, room.voteAnswers);
      voteStats = { voteTags, selfVotes };
    }

    return {
      players: players.map(p => ({ id: p.id, name: p.name })),
      agreementPairs,
      rankingTags,
      voteStats,
      settings: room.settings,
    };
  }

  _calcAgreementPairs(players, answers, questions) {
    const pairs = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const p1 = players[i];
        const p2 = players[j];
        let total = 0;
        let agreement = 0;
        for (const q of questions) {
          const a1 = answers[q.id]?.[p1.id];
          const a2 = answers[q.id]?.[p2.id];
          if (a1 !== undefined && a2 !== undefined) {
            total++;
            agreement += 4 - Math.abs(a1 - a2);
          }
        }
        if (total > 0) {
          pairs.push({
            p1Id: p1.id, p1Name: p1.name,
            p2Id: p2.id, p2Name: p2.name,
            score: Math.round((agreement / (4 * total)) * 100),
          });
        }
      }
    }
    return pairs.sort((a, b) => b.score - a.score);
  }

  _calcRankingTags(players, answers, questions) {
    const result = {};
    for (const player of players) {
      const scores = {};
      for (const q of questions) {
        const answer = answers[q.id]?.[player.id];
        if (answer === undefined) continue;
        for (const tag of q.tags) {
          if (!scores[tag.name]) scores[tag.name] = 0;
          if (tag.direction === 'agree' && answer >= 4) scores[tag.name] += answer - 3;
          else if (tag.direction === 'disagree' && answer <= 2) scores[tag.name] += 3 - answer;
        }
      }
      result[player.id] = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([name]) => name);
    }
    return result;
  }

  _calcVoteTags(players, voteAnswers, questions) {
    const playerScores = {};
    for (const p of players) playerScores[p.id] = {};

    for (const q of questions) {
      const qVotes = voteAnswers[q.id] || {};
      const voteCounts = {};
      for (const p of players) voteCounts[p.id] = 0;
      for (const tid of Object.values(qVotes)) {
        if (voteCounts[tid] !== undefined) voteCounts[tid]++;
      }
      const maxVotes = Math.max(0, ...Object.values(voteCounts));
      if (maxVotes === 0) continue;
      const winners = players.filter(p => voteCounts[p.id] === maxVotes);

      for (const tag of q.tags) {
        for (const winner of winners) {
          if (!playerScores[winner.id][tag.name]) playerScores[winner.id][tag.name] = 0;
          playerScores[winner.id][tag.name] += voteCounts[winner.id] / winners.length;
        }
      }
    }

    const result = {};
    for (const p of players) {
      result[p.id] = Object.entries(playerScores[p.id])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([name]) => name);
    }
    return result;
  }

  _calcSelfVotes(players, voteAnswers) {
    const selfVotes = {};
    for (const p of players) selfVotes[p.id] = 0;
    for (const qVotes of Object.values(voteAnswers)) {
      for (const [voterId, targetId] of Object.entries(qVotes)) {
        if (voterId === targetId && selfVotes[voterId] !== undefined) {
          selfVotes[voterId]++;
        }
      }
    }
    return selfVotes;
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  getRoom(roomCode) {
    return this.rooms.get(roomCode) || null;
  }

  getRoomByPlayer(socketId) {
    const code = this.playerRooms.get(socketId);
    return code ? this.rooms.get(code) : null;
  }

  isHost(room, socketId) {
    return room.hostId === socketId;
  }

  publicPlayers(room) {
    return room.players.map(p => ({ id: p.id, name: p.name, connected: p.connected }));
  }
}

module.exports = new GameManager();
