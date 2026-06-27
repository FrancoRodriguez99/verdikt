import { useGame } from '../contexts/GameContext';
import { useLang } from '../contexts/LanguageContext';

function tagLabel(tagName, t) {
  const key = `tag_${tagName}`;
  const result = t(key);
  return result !== key ? result : tagName;
}

function PlayerAvatar({ name, idx }) {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: `hsl(${(idx * 60 + 260) % 360}, 70%, 55%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '0.9rem',
        color: '#fff',
        flexShrink: 0,
      }}
    >
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

export default function FinalStats() {
  const { t } = useLang();
  const { finalStats, goToLanding, clearSession, roundsCompleted } = useGame();

  if (!finalStats) return null;

  const { players, agreementPairs, rankingTags, voteStats, settings } = finalStats;

  const playerById = Object.fromEntries(players.map(p => [p.id, p]));
  const playerIdx = Object.fromEntries(players.map((p, i) => [p.id, i]));

  // Top 3 agreeing and 3 disagreeing
  const top3Agree = agreementPairs.slice(0, 3);
  const top3Disagree = [...agreementPairs].reverse().slice(0, 3);

  // Self vote highlights
  const selfVoteHighlights = voteStats
    ? Object.entries(voteStats.selfVotes)
        .filter(([, count]) => count >= 2)
        .map(([pid, count]) => ({ player: playerById[pid], count }))
    : [];

  function handlePlayAgain() {
    clearSession();
    goToLanding();
  }

  return (
    <div className="screen" style={{ paddingTop: 48, paddingBottom: 60 }}>
      <div className="stats-grid">
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div className="logo" style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', marginBottom: 8 }}>Verdikt</div>
          <h2>{t('finalTitle')}</h2>
          <p style={{ marginTop: 6, marginBottom: 4 }}>{t('finalSubtitle')}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('roundsPlayed', { n: roundsCompleted })}</p>
        </div>

        {/* Agreement pairs */}
        {agreementPairs.length > 0 && (
          <div className="stat-card">
            <div className="stat-card-title">{t('agreementTitle')}</div>

            {top3Agree.length > 0 && (
              <>
                <p style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700, marginBottom: 8 }}>
                  ↑ {t('mostAgreeing')}
                </p>
                {top3Agree.map((pair, i) => (
                  <div key={i} className="pair-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <PlayerAvatar name={pair.p1Name} idx={playerIdx[pair.p1Id] ?? 0} />
                      <PlayerAvatar name={pair.p2Name} idx={playerIdx[pair.p2Id] ?? 1} />
                      <span className="pair-names">{pair.p1Name} & {pair.p2Name}</span>
                    </div>
                    <div className="pair-score" style={{ color: 'var(--success)' }}>{pair.score}%</div>
                  </div>
                ))}
              </>
            )}

            {top3Disagree.length > 0 && agreementPairs.length > 3 && (
              <>
                <div className="divider" />
                <p style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 700, marginBottom: 8 }}>
                  ↓ {t('leastAgreeing')}
                </p>
                {top3Disagree.map((pair, i) => (
                  <div key={i} className="pair-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <PlayerAvatar name={pair.p1Name} idx={playerIdx[pair.p1Id] ?? 0} />
                      <PlayerAvatar name={pair.p2Name} idx={playerIdx[pair.p2Id] ?? 1} />
                      <span className="pair-names">{pair.p1Name} & {pair.p2Name}</span>
                    </div>
                    <div className="pair-score" style={{ color: 'var(--danger)' }}>{pair.score}%</div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Ranking personality tags */}
        {rankingTags && Object.keys(rankingTags).length > 0 && (
          <div className="stat-card">
            <div className="stat-card-title">{t('personalityTitle')} — {t('rankingPersonality')}</div>
            {players.map((p, idx) => {
              const tags = rankingTags[p.id] || [];
              return (
                <div key={p.id} className="personality-row">
                  <PlayerAvatar name={p.name} idx={idx} />
                  <span className="personality-name">{p.name}</span>
                  <div className="personality-tags">
                    {tags.length > 0
                      ? tags.map(tag => (
                          <span key={tag} className="tag-chip">{tagLabel(tag, t)}</span>
                        ))
                      : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('noTags')}</span>
                    }
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Vote personality tags */}
        {voteStats?.voteTags && (
          <div className="stat-card">
            <div className="stat-card-title">{t('personalityTitle')} — {t('votePersonality')}</div>
            {players.map((p, idx) => {
              const tags = voteStats.voteTags[p.id] || [];
              return (
                <div key={p.id} className="personality-row">
                  <PlayerAvatar name={p.name} idx={idx} />
                  <span className="personality-name">{p.name}</span>
                  <div className="personality-tags">
                    {tags.length > 0
                      ? tags.map(tag => (
                          <span key={tag} className="tag-chip">{tagLabel(tag, t)}</span>
                        ))
                      : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('noTags')}</span>
                    }
                  </div>
                </div>
              );
            })}

            {selfVoteHighlights.length > 0 && (
              <>
                <div className="divider" />
                <div className="stat-card-title">{t('selfVoteTitle')}</div>
                {selfVoteHighlights.map(({ player, count }) => (
                  <div key={player?.id} className="self-vote-callout">
                    {t('selfVoteMsg', { name: player?.name ?? '?', n: count })}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Play again */}
        <button className="btn btn-primary btn-full btn-lg" onClick={handlePlayAgain}>
          {t('playAgain')}
        </button>
      </div>
    </div>
  );
}
