import { useGame } from '../contexts/GameContext';
import { useLang } from '../contexts/LanguageContext';
import PlayerField from '../components/PlayerField';

export default function RankingResults() {
  const { t, lang } = useLang();
  const {
    currentQuestion, currentResults, isHost,
    nextQuestion, endGame, roundsCompleted, gamePaused,
  } = useGame();

  if (!currentResults || currentResults.type !== 'ranking') return null;

  const { playerAnswers } = currentResults;

  const LABELS = [
    t('stronglyDisagree'),
    t('disagree'),
    t('neutral'),
    t('agree'),
    t('stronglyAgree'),
  ];

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
        <p style={{ marginBottom: 20, fontSize: '0.85rem' }}>{t('rankingResultsTitle')}</p>

        {/* Scale labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, padding: '0 5%' }}>
          {LABELS.map((l, i) => (
            <span key={i} style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center', flex: 1 }}>{l}</span>
          ))}
        </div>

        <PlayerField playerAnswers={playerAnswers} />

        {/* Detail list */}
        <div className="card mt-8" style={{ padding: '12px 16px' }}>
          {playerAnswers.map(p => (
            <div key={p.playerId} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 600 }}>{p.label}</span>
              <span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>
                {p.value ? LABELS[p.value - 1] : '—'}
              </span>
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
