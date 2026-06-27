import { useLang } from '../contexts/LanguageContext';

export default function WaitingIndicator({ submitted, total }) {
  const { t } = useLang();
  const allDone = submitted >= total && total > 0;
  const pct = total > 0 ? Math.round((submitted / total) * 100) : 0;

  return (
    <div className="waiting-bar">
      <div className="waiting-count">
        {allDone ? t('allAnswered') : t('xOfYAnswered', { x: submitted, y: total })}
      </div>
      <div className="progress-bar-track" style={{ marginTop: 10 }}>
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
