import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useLang } from '../contexts/LanguageContext';
import OwnerPanel from '../components/OwnerPanel';

export default function VoteResults() {
  const { t, lang } = useLang();
  const {
    currentQuestion, currentResults, isHost, settings,
    nextQuestion, endGame, gamePaused,
    voteOverrides, overrideVoteCount,
  } = useGame();

  const [overrideTarget, setOverrideTarget] = useState('');
  const [overrideVotes, setOverrideVotes] = useState('');

  if (!currentResults || currentResults.type !== 'vote') return null;

  // Apply visual vote overrides before rendering
  const ranked = currentResults.ranked
    .map(r => ({
      ...r,
      votes: voteOverrides[r.playerId] ?? r.votes,
    }))
    .sort((a, b) => b.votes - a.votes);

  const maxVotes = Math.max(1, ...ranked.map(r => r.votes));

  function handleOverride() {
    if (!overrideTarget || overrideVotes === '') return;
    overrideVoteCount(overrideTarget, parseInt(overrideVotes, 10));
    setOverrideTarget('');
    setOverrideVotes('');
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
        <p style={{ marginBottom: 20, fontSize: '0.85rem' }}>{t('voteResultsTitle')}</p>

        <div className="card">
          {ranked.map((entry, idx) => {
            const isPranked = voteOverrides[entry.playerId] !== undefined;
            return (
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
                    style={{
                      width: `${(entry.votes / maxVotes) * 100}%`,
                      background: isPranked ? 'var(--danger)' : undefined,
                    }}
                  />
                </div>
                <div className="vote-count-label" style={{ color: isPranked ? 'var(--danger)' : undefined }}>
                  {entry.votes} {entry.votes === 1 ? t('oneVote') : t('votes')}
                </div>
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

        {/* Owner prank panel — change displayed vote counts */}
        <OwnerPanel>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
            Change how many votes someone appears to have. Visual only — everyone sees it, nothing is saved.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <select
              className="input"
              value={overrideTarget}
              onChange={e => setOverrideTarget(e.target.value)}
              style={{ fontSize: '0.9rem', padding: '8px 12px' }}
            >
              <option value="">Select player…</option>
              {currentResults.ranked.map(r => (
                <option key={r.playerId} value={r.playerId}>{r.label}</option>
              ))}
            </select>
            <input
              className="input"
              type="number"
              min="0"
              max="99"
              placeholder="New vote count…"
              value={overrideVotes}
              onChange={e => setOverrideVotes(e.target.value)}
              style={{ fontSize: '0.9rem', padding: '8px 12px' }}
            />
            <button
              className="btn btn-secondary"
              onClick={handleOverride}
              disabled={!overrideTarget || overrideVotes === ''}
              style={{ padding: '8px 14px' }}
            >
              🎭 Apply
            </button>
          </div>
          {Object.keys(voteOverrides).length > 0 && (
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 10 }}>
              {Object.keys(voteOverrides).length} vote(s) pranked this round.
            </p>
          )}
        </OwnerPanel>
      </div>
    </div>
  );
}
