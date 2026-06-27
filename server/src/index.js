'use strict';

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const gm = require('./gameManager');
const { connectDB } = require('./db/connection');
const GameSession = require('./db/models/GameSession');
const Answer = require('./db/models/Answer');
const { extractDevice } = require('./db/deviceParser');

const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true }));

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN, methods: ['GET', 'POST'] },
  pingTimeout: 60_000,
  pingInterval: 25_000,
});

// ─── Socket event documentation ────────────────────────────────────────────
//
// CLIENT → SERVER
//   create_room       { name: string }
//   join_room         { roomCode: string, name: string }
//   reconnect_session { roomCode: string, playerId: string, name: string }
//   update_setting    { key: 'votesEnabled'|'anonymous', value: boolean }
//   start_game        {}
//   submit_ranking    { questionId: string, value: 1|2|3|4|5 }
//   submit_vote       { questionId: string, targetId: string }
//   reveal_results    {}
//   next_question     {}
//   end_game          {}
//   leave_lobby       {}
//
// SERVER → CLIENT (targeted)
//   session_created    { roomCode, playerId, players, settings }
//   session_joined     { roomCode, playerId, players, settings }
//   session_reconnected { players, settings, status, phase, currentQuestion,
//                         currentResults, submitCount, roundsCompleted, isHost }
//   error              { code, message }
//
// SERVER → CLIENT (room broadcast)
//   player_joined        { player, players }
//   player_left          { playerId, players }
//   setting_updated      { key, value }
//   game_started         { phase, question, submitCount }
//   submit_count_updated { submitted, total }
//   results_revealed     { phase, results }
//   next_question_started { phase, question, submitCount }
//   game_ended           { stats }
//   host_changed         { newHostId }
//   game_paused          { reason }
//   game_resumed         { players }
//   room_destroyed       {}
// ────────────────────────────────────────────────────────────────────────────

function emitError(socket, code, message) {
  socket.emit('error', { code, message });
}

/**
 * Save a batch of Answer documents to Mongo.
 * Silently ignores failures so a DB hiccup never breaks the live game.
 * @param {object[]} docs
 */
async function saveAnswers(docs) {
  try {
    await Answer.insertMany(docs, { ordered: false });
  } catch (err) {
    console.error('DB: answer save failed:', err.message);
  }
}

io.on('connection', (socket) => {

  // ── create_room ────────────────────────────────────────────────────────────
  socket.on('create_room', ({ name } = {}) => {
    if (!name || !name.trim()) return emitError(socket, 'INVALID_NAME', 'Name is required');

    const device = extractDevice(socket);
    const room = gm.createRoom(socket.id, name.trim(), device);
    socket.join(room.roomCode);

    socket.emit('session_created', {
      roomCode: room.roomCode,
      playerId: socket.id,
      players: gm.publicPlayers(room),
      settings: room.settings,
    });
  });

  // ── join_room ──────────────────────────────────────────────────────────────
  socket.on('join_room', ({ roomCode, name } = {}) => {
    if (!name || !name.trim()) return emitError(socket, 'INVALID_NAME', 'Name is required');
    if (!roomCode) return emitError(socket, 'INVALID_CODE', 'Room code is required');

    const device = extractDevice(socket);
    const result = gm.joinRoom(socket.id, roomCode.toUpperCase(), name.trim(), device);
    if (result.error) return emitError(socket, result.error, result.error);

    const { room, player } = result;
    socket.join(room.roomCode);

    socket.emit('session_joined', {
      roomCode: room.roomCode,
      playerId: socket.id,
      players: gm.publicPlayers(room),
      settings: room.settings,
    });

    io.to(room.roomCode).emit('player_joined', {
      player: { id: player.id, name: player.name, connected: true },
      players: gm.publicPlayers(room),
    });
  });

  // ── reconnect_session ──────────────────────────────────────────────────────
  socket.on('reconnect_session', ({ roomCode, playerId, name } = {}) => {
    if (!roomCode || !playerId) return emitError(socket, 'INVALID_SESSION', 'Session data missing');

    const result = gm.reconnectPlayer(socket.id, roomCode.toUpperCase(), playerId, name);
    if (result.error) return emitError(socket, result.error, result.error);

    const { room, wasHost } = result;
    socket.join(room.roomCode);

    // Update device info on reconnect (same player, possibly different browser tab)
    const player = room.players.find(p => p.id === socket.id);
    if (player) player.device = extractDevice(socket);

    io.to(room.roomCode).emit('player_joined', {
      player: { id: socket.id, name: result.player.name, connected: true },
      players: gm.publicPlayers(room),
    });

    let sc = { submitted: 0, total: room.players.filter(p => p.connected).length };
    if (room.currentQuestion && room.phase) {
      const phase = (room.phase === 'ranking' || room.phase === 'ranking_reveal') ? 'ranking' : 'vote';
      const answers = phase === 'ranking' ? room.answers : room.voteAnswers;
      const active = room.players.filter(p => p.connected);
      const submitted = Object.keys(answers[room.currentQuestion.id] || {})
        .filter(pid => active.some(p => p.id === pid)).length;
      sc = { submitted, total: active.length };
    }

    socket.emit('session_reconnected', {
      players: gm.publicPlayers(room),
      settings: room.settings,
      status: room.status,
      phase: room.phase,
      currentQuestion: room.currentQuestion,
      currentResults: room.currentResults,
      submitCount: sc,
      roundsCompleted: room.roundsCompleted,
      isHost: wasHost || room.hostId === socket.id,
      gamePaused: room.gamePaused,
    });

    const connected = room.players.filter(p => p.connected).length;
    if (room.gamePaused && connected >= 3) {
      room.gamePaused = false;
      io.to(room.roomCode).emit('game_resumed', { players: gm.publicPlayers(room) });
    }
  });

  // ── update_setting ─────────────────────────────────────────────────────────
  socket.on('update_setting', ({ key, value } = {}) => {
    const room = gm.getRoomByPlayer(socket.id);
    if (!room) return emitError(socket, 'NOT_IN_ROOM', 'Not in a room');
    if (!gm.isHost(room, socket.id)) return emitError(socket, 'NOT_HOST', 'Only the host can change settings');
    if (room.status !== 'lobby') return emitError(socket, 'GAME_STARTED', 'Cannot change settings after game starts');

    gm.updateSetting(room, key, value);
    io.to(room.roomCode).emit('setting_updated', { key, value });
  });

  // ── start_game ─────────────────────────────────────────────────────────────
  socket.on('start_game', async () => {
    const room = gm.getRoomByPlayer(socket.id);
    if (!room) return emitError(socket, 'NOT_IN_ROOM', 'Not in a room');
    if (!gm.isHost(room, socket.id)) return emitError(socket, 'NOT_HOST', 'Only the host can start');
    if (room.status !== 'lobby') return emitError(socket, 'ALREADY_STARTED', 'Game already started');

    const connected = room.players.filter(p => p.connected).length;
    if (connected < 3) return emitError(socket, 'NOT_ENOUGH_PLAYERS', 'Need at least 3 players');

    const payload = gm.startGame(room);

    // ── Persist new GameSession ─────────────────────────────────────────────
    try {
      const session = await GameSession.create({
        roomCode: room.roomCode,
        settings: room.settings,
        players: room.players.map(p => ({
          socketId: p.id,
          name: p.name,
          isHost: p.id === room.hostId,
          device: p.device || {},
          joinedAt: p.joinedAt || new Date(),
        })),
        startedAt: new Date(),
        status: 'playing',
      });
      room.gameSessionId = session._id;
    } catch (err) {
      console.error('DB: GameSession create failed:', err.message);
    }

    io.to(room.roomCode).emit('game_started', payload);
  });

  // ── submit_ranking ─────────────────────────────────────────────────────────
  socket.on('submit_ranking', async ({ questionId, value } = {}) => {
    const room = gm.getRoomByPlayer(socket.id);
    if (!room) return emitError(socket, 'NOT_IN_ROOM', 'Not in a room');
    if (room.phase !== 'ranking') return emitError(socket, 'WRONG_PHASE', 'Not in ranking phase');
    if (room.currentQuestion?.id !== questionId) return emitError(socket, 'WRONG_QUESTION', 'Question mismatch');
    if (room.answers[questionId]?.[socket.id] !== undefined) return;

    const v = parseInt(value, 10);
    if (isNaN(v) || v < 1 || v > 5) return emitError(socket, 'INVALID_VALUE', 'Value must be 1–5');

    const submitCount = gm.submitRanking(room, socket.id, questionId, v);
    io.to(room.roomCode).emit('submit_count_updated', submitCount);

    // ── Persist answer immediately ──────────────────────────────────────────
    const player = room.players.find(p => p.id === socket.id);
    const q = room.currentQuestion;
    await saveAnswers([{
      roomCode: room.roomCode,
      gameSessionId: room.gameSessionId,
      roundIndex: room.rankingIndex,
      questionId: q.id,
      questionType: 'ranking',
      questionText: q.text,
      questionTags: q.tags,
      playerSocketId: socket.id,
      playerName: player?.name ?? '?',
      device: player?.device ?? {},
      rankingValue: v,
      submittedAt: new Date(),
    }]);
  });

  // ── submit_vote ────────────────────────────────────────────────────────────
  socket.on('submit_vote', async ({ questionId, targetId } = {}) => {
    const room = gm.getRoomByPlayer(socket.id);
    if (!room) return emitError(socket, 'NOT_IN_ROOM', 'Not in a room');
    if (room.phase !== 'vote') return emitError(socket, 'WRONG_PHASE', 'Not in vote phase');
    if (room.currentQuestion?.id !== questionId) return emitError(socket, 'WRONG_QUESTION', 'Question mismatch');
    if (room.voteAnswers[questionId]?.[socket.id] !== undefined) return;

    const targetExists = room.players.some(p => p.id === targetId);
    if (!targetExists) return emitError(socket, 'INVALID_TARGET', 'Target player not found');

    const submitCount = gm.submitVote(room, socket.id, questionId, targetId);
    io.to(room.roomCode).emit('submit_count_updated', submitCount);

    // ── Persist vote immediately ────────────────────────────────────────────
    const player = room.players.find(p => p.id === socket.id);
    const target = room.players.find(p => p.id === targetId);
    const q = room.currentQuestion;
    await saveAnswers([{
      roomCode: room.roomCode,
      gameSessionId: room.gameSessionId,
      roundIndex: room.voteIndex,
      questionId: q.id,
      questionType: 'vote',
      questionText: q.text,
      questionTags: q.tags,
      playerSocketId: socket.id,
      playerName: player?.name ?? '?',
      device: player?.device ?? {},
      votedForSocketId: targetId,
      votedForName: target?.name ?? '?',
      isSelfVote: socket.id === targetId,
      submittedAt: new Date(),
    }]);
  });

  // ── reveal_results ─────────────────────────────────────────────────────────
  socket.on('reveal_results', async () => {
    const room = gm.getRoomByPlayer(socket.id);
    if (!room) return emitError(socket, 'NOT_IN_ROOM', 'Not in a room');
    if (!gm.isHost(room, socket.id)) return emitError(socket, 'NOT_HOST', 'Only the host can reveal');

    const phase = room.phase === 'ranking' ? 'ranking' : 'vote';
    const results = gm.buildResults(room, phase);
    const revealedAt = new Date();

    io.to(room.roomCode).emit('results_revealed', {
      phase: room.phase,
      results,
    });

    // ── Stamp all answers for this question with the reveal timestamp ────────
    try {
      await Answer.updateMany(
        {
          roomCode: room.roomCode,
          questionId: room.currentQuestion.id,
          revealedAt: null,
        },
        { $set: { revealedAt } }
      );
    } catch (err) {
      console.error('DB: revealedAt stamp failed:', err.message);
    }
  });

  // ── next_question ──────────────────────────────────────────────────────────
  socket.on('next_question', () => {
    const room = gm.getRoomByPlayer(socket.id);
    if (!room) return emitError(socket, 'NOT_IN_ROOM', 'Not in a room');
    if (!gm.isHost(room, socket.id)) return emitError(socket, 'NOT_HOST', 'Only the host can advance');

    const result = gm.nextQuestion(room);
    if (result.action === 'next_question') {
      io.to(room.roomCode).emit('next_question_started', {
        phase: result.phase,
        question: result.question,
        submitCount: result.submitCount,
      });
    }
  });

  // ── end_game ───────────────────────────────────────────────────────────────
  socket.on('end_game', async () => {
    const room = gm.getRoomByPlayer(socket.id);
    if (!room) return emitError(socket, 'NOT_IN_ROOM', 'Not in a room');
    if (!gm.isHost(room, socket.id)) return emitError(socket, 'NOT_HOST', 'Only the host can end');
    if (room.roundsCompleted < 1) return emitError(socket, 'TOO_EARLY', 'Complete at least one round first');

    const stats = gm.computeStats(room);
    io.to(room.roomCode).emit('game_ended', { stats });

    // ── Finalise GameSession ────────────────────────────────────────────────
    if (room.gameSessionId) {
      try {
        await GameSession.findByIdAndUpdate(room.gameSessionId, {
          status: 'finished',
          endedAt: new Date(),
          totalRoundsCompleted: room.roundsCompleted,
          finalStats: stats,
        });
      } catch (err) {
        console.error('DB: GameSession finalise failed:', err.message);
      }
    }
  });

  // ── leave_lobby ────────────────────────────────────────────────────────────
  socket.on('leave_lobby', () => {
    const room = gm.getRoomByPlayer(socket.id);
    if (!room) return;
    if (!gm.isHost(room, socket.id)) return;
    if (room.status !== 'lobby') return;

    io.to(room.roomCode).emit('room_destroyed', {});
    gm.destroyRoom(room.roomCode);
  });

  // ── disconnect ─────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const { room, isHost, immediate } = gm.handleDisconnect(socket.id, (expiredRoom, expiredIsHost, expiredId) => {
      if (expiredIsHost) {
        const { newHostId, belowMin } = gm.removePlayer(expiredRoom, expiredId);
        if (expiredRoom.players.length === 0) {
          gm.destroyRoom(expiredRoom.roomCode);
          return;
        }
        if (newHostId) io.to(expiredRoom.roomCode).emit('host_changed', { newHostId });
        io.to(expiredRoom.roomCode).emit('player_left', {
          playerId: expiredId,
          players: gm.publicPlayers(expiredRoom),
        });
        if (belowMin) io.to(expiredRoom.roomCode).emit('game_paused', { reason: 'NOT_ENOUGH_PLAYERS' });
      } else {
        const { newHostId, belowMin } = gm.removePlayer(expiredRoom, expiredId);
        if (newHostId) io.to(expiredRoom.roomCode).emit('host_changed', { newHostId });
        io.to(expiredRoom.roomCode).emit('player_left', {
          playerId: expiredId,
          players: gm.publicPlayers(expiredRoom),
        });
        if (belowMin) io.to(expiredRoom.roomCode).emit('game_paused', { reason: 'NOT_ENOUGH_PLAYERS' });
      }
    });

    if (!room) return;

    if (isHost && immediate) {
      io.to(room.roomCode).emit('room_destroyed', {});
      gm.destroyRoom(room.roomCode);
      return;
    }

    io.to(room.roomCode).emit('player_left', {
      playerId: socket.id,
      players: gm.publicPlayers(room),
    });
  });
});

// ── Boot ───────────────────────────────────────────────────────────────────
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Verdikt server running on port ${PORT}`);
  });
});
