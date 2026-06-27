import {
  createContext, useContext, useReducer, useEffect, useCallback, useRef,
} from 'react';
import { useSocket } from './SocketContext';

const LS_KEY = 'verdikt_session';

/** @typedef {'landing'|'join'|'lobby'|'game'|'final'|'error'|'reconnecting'} Screen */

const initialState = {
  /** @type {Screen} */
  screen: 'landing',
  roomCode: null,
  playerId: null,
  playerName: null,
  isHost: false,
  players: [],
  settings: { votesEnabled: true, anonymous: false },
  // Game
  phase: null,
  currentQuestion: null,
  hasSubmitted: false,
  submitCount: { submitted: 0, total: 0 },
  currentResults: null,
  roundsCompleted: 0,
  gamePaused: false,
  // Prank / owner mode
  ownerUnlocked: false,
  ghostPlayers: [],       // fake players injected into current vote
  rankingOverrides: {},   // { [playerId]: newValue } — visual only, current reveal
  // Final
  finalStats: null,
  // Error
  errorCode: null,
  errorMsg: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };

    case 'SESSION_CREATED': {
      const myPlayer = action.players?.find(p => p.id === action.playerId);
      return {
        ...state,
        screen: 'lobby',
        roomCode: action.roomCode,
        playerId: action.playerId,
        playerName: action.name ?? myPlayer?.name ?? state.playerName,
        isHost: true,
        players: action.players,
        settings: action.settings,
        errorCode: null,
        errorMsg: null,
      };
    }

    case 'SESSION_JOINED': {
      const myPlayer = action.players?.find(p => p.id === action.playerId);
      return {
        ...state,
        screen: 'lobby',
        roomCode: action.roomCode,
        playerId: action.playerId,
        playerName: action.name ?? myPlayer?.name ?? state.playerName,
        isHost: false,
        players: action.players,
        settings: action.settings,
        errorCode: null,
        errorMsg: null,
      };
    }

    case 'SESSION_RECONNECTED':
      return {
        ...state,
        screen: action.status === 'finished' ? 'final'
               : action.status === 'playing' ? 'game'
               : 'lobby',
        players: action.players,
        settings: action.settings,
        phase: action.phase,
        currentQuestion: action.currentQuestion,
        currentResults: action.currentResults,
        submitCount: action.submitCount,
        roundsCompleted: action.roundsCompleted,
        isHost: action.isHost,
        gamePaused: action.gamePaused ?? false,
        hasSubmitted: false,
        errorCode: null,
        errorMsg: null,
        finalStats: action.finalStats ?? null,
      };

    case 'PLAYER_JOINED':
    case 'PLAYER_LEFT':
      return { ...state, players: action.players };

    case 'SETTING_UPDATED':
      return {
        ...state,
        settings: { ...state.settings, [action.key]: action.value },
      };

    case 'GAME_STARTED':
      return {
        ...state,
        screen: 'game',
        phase: action.phase,
        currentQuestion: action.question,
        submitCount: action.submitCount,
        hasSubmitted: false,
        currentResults: null,
        gamePaused: false,
        ghostPlayers: [],
        rankingOverrides: {},
        errorCode: null,
        errorMsg: null,
      };

    case 'SUBMIT_COUNT_UPDATED':
      return { ...state, submitCount: action.submitCount };

    case 'SUBMITTED':
      return { ...state, hasSubmitted: true };

    case 'RESULTS_REVEALED':
      return {
        ...state,
        phase: action.phase,
        currentResults: action.results,
      };

    case 'NEXT_QUESTION_STARTED':
      return {
        ...state,
        phase: action.phase,
        currentQuestion: action.question,
        submitCount: action.submitCount,
        hasSubmitted: false,
        currentResults: null,
        ghostPlayers: [],
        rankingOverrides: {},
      };

    case 'UNLOCK_OWNER':
      return { ...state, ownerUnlocked: true };

    case 'GHOST_ADDED':
      return {
        ...state,
        ghostPlayers: [...state.ghostPlayers, action.ghost],
      };

    case 'RANKING_OVERRIDDEN':
      return {
        ...state,
        rankingOverrides: { ...state.rankingOverrides, [action.playerId]: action.newValue },
      };

    case 'GAME_ENDED':
      return {
        ...state,
        screen: 'final',
        finalStats: action.stats,
      };

    case 'HOST_CHANGED':
      return {
        ...state,
        isHost: state.playerId === action.newHostId,
      };

    case 'GAME_PAUSED':
      return { ...state, gamePaused: true };

    case 'GAME_RESUMED':
      return { ...state, gamePaused: false, players: action.players };

    case 'ROOM_DESTROYED':
      return {
        ...initialState,
        screen: 'error',
        errorCode: 'ROOM_DESTROYED',
        errorMsg: 'The host left the game.',
      };

    case 'ERROR':
      return {
        ...state,
        errorCode: action.code,
        errorMsg: action.message,
      };

    case 'FATAL_ERROR':
      return {
        ...state,
        screen: 'error',
        errorCode: action.code,
        errorMsg: action.message,
      };

    case 'CLEAR_ERROR':
      return { ...state, errorCode: null, errorMsg: null };

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const { socket } = useSocket();
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // ── Persist session to localStorage ───────────────────────────────────────
  useEffect(() => {
    if (state.roomCode && state.playerId) {
      localStorage.setItem(LS_KEY, JSON.stringify({
        roomCode: state.roomCode,
        playerId: state.playerId,
        playerName: state.playerName,
        isHost: state.isHost,
      }));
    }
  }, [state.roomCode, state.playerId, state.playerName, state.isHost]);

  // ── Socket event listeners ─────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const on = (event, handler) => {
      socket.on(event, handler);
      return () => socket.off(event, handler);
    };

    const handlers = [
      on('session_created', (data) => {
        dispatch({ type: 'SESSION_CREATED', ...data, name: pendingNameRef.current });
        pendingNameRef.current = null;
      }),

      on('session_joined', (data) => {
        dispatch({ type: 'SESSION_JOINED', ...data, name: pendingNameRef.current });
        pendingNameRef.current = null;
      }),

      on('session_reconnected', (data) => {
        dispatch({ type: 'SESSION_RECONNECTED', ...data });
      }),

      on('player_joined', ({ players }) => {
        dispatch({ type: 'PLAYER_JOINED', players });
      }),

      on('player_left', ({ players }) => {
        dispatch({ type: 'PLAYER_LEFT', players });
      }),

      on('setting_updated', ({ key, value }) => {
        dispatch({ type: 'SETTING_UPDATED', key, value });
      }),

      on('game_started', ({ phase, question, submitCount }) => {
        dispatch({ type: 'GAME_STARTED', phase, question, submitCount });
      }),

      on('submit_count_updated', (submitCount) => {
        dispatch({ type: 'SUBMIT_COUNT_UPDATED', submitCount });
      }),

      on('results_revealed', ({ phase, results }) => {
        dispatch({ type: 'RESULTS_REVEALED', phase, results });
      }),

      on('next_question_started', ({ phase, question, submitCount }) => {
        dispatch({ type: 'NEXT_QUESTION_STARTED', phase, question, submitCount });
      }),

      on('game_ended', ({ stats }) => {
        dispatch({ type: 'GAME_ENDED', stats });
      }),

      on('ghost_added', ({ ghost }) => {
        dispatch({ type: 'GHOST_ADDED', ghost });
      }),

      on('ranking_overridden', ({ playerId, newValue }) => {
        dispatch({ type: 'RANKING_OVERRIDDEN', playerId, newValue });
      }),

      on('host_changed', ({ newHostId }) => {
        dispatch({ type: 'HOST_CHANGED', newHostId });
      }),

      on('game_paused', () => {
        dispatch({ type: 'GAME_PAUSED' });
      }),

      on('game_resumed', ({ players }) => {
        dispatch({ type: 'GAME_RESUMED', players });
      }),

      on('room_destroyed', () => {
        localStorage.removeItem(LS_KEY);
        dispatch({ type: 'ROOM_DESTROYED' });
      }),

      on('error', ({ code, message }) => {
        // Fatal errors that should send to error screen
        const fatalCodes = ['ROOM_NOT_FOUND', 'GAME_ALREADY_STARTED', 'PLAYER_NOT_IN_ROOM'];
        if (fatalCodes.includes(code) && stateRef.current.screen === 'reconnecting') {
          dispatch({ type: 'FATAL_ERROR', code, message });
        } else {
          dispatch({ type: 'ERROR', code, message });
        }
      }),
    ];

    return () => handlers.forEach(off => off());
  }, [socket]);

  // ── Attempt reconnection on first connect ──────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const tryReconnect = () => {
      const stored = localStorage.getItem(LS_KEY);
      if (!stored) return;
      try {
        const session = JSON.parse(stored);
        if (session.roomCode && session.playerId) {
          dispatch({ type: 'SET_SCREEN', screen: 'reconnecting' });
          socket.emit('reconnect_session', {
            roomCode: session.roomCode,
            playerId: session.playerId,
            name: session.playerName,
          });
        }
      } catch {
        localStorage.removeItem(LS_KEY);
      }
    };

    socket.on('connect', tryReconnect);
    // If already connected when effect runs
    if (socket.connected) tryReconnect();

    return () => socket.off('connect', tryReconnect);
  }, [socket]);

  // ── Action creators ────────────────────────────────────────────────────────
  // Store pending name so session_created can populate the playerName field
  const pendingNameRef = useRef(null);

  const createRoom = useCallback((name) => {
    dispatch({ type: 'CLEAR_ERROR' });
    pendingNameRef.current = name;
    socket?.emit('create_room', { name });
  }, [socket]);

  const joinRoom = useCallback((roomCode, name) => {
    dispatch({ type: 'CLEAR_ERROR' });
    pendingNameRef.current = name;
    socket?.emit('join_room', { roomCode, name });
  }, [socket]);

  const updateSetting = useCallback((key, value) => {
    socket?.emit('update_setting', { key, value });
  }, [socket]);

  const startGame = useCallback(() => {
    socket?.emit('start_game');
  }, [socket]);

  const submitRanking = useCallback((questionId, value) => {
    socket?.emit('submit_ranking', { questionId, value });
    dispatch({ type: 'SUBMITTED' });
  }, [socket]);

  const submitVote = useCallback((questionId, targetId) => {
    socket?.emit('submit_vote', { questionId, targetId });
    dispatch({ type: 'SUBMITTED' });
  }, [socket]);

  const revealResults = useCallback(() => {
    socket?.emit('reveal_results');
  }, [socket]);

  const nextQuestion = useCallback(() => {
    socket?.emit('next_question');
  }, [socket]);

  const endGame = useCallback(() => {
    socket?.emit('end_game');
  }, [socket]);

  const leaveLobby = useCallback(() => {
    socket?.emit('leave_lobby');
    localStorage.removeItem(LS_KEY);
    dispatch({ type: 'RESET' });
  }, [socket]);

  const clearSession = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    dispatch({ type: 'RESET' });
  }, []);

  const unlockOwner = useCallback(() => {
    dispatch({ type: 'UNLOCK_OWNER' });
  }, []);

  const addGhostPlayer = useCallback((name) => {
    socket?.emit('prank_add_ghost', { name });
  }, [socket]);

  const overrideRankingAnswer = useCallback((playerId, newValue) => {
    socket?.emit('prank_ranking_override', { playerId, newValue });
  }, [socket]);

  const goToJoin = useCallback(() => {
    dispatch({ type: 'SET_SCREEN', screen: 'join' });
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const goToLanding = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value = {
    ...state,
    createRoom,
    joinRoom,
    updateSetting,
    startGame,
    submitRanking,
    submitVote,
    revealResults,
    nextQuestion,
    endGame,
    leaveLobby,
    clearSession,
    goToJoin,
    goToLanding,
    unlockOwner,
    addGhostPlayer,
    overrideRankingAnswer,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}
