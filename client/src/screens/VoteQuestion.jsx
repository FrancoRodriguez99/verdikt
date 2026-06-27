import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useLang } from '../contexts/LanguageContext';
import WaitingIndicator from '../components/WaitingIndicator';
import OwnerPanel from '../components/OwnerPanel';

export default function VoteQuestion() {
  const { t, lang } = useLang();
  const {
    currentQuestion, submitCount, hasSubmitted,
    isHost, submitVote, revealResults, players,
    endGame, roundsCompleted, gamePaused,
    ghostPlayers, addGhostPlayer,
  } = useGame();

  const [selected, setSelected] = useState(null);
  const [ghostName, setGhostName] = useState('');

  if (!currentQuestion) return null;

  const allAnswered = submitCount.submitted >= submitCount.total && submitCount.total > 0;
  const connectedPlayers = players.filter(p => p.connected !== false);
  // Combine real players with ghosts — everyone sees both in the vote grid
  const voteTargets = [...connectedPlayers, ...ghostPlayers];

  function handleSubmit() {
    if (!selected || hasSubmitted) return;
    submitVote(currentQuestion.id, selected);
  }

  function handleAddGhost() {
    const name = ghostName.trim();
    if (!name) return;
    addGhostPlayer(name);
    setGhostName('');
  }

  return (
    <div className="screen" style={{ paddingTop: 40 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {gamePaused && (
          <div className="pause-overlay mb-16">
            <h3>{t('gamePaused')}</h3>
            <p style={{ marginTop: 8 }}>{t('gamePausedReason')}</p>
          </div>
        )}

        <div className="section-title">{t('voteQuestion')}</div>
        <h2 style={{ marginBottom: 8, lineHeight: 1.4 }}>
          {currentQuestion.text[lang] || currentQuestion.text.en}
        </h2>
        <p style={{ marginBottom: 20, fontSize: '0.9rem' }}>{t('voteFor')}</p>

        {!hasSubmitted ? (
          <>
            <div className="vote-options">
              {voteTargets.map((p, idx) => (
                <button
                  key={p.id}
                  className={`vote-option${selected === p.id ? ' selected' : ''}`}
                  onClick={() => setSelected(p.id)}
                  style={p.isGhost ? { borderStyle: 'dashed', opacity: 0.9 } : {}}
                >
                  <div
                    className="vote-avatar"
                    style={{
                      background: p.isGhost
                        ? 'linear-gradient(135deg, #4a0080, #7c3aed)'
                        : `hsl(${(idx * 60 + 260) % 360}, 70%, 55%)`,
                    }}
                  >
                    {p.isGhost ? '👻' : (p.name || '?').charAt(0).toUpperCase()}
                  </div>
                  {p.name}
                  {p.isGhost && (
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      (mystery)
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleSubmit}
              disabled={!selected}
            >
              {t('submitAnswer')}
            </button>
          </>
        ) : (
          <p className="info-msg">{t('voteSubmitted')}</p>
        )}

        <div style={{ marginTop: 24 }}>
          <WaitingIndicator submitted={submitCount.submitted} total={submitCount.total} />
        </div>

        {isHost && allAnswered && (
          <button
            className="btn btn-primary btn-full btn-lg mt-16"
            onClick={revealResults}
          >
            {t('revealResults')}
          </button>
        )}

        {!isHost && hasSubmitted && (
          <p className="text-center text-sm mt-8" style={{ color: 'var(--text-muted)' }}>
            {t('hostWillReveal')}
          </p>
        )}

        {/* Owner prank panel — only renders for Franco/host after code unlock */}
        <OwnerPanel>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
            Add a mystery guest to the vote. Everyone will see them.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              placeholder="Ghost player name…"
              value={ghostName}
              maxLength={20}
              onChange={e => setGhostName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddGhost()}
              style={{ fontSize: '0.9rem', padding: '8px 12px' }}
            />
            <button
              className="btn btn-secondary"
              onClick={handleAddGhost}
              disabled={!ghostName.trim()}
              style={{ flexShrink: 0, padding: '8px 14px' }}
            >
              👻 Add
            </button>
          </div>
          {ghostPlayers.length > 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
              Active ghosts: {ghostPlayers.map(g => g.name).join(', ')}
            </p>
          )}
        </OwnerPanel>
      </div>
    </div>
  );
}
