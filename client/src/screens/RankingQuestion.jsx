import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useLang } from '../contexts/LanguageContext';
import WaitingIndicator from '../components/WaitingIndicator';

const ANSWER_LABELS = [
  { value: 1, key: 'stronglyDisagree' },
  { value: 2, key: 'disagree' },
  { value: 3, key: 'neutral' },
  { value: 4, key: 'agree' },
  { value: 5, key: 'stronglyAgree' },
];

export default function RankingQuestion() {
  const { t, lang } = useLang();
  const {
    currentQuestion, submitCount, hasSubmitted,
    isHost, submitRanking, revealResults, endGame, roundsCompleted, gamePaused,
  } = useGame();
  const [selected, setSelected] = useState(null);

  if (!currentQuestion) return null;

  const allAnswered = submitCount.submitted >= submitCount.total && submitCount.total > 0;

  function handleSubmit() {
    if (selected === null || hasSubmitted) return;
    submitRanking(currentQuestion.id, selected);
  }

  return (
    <div className="screen" style={{ paddingTop: 40 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {gamePaused && (
          <div className="pause-overlay mb-16">
            <h3>{t('gamePaused')}</h3>
            <p style={{ marginTop: 8 }}>{t('gamePausedReason')}</p>
            {isHost && (
              <button className="btn btn-danger mt-16" onClick={endGame} disabled={roundsCompleted < 1}>
                {t('endGame')}
              </button>
            )}
          </div>
        )}

        <div className="section-title">{t('rankingQuestion')}</div>
        <h2 style={{ marginBottom: 24, lineHeight: 1.4 }}>
          {currentQuestion.text[lang] || currentQuestion.text.en}
        </h2>

        {!hasSubmitted ? (
          <>
            <div className="answer-options">
              {ANSWER_LABELS.map(opt => (
                <button
                  key={opt.value}
                  className={`answer-option${selected === opt.value ? ' selected' : ''}`}
                  onClick={() => setSelected(opt.value)}
                >
                  <span style={{ color: 'var(--text-muted)', marginRight: 10, fontSize: '0.8rem', fontWeight: 700 }}>
                    {opt.value}
                  </span>
                  {t(opt.key)}
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleSubmit}
              disabled={selected === null}
            >
              {t('submitAnswer')}
            </button>
          </>
        ) : (
          <p className="info-msg">{t('answerSubmitted')}</p>
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

        {isHost && !allAnswered && hasSubmitted && (
          <p className="text-center text-sm mt-16" style={{ color: 'var(--text-muted)' }}>
            {t('hostWillReveal')}
          </p>
        )}
      </div>
    </div>
  );
}
