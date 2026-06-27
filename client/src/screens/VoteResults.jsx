import { useGame } from '../contexts/GameContext';
import { useLang } from '../contexts/LanguageContext';

export default function VoteResults() {
  const { t, lang } = useLang();
  const {
    currentQuestion, currentResults, isHost, settings,
    nextQuestion, endGame, roundsCompleted, gamePaused,
  } = useGame();

  if (!currentResults || currentResults.type !== 'vote') return null;

  const { ranked } = currentResults;
  const maxVotes = Math.max(1, ...ranked.map(r => r.votes));

  return (
    <div className="screen" style={{ paddingTop: 40 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {gamePaused && (
          <div className="pause-overlay mb-16">
            <h3>{t('gamePaused')}</h3>
            <p style={{ marginTop: 8 }}>{t('gamePausedReason')}</p>
          </div>
        )}

        <div className="section-title">{t('results')}</div>
        <h2 style={{ marginBottom: 8, lineHeight: 1.4 }}>
          {currentQuestion?.text[lang] || currentQuestion?.text.en}
        </h2>
        <p style={{ marginBottom: 20, fontSize: '0.85rem' }}>{t('voteResultsTitle')}</p>

        <div className="card">
          {ranked.map((entry, idx) => (
            <div key={entry.playerId} className="vote-result-row">
              <div style={{ width: 28, textAlign: 'center', fontWeight: 800, color: idx === 0 && entry.votes > 0 ? 'var(--primary-light)' : 'var(--text-muted)' }}>
                {idx + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{entry.label}</div>
                {!settings.anonymous && entry.voters?.length > 0 && (
                  <div className="vote-attribution">
                    {t('votedFor')}: {entry.voters.join(', ')}
                  </div>
                )}
              </div>
              <div className="vote-bar-wrap" style={{ width: 80 }}>
                <div
                  className="vote-bar-fill"
                  style={{ width: `${(entry.votes / maxVotes) * 100}%` }}
                />
              </div>
              <div className="vote-count-label">
                {entry.votes} {entry.votes === 1 ? t('oneVote') : t('votes')}
              </div>
            </div>
          ))}
        </div>

        {isHost && !gamePaused && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
            <button className="btn btn-primary btn-full btn-lg" onClick={nextQuestion}>
              {t('nextQuestion')}
            </button>
            {roundsCompleted >= 1 && (
              <button className="btn btn-ghost btn-full" onClick={endGame}>
                {t('endGame')}
              </button>
            )}
          </div>
        )}

        {!isHost && (
          <p className="info-msg mt-24">{t('hostWillAdvance')}</p>
        )}
      </div>
    </div>
  );
}
