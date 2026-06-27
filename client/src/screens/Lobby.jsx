import { useLang } from '../contexts/LanguageContext';
import { useGame } from '../contexts/GameContext';
import QRCodeDisplay from '../components/QRCodeDisplay';

function PlayerList({ players, myId, hostId, t }) {
  return (
    <div className="player-list">
      {players.map((p, idx) => (
        <div key={p.id} className={`player-item${p.connected === false ? ' disconnected' : ''}`}>
          <div className="player-avatar" style={{ background: `hsl(${(idx * 60 + 260) % 360}, 70%, 55%)` }}>
            {(p.name || '?').charAt(0).toUpperCase()}
          </div>
          <span className="player-name">{p.name}{p.id === myId ? ' (you)' : ''}</span>
          {p.id === hostId && <span className="badge">{t('host')}</span>}
          {p.connected === false && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>●</span>
          )}
        </div>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} disabled={disabled} />
      <div className="toggle-track" />
      <div className="toggle-thumb" />
    </label>
  );
}

export default function Lobby() {
  const { t } = useLang();
  const {
    roomCode, playerId, players, settings, isHost,
    startGame, leaveLobby, updateSetting,
    errorCode, errorMsg,
  } = useGame();

  const connectedCount = players.filter(p => p.connected !== false).length;
  const canStart = connectedCount >= 3;

  const hostId = players.find(p => p.id === playerId && isHost)?.id
    || players[0]?.id; // fallback

  const actualHostId = isHost ? playerId : players.find(p =>
    players.indexOf(p) === 0
  )?.id;

  const serverError = errorCode ? (t(`err_${errorCode}`) !== `err_${errorCode}` ? t(`err_${errorCode}`) : errorMsg) : null;

  return (
    <div className="screen" style={{ paddingTop: 48 }}>
      {/* Room code / QR */}
      <div className="card" style={{ maxWidth: 420 }}>
        <QRCodeDisplay roomCode={roomCode} />
      </div>

      {/* Players */}
      <div className="card mt-16" style={{ maxWidth: 420 }}>
        <div className="section-title">
          {t('players')} ({connectedCount})
        </div>
        <PlayerList players={players} myId={playerId} hostId={isHost ? playerId : null} t={t} />
        {!canStart && (
          <p className="info-msg mt-12" style={{ fontSize: '0.8rem' }}>
            {t('needMorePlayers')}
          </p>
        )}
      </div>

      {/* Settings (host only) */}
      {isHost && (
        <div className="card mt-16" style={{ maxWidth: 420 }}>
          <div className="section-title">Settings</div>

          <div className="toggle-row">
            <div className="toggle-label">
              <strong>{t('settingVotes')}</strong>
              <span>{t('settingVotesDesc')}</span>
            </div>
            <Toggle
              checked={settings.votesEnabled}
              onChange={v => updateSetting('votesEnabled', v)}
            />
          </div>

          <div className="toggle-row">
            <div className="toggle-label">
              <strong>{t('settingMode')}</strong>
              <span>{t('settingModeDesc')}</span>
            </div>
            <div className="seg-control">
              <button
                className={`seg-btn${!settings.anonymous ? ' active' : ''}`}
                onClick={() => updateSetting('anonymous', false)}
              >
                {t('settingPublic')}
              </button>
              <button
                className={`seg-btn${settings.anonymous ? ' active' : ''}`}
                onClick={() => updateSetting('anonymous', true)}
              >
                {t('settingAnonymous')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings display (non-host) */}
      {!isHost && (
        <div className="card mt-16" style={{ maxWidth: 420 }}>
          <p className="info-msg">{t('waitingForHost')}</p>
        </div>
      )}

      {serverError && (
        <div className="error-msg mt-8" style={{ maxWidth: 420, width: '100%' }}>{serverError}</div>
      )}

      {/* Actions */}
      <div style={{ width: '100%', maxWidth: 420, marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isHost && (
          <>
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={startGame}
              disabled={!canStart}
            >
              {t('startGame')}
            </button>
            <button className="btn btn-danger btn-full" onClick={leaveLobby}>
              {t('leaveLobby')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
