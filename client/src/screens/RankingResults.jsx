import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useLang } from '../contexts/LanguageContext';
import PlayerField from '../components/PlayerField';
import OwnerPanel from '../components/OwnerPanel';

const LABELS = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
const LABEL_KEYS = ['stronglyDisagree', 'disagree', 'neutral', 'agree', 'stronglyAgree'];

export default function RankingResults() {
  const { t, lang } = useLang();
  const {
    currentQuestion, currentResults, isHost,
    nextQuestion, endGame, roundsCompleted, gamePaused,
    rankingOverrides, overrideRankingAnswer, players,
  } = useGame();

  const [overrideTarget, setOverrideTarget] = useState('');
  const [overrideValue, setOverrideValue] = useState('');

  if (!currentResults || currentResults.type !== 'ranking') return null;

  // Apply any visual overrides on top of the real answers
  const playerAnswers = currentResults.playerAnswers.map(p => ({
    ...p,
    value: rankingOverrides[p.playerId] ?? p.value,
  }));

  function handleOverride() {
    if (!overrideTarget || !overrideValue) return;
    overrideRankingAnswer(overrideTarget, parseInt(overrideValue, 10));
    setOverrideTarget('');
    setOverrideValue('');
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

        <div className="section-title">{t('results')}</div>
        <h2 style={{ marginBottom: 8, lineHeight: 1.4 }}>
          {currentQuestion?.text[lang] || currentQuestion?.text.en}
        </h2>
        <p style={{ marginBottom: 20, fontSize: '0.85rem' }}>{t('rankingResultsTitle')}</p>

        {/* Scale labels above the field */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, padding: '0 5%' }}>
          {LABEL_KEYS.map((k, i) => (
            <span key={i} style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center', flex: 1 }}>
              {t(k)}
            </span>
          ))}
        </div>

        <PlayerField playerAnswers={playerAnswers} />

        {/* Detail list */}
        <div className="card mt-8" style={{ padding: '12px 16px' }}>
          {playerAnswers.map(p => {
            const isOverridden = rankingOverrides[p.playerId] !== undefined;
            return (
              <div
                key={p.playerId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '0.9rem',
                }}
              >
                <span style={{ fontWeight: 600 }}>{p.label}</span>
                <span
                  style={{
                    color: isOverridden ? 'var(--danger)' : 'var(--primary-light)',
                    fontWeight: 700,
                    position: 'relative',
                  }}
                >
                  {p.value ? t(LABEL_KEYS[p.value - 1]) : '—'}
                  {/* Subtle visual marker that this was changed — only host sees this via OwnerPanel context */}
                </span>
              </div>
            );
          })}
        </div>

        {isHost && !gamePaused && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
            <button className="btn btn-primary btn-full btn-lg" onClick={nextQuestion}>
              {t('nextQuestion')}
            </button>
            <button className="btn btn-ghost btn-full" onClick={endGame}>
              {t('endGame')}
            </button>
          </div>
        )}

        {!isHost && (
          <p className="info-msg mt-24">{t('hostWillAdvance')}</p>
        )}

        {/* Owner prank panel — only renders for Franco/host after code unlock */}
        <OwnerPanel>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
            Change what answer someone appears to have given. Visual only — everyone sees it, nothing is saved.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <select
              className="input"
              value={overrideTarget}
              onChange={e => setOverrideTarget(e.target.value)}
              style={{ fontSize: '0.9rem', padding: '8px 12px' }}
            >
              <option value="">Select player…</option>
              {currentResults.playerAnswers.map(p => (
                <option key={p.playerId} value={p.playerId}>{p.label}</option>
              ))}
            </select>
            <select
              className="input"
              value={overrideValue}
              onChange={e => setOverrideValue(e.target.value)}
              style={{ fontSize: '0.9rem', padding: '8px 12px' }}
            >
              <option value="">Change to…</option>
              {LABELS.map((l, i) => (
                <option key={i + 1} value={i + 1}>{l}</option>
              ))}
            </select>
            <button
              className="btn btn-secondary"
              onClick={handleOverride}
              disabled={!overrideTarget || !overrideValue}
              style={{ padding: '8px 14px' }}
            >
              🎭 Apply
            </button>
          </div>
          {Object.keys(rankingOverrides).length > 0 && (
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 10 }}>
              {Object.keys(rankingOverrides).length} answer(s) pranked this round.
            </p>
          )}
        </OwnerPanel>
      </div>
    </div>
  );
}
