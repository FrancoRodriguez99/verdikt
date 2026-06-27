import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useLang } from '../contexts/LanguageContext';
import WaitingIndicator from '../components/WaitingIndicator';

export default function VoteQuestion() {
  const { t, lang } = useLang();
  const {
    currentQuestion, submitCount, hasSubmitted,
    isHost, submitVote, revealResults, players,
    endGame, roundsCompleted, gamePaused,
  } = useGame();
  const [selected, setSelected] = useState(null);

  if (!currentQuestion) return null;

  const allAnswered = submitCount.submitted >= submitCount.total && submitCount.total > 0;
  const connectedPlayers = players.filter(p => p.connected !== false);

  function handleSubmit() {
    if (!selected || hasSubmitted) return;
    submitVote(currentQuestion.id, selected);
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
              {connectedPlayers.map((p, idx) => (
                <button
                  key={p.id}
                  className={`vote-option${selected === p.id ? ' selected' : ''}`}
                  onClick={() => setSelected(p.id)}
                >
                  <div
                    className="vote-avatar"
                    style={{ background: `hsl(${(idx * 60 + 260) % 360}, 70%, 55%)` }}
                  >
                    {(p.name || '?').charAt(0).toUpperCase()}
                  </div>
                  {p.name}
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
      </div>
    </div>
  );
}
