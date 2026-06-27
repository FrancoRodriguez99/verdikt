/** @type {Record<string, Record<'en'|'it'|'es', string>>} */
const translations = {
  // ── App / generic ──────────────────────────────────────────────────────────
  appName: { en: 'Verdikt', it: 'Verdikt', es: 'Verdikt' },
  back: { en: 'Back', it: 'Indietro', es: 'Atrás' },
  loading: { en: 'Loading…', it: 'Caricamento…', es: 'Cargando…' },
  error: { en: 'Error', it: 'Errore', es: 'Error' },
  goHome: { en: 'Go to Home', it: 'Vai alla home', es: 'Ir al inicio' },
  clearSession: { en: 'Leave / Clear Session', it: 'Esci / Cancella sessione', es: 'Salir / Borrar sesión' },
  reconnecting: { en: 'Reconnecting…', it: 'Riconnessione in corso…', es: 'Reconectando…' },

  // ── Language names ─────────────────────────────────────────────────────────
  langEn: { en: 'EN', it: 'EN', es: 'EN' },
  langIt: { en: 'IT', it: 'IT', es: 'IT' },
  langEs: { en: 'ES', it: 'ES', es: 'ES' },

  // ── Landing ────────────────────────────────────────────────────────────────
  landingTagline: {
    en: 'The party game that reveals who you really are.',
    it: 'Il party game che rivela chi sei davvero.',
    es: 'El juego de fiesta que revela quién eres de verdad.',
  },
  hostGame: { en: 'Host Game', it: 'Crea Partita', es: 'Crear Partida' },
  joinGame: { en: 'Join Game', it: 'Unisciti', es: 'Unirse' },
  yourName: { en: 'Your name', it: 'Il tuo nome', es: 'Tu nombre' },
  enterName: { en: 'Enter your name', it: 'Inserisci il tuo nome', es: 'Ingresa tu nombre' },
  host: { en: 'Host', it: 'Ospite', es: 'Anfitrión' },

  // ── Join ───────────────────────────────────────────────────────────────────
  joinTitle: { en: 'Join a Game', it: 'Unisciti a una partita', es: 'Unirse a una partida' },
  roomCode: { en: 'Room Code', it: 'Codice stanza', es: 'Código de sala' },
  enterRoomCode: { en: 'Enter room code', it: 'Inserisci il codice', es: 'Ingresa el código' },
  join: { en: 'Join', it: 'Entra', es: 'Entrar' },
  nameRequired: { en: 'Please enter your name.', it: 'Inserisci il tuo nome.', es: 'Por favor ingresa tu nombre.' },
  codeRequired: { en: 'Please enter the room code.', it: 'Inserisci il codice stanza.', es: 'Por favor ingresa el código.' },

  // ── Lobby ──────────────────────────────────────────────────────────────────
  lobby: { en: 'Lobby', it: 'Lobby', es: 'Sala de espera' },
  waitingForPlayers: { en: 'Waiting for players…', it: 'In attesa di giocatori…', es: 'Esperando jugadores…' },
  waitingForHost: { en: 'Waiting for the host to start the game…', it: 'In attesa che l\'ospite avvii il gioco…', es: 'Esperando que el anfitrión inicie el juego…' },
  players: { en: 'Players', it: 'Giocatori', es: 'Jugadores' },
  startGame: { en: 'Start Game', it: 'Inizia il gioco', es: 'Iniciar juego' },
  leaveLobby: { en: 'Leave Lobby', it: 'Lascia la lobby', es: 'Salir de la sala' },
  needMorePlayers: {
    en: 'Need at least 3 players to start.',
    it: 'Servono almeno 3 giocatori per iniziare.',
    es: 'Se necesitan al menos 3 jugadores para empezar.',
  },
  scanToJoin: { en: 'Scan to join', it: 'Scansiona per unirti', es: 'Escanea para unirte' },
  orEnterCode: { en: 'or enter code:', it: 'o inserisci il codice:', es: 'o ingresa el código:' },

  // ── Settings toggles ───────────────────────────────────────────────────────
  settingVotes: { en: 'Vote Rounds', it: 'Round di voto', es: 'Rondas de votación' },
  settingVotesOn: { en: 'ON', it: 'ON', es: 'ON' },
  settingVotesOff: { en: 'OFF', it: 'OFF', es: 'OFF' },
  settingVotesDesc: {
    en: 'Each round also includes a "vote for a player" question',
    it: 'Ogni round include anche una domanda "vota un giocatore"',
    es: 'Cada ronda incluye también una pregunta "vota por un jugador"',
  },
  settingMode: { en: 'Results Mode', it: 'Modalità risultati', es: 'Modo de resultados' },
  settingPublic: { en: 'Public', it: 'Pubblico', es: 'Público' },
  settingAnonymous: { en: 'Anonymous', it: 'Anonimo', es: 'Anónimo' },
  settingModeDesc: {
    en: 'Public shows who answered what. Anonymous hides names.',
    it: 'Pubblico mostra chi ha risposto cosa. Anonimo nasconde i nomi.',
    es: 'Público muestra quién respondió qué. Anónimo oculta los nombres.',
  },
  settingsLockedAfterStart: {
    en: 'Settings cannot be changed after the game starts.',
    it: 'Le impostazioni non possono essere modificate dopo l\'inizio del gioco.',
    es: 'Los ajustes no se pueden cambiar después de que comience el juego.',
  },

  // ── Ranking question ───────────────────────────────────────────────────────
  rankingQuestion: { en: 'Statement', it: 'Affermazione', es: 'Afirmación' },
  stronglyDisagree: { en: 'Strongly Disagree', it: 'Fortemente in disaccordo', es: 'Muy en desacuerdo' },
  disagree: { en: 'Disagree', it: 'In disaccordo', es: 'En desacuerdo' },
  neutral: { en: 'Neutral', it: 'Neutrale', es: 'Neutral' },
  agree: { en: 'Agree', it: 'D\'accordo', es: 'De acuerdo' },
  stronglyAgree: { en: 'Strongly Agree', it: 'Fortemente d\'accordo', es: 'Muy de acuerdo' },
  submitAnswer: { en: 'Submit', it: 'Conferma', es: 'Confirmar' },
  answerSubmitted: { en: 'Answer submitted! Waiting for others…', it: 'Risposta inviata! In attesa degli altri…', es: 'Respuesta enviada. Esperando a los demás…' },

  // ── Vote question ──────────────────────────────────────────────────────────
  voteQuestion: { en: 'Vote', it: 'Vota', es: 'Votación' },
  voteFor: { en: 'Vote for a player:', it: 'Vota per un giocatore:', es: 'Vota por un jugador:' },
  voteSubmitted: { en: 'Vote submitted! Waiting for others…', it: 'Voto inviato! In attesa degli altri…', es: 'Voto enviado. Esperando a los demás…' },

  // ── Waiting indicator ──────────────────────────────────────────────────────
  xOfYAnswered: { en: '{x} / {y} answered', it: '{x} / {y} hanno risposto', es: '{x} / {y} respondieron' },
  allAnswered: { en: 'Everyone answered!', it: 'Tutti hanno risposto!', es: '¡Todos respondieron!' },
  revealResults: { en: 'Reveal Results', it: 'Rivela i risultati', es: 'Revelar resultados' },

  // ── Results ────────────────────────────────────────────────────────────────
  results: { en: 'Results', it: 'Risultati', es: 'Resultados' },
  rankingResultsTitle: { en: 'Where does everyone stand?', it: 'Dove si trova ognuno?', es: '¿Dónde está cada quién?' },
  voteResultsTitle: { en: 'The votes are in!', it: 'I voti sono arrivati!', es: '¡Los votos están contados!' },
  votes: { en: 'votes', it: 'voti', es: 'votos' },
  oneVote: { en: 'vote', it: 'voto', es: 'voto' },
  votedFor: { en: 'Voted for by', it: 'Votato da', es: 'Votado por' },
  noVotes: { en: 'No votes', it: 'Nessun voto', es: 'Sin votos' },
  nextQuestion: { en: 'Next Question', it: 'Prossima domanda', es: 'Siguiente pregunta' },
  endGame: { en: 'End Game', it: 'Termina partita', es: 'Terminar juego' },
  hostWillReveal: { en: 'Waiting for host to reveal results…', it: 'In attesa che l\'ospite riveli i risultati…', es: 'Esperando que el anfitrión revele los resultados…' },
  hostWillAdvance: { en: 'Waiting for host to continue…', it: 'In attesa che l\'ospite continui…', es: 'Esperando que el anfitrión continúe…' },

  // ── Ranking scale labels ───────────────────────────────────────────────────
  scaleLabelLeft: { en: 'Strongly Disagree', it: 'Fortemente contrario', es: 'Muy en desacuerdo' },
  scaleLabelRight: { en: 'Strongly Agree', it: 'Fortemente d\'accordo', es: 'Muy de acuerdo' },

  // ── Final stats ────────────────────────────────────────────────────────────
  finalTitle: { en: 'Game Over', it: 'Fine partita', es: 'Fin del juego' },
  finalSubtitle: { en: "Here's what we learned about each other.", it: "Ecco cosa abbiamo imparato l'uno sull'altro.", es: 'Esto es lo que aprendimos el uno del otro.' },
  agreementTitle: { en: 'Most & Least Agreeable Pairs', it: 'Coppie più e meno in accordo', es: 'Pares más y menos de acuerdo' },
  mostAgreeing: { en: 'Most agreeing', it: 'Più in accordo', es: 'Más en acuerdo' },
  leastAgreeing: { en: 'Most disagreeing', it: 'Meno in accordo', es: 'Más en desacuerdo' },
  agreedPercent: { en: 'agreed {pct}% of the time', it: 'in accordo il {pct}% delle volte', es: 'de acuerdo el {pct}% de las veces' },
  personalityTitle: { en: 'Personality Results', it: 'Risultati di personalità', es: 'Resultados de personalidad' },
  rankingPersonality: { en: 'From Statements', it: 'Dalle affermazioni', es: 'De las afirmaciones' },
  votePersonality: { en: 'From Votes', it: 'Dai voti', es: 'De los votos' },
  noTags: { en: 'No clear profile yet.', it: 'Nessun profilo chiaro ancora.', es: 'Sin perfil claro aún.' },
  selfVoteTitle: { en: 'Self-confidence Award 🏆', it: 'Premio Autostima 🏆', es: 'Premio Autoconfianza 🏆' },
  selfVoteMsg: {
    en: '{name} voted for themselves {n} times — confidence level: maximum.',
    it: '{name} ha votato per sé stesso {n} volte — livello di fiducia: massimo.',
    es: '{name} votó por sí mismo {n} veces — nivel de confianza: máximo.',
  },
  playAgain: { en: 'Play Again', it: 'Gioca ancora', es: 'Jugar de nuevo' },
  roundsPlayed: { en: 'Rounds played: {n}', it: 'Round giocati: {n}', es: 'Rondas jugadas: {n}' },

  // ── Game paused ────────────────────────────────────────────────────────────
  gamePaused: { en: 'Game Paused', it: 'Partita in pausa', es: 'Juego pausado' },
  gamePausedReason: {
    en: 'Not enough players connected. Waiting for players to reconnect or the host to end the game.',
    it: 'Non ci sono abbastanza giocatori connessi. In attesa che i giocatori si riconnettano o che l\'ospite termini il gioco.',
    es: 'No hay suficientes jugadores conectados. Esperando que los jugadores se reconecten o el anfitrión termine el juego.',
  },

  // ── Personality tag labels ─────────────────────────────────────────────────
  tag_pragmatic: { en: 'Pragmatic', it: 'Pragmatico', es: 'Pragmático' },
  tag_idealist: { en: 'Idealist', it: 'Idealista', es: 'Idealista' },
  tag_romantic: { en: 'Romantic', it: 'Romantico', es: 'Romántico' },
  tag_realist: { en: 'Realist', it: 'Realista', es: 'Realista' },
  tag_loyal: { en: 'Loyal', it: 'Leale', es: 'Leal' },
  tag_social: { en: 'Social', it: 'Sociale', es: 'Social' },
  tag_resilient: { en: 'Resilient', it: 'Resiliente', es: 'Resiliente' },
  tag_charismatic: { en: 'Charismatic', it: 'Carismatico', es: 'Carismático' },
  tag_ambitious: { en: 'Ambitious', it: 'Ambizioso', es: 'Ambicioso' },
  tag_adventurous: { en: 'Adventurous', it: 'Avventuroso', es: 'Aventurero' },
  tag_analytical: { en: 'Analytical', it: 'Analitico', es: 'Analítico' },
  tag_empathetic: { en: 'Empathetic', it: 'Empatico', es: 'Empático' },
  tag_creative: { en: 'Creative', it: 'Creativo', es: 'Creativo' },
  tag_optimistic: { en: 'Optimistic', it: 'Ottimista', es: 'Optimista' },
  tag_cautious: { en: 'Cautious', it: 'Cauto', es: 'Cauteloso' },

  // ── Errors ─────────────────────────────────────────────────────────────────
  errorTitle: { en: 'Something went wrong', it: 'Qualcosa è andato storto', es: 'Algo salió mal' },
  err_ROOM_NOT_FOUND: {
    en: 'Room not found. The game may have ended or the code is wrong.',
    it: 'Stanza non trovata. Il gioco potrebbe essere terminato o il codice è errato.',
    es: 'Sala no encontrada. El juego puede haber terminado o el código es incorrecto.',
  },
  err_GAME_ALREADY_STARTED: {
    en: 'This game has already started. You cannot join now.',
    it: 'Questa partita è già iniziata. Non puoi unirti ora.',
    es: 'Este juego ya comenzó. No puedes unirte ahora.',
  },
  err_NOT_ENOUGH_PLAYERS: {
    en: 'Need at least 3 players to start.',
    it: 'Servono almeno 3 giocatori per iniziare.',
    es: 'Se necesitan al menos 3 jugadores para empezar.',
  },
  err_PLAYER_NOT_IN_ROOM: {
    en: 'Your previous session is no longer valid.',
    it: 'La tua sessione precedente non è più valida.',
    es: 'Tu sesión anterior ya no es válida.',
  },
  err_GENERIC: {
    en: 'An unexpected error occurred.',
    it: 'Si è verificato un errore imprevisto.',
    es: 'Ocurrió un error inesperado.',
  },
};

/**
 * Returns a translation function for the given language.
 * Supports {placeholder} interpolation.
 * @param {'en'|'it'|'es'} lang
 * @returns {(key: string, vars?: Record<string, string|number>) => string}
 */
export function makeT(lang) {
  return function t(key, vars = {}) {
    const entry = translations[key];
    if (!entry) return key;
    let str = entry[lang] ?? entry.en ?? key;
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
    return str;
  };
}

export default translations;
