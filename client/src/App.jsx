import { useEffect } from 'react';
import { useGame } from './contexts/GameContext';
import { useLang } from './contexts/LanguageContext';
import LanguageSelector from './components/LanguageSelector';
import Landing from './screens/Landing';
import JoinGame from './screens/JoinGame';
import Lobby from './screens/Lobby';
import RankingQuestion from './screens/RankingQuestion';
import RankingResults from './screens/RankingResults';
import VoteQuestion from './screens/VoteQuestion';
import VoteResults from './screens/VoteResults';
import FinalStats from './screens/FinalStats';

function ReconnectingScreen() {
  const { t } = useLang();
  const { clearSession } = useGame();
  return (
    <div className="screen screen-center">
      <LanguageSelector />
      <p style={{ color: 'var(--text-secondary)' }}>{t('reconnecting')}</p>
      <button className="btn btn-ghost mt-24" onClick={clearSession}>{t('clearSession')}</button>
    </div>
  );
}

function SessionExpiredScreen() {
  const { t } = useLang();
  const { roomCode, playerName, rejoinGame, clearSession, goToLanding } = useGame();

  function handleRejoin() {
    if (roomCode && playerName) rejoinGame(roomCode, playerName);
  }

  return (
    <div className="screen screen-center">
      <LanguageSelector />
      <div className="card" style={{ maxWidth: 400, textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⏱️</div>
        <h2 style={{ marginBottom: 12 }}>{t('sessionExpiredTitle')}</h2>
        <p style={{ marginBottom: 24 }}>{t('sessionExpiredMsg')}</p>

        {roomCode && playerName && (
          <button
            className="btn btn-primary btn-full btn-lg"
            style={{ marginBottom: 10 }}
            onClick={handleRejoin}
          >
            {t('rejoinAs', { name: playerName })}
          </button>
        )}

        <button
          className="btn btn-ghost btn-full"
          onClick={() => { clearSession(); goToLanding(); }}
        >
          {t('clearSession')}
        </button>
      </div>
    </div>
  );
}

function ErrorScreen() {
  const { errorCode, errorMsg, clearSession, goToLanding } = useGame();
  const { t } = useLang();

  const msg = t(`err_${errorCode}`) !== `err_${errorCode}`
    ? t(`err_${errorCode}`)
    : errorMsg || t('err_GENERIC');

  return (
    <div className="screen screen-center">
      <LanguageSelector />
      <div className="card" style={{ maxWidth: 400, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger)', marginBottom: 12 }}>{t('errorTitle')}</h2>
        <p style={{ marginBottom: 24 }}>{msg}</p>
        <button className="btn btn-primary btn-full" onClick={() => { clearSession(); goToLanding(); }}>
          {t('goHome')}
        </button>
      </div>
    </div>
  );
}

function GameRouter() {
  const { phase } = useGame();
  if (phase === 'ranking') return <RankingQuestion />;
  if (phase === 'ranking_reveal') return <RankingResults />;
  if (phase === 'vote') return <VoteQuestion />;
  if (phase === 'vote_reveal') return <VoteResults />;
  return null;
}

function useRoomParam() {
  const { goToJoin } = useGame();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) {
      goToJoin();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

export default function App() {
  const { screen } = useGame();
  useRoomParam();

  return (
    <>
      <LanguageSelector />
      {screen === 'landing'         && <Landing />}
      {screen === 'join'            && <JoinGame />}
      {screen === 'lobby'           && <Lobby />}
      {screen === 'game'            && <GameRouter />}
      {screen === 'final'           && <FinalStats />}
      {screen === 'reconnecting'    && <ReconnectingScreen />}
      {screen === 'session_expired' && <SessionExpiredScreen />}
      {screen === 'error'           && <ErrorScreen />}
    </>
  );
}
