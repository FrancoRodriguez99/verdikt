/**
 * Visual field that places player circles along a 1–5 scale.
 * Players at the same position are stacked vertically.
 */
export default function PlayerField({ playerAnswers }) {
  // Group players by value
  const groups = {};
  for (const p of playerAnswers) {
    const v = p.value ?? 0;
    if (!groups[v]) groups[v] = [];
    groups[v].push(p);
  }

  // Map value 1–5 to x% position (10% to 90%)
  const toX = (v) => 10 + ((v - 1) / 4) * 80;

  const circles = [];
  for (const [valStr, group] of Object.entries(groups)) {
    const val = Number(valStr);
    if (val === 0) continue; // unanswered
    const x = toX(val);
    group.forEach((p, i) => {
      // Stack from top: each circle 44px apart, starting at 16px from top
      const top = 16 + i * 44;
      circles.push({ ...p, x, top });
    });
  }

  // Unanswered players listed separately below the field
  const unanswered = playerAnswers.filter(p => !p.value);

  return (
    <div>
      <div className="player-field">
        {/* Grid lines for each of the 5 positions */}
        <div className="scale-lines">
          {[1, 2, 3, 4, 5].map(v => (
            <div key={v} className="scale-line" style={{ left: `${toX(v)}%`, position: 'absolute', top: 0, bottom: 20 }} />
          ))}
        </div>

        {circles.map(c => (
          <div
            key={c.playerId}
            className="player-circle"
            style={{
              left: `calc(${c.x}% - 19px)`,
              top: c.top,
            }}
            title={c.label}
          >
            {(c.label || '?').charAt(0).toUpperCase()}
            <span className="player-circle-label">{c.label}</span>
          </div>
        ))}

        <div className="scale-axis">
          <span className="scale-label">1</span>
          <span className="scale-label">2</span>
          <span className="scale-label">3</span>
          <span className="scale-label">4</span>
          <span className="scale-label">5</span>
        </div>
      </div>

      {unanswered.length > 0 && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
          No answer: {unanswered.map(p => p.label).join(', ')}
        </p>
      )}
    </div>
  );
}
