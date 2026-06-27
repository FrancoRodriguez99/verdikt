import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useLang } from '../contexts/LanguageContext';

export default function Landing() {
  const { t } = useLang();
  const { createRoom, goToJoin, errorCode } = useGame();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  function handleHost() {
    if (!name.trim()) {
      setNameError(t('nameRequired'));
      return;
    }
    setNameError('');
    createRoom(name.trim());
  }

  function handleJoin() {
    goToJoin();
  }

  return (
    <div className="screen screen-center" style={{ gap: 0 }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div className="logo">Verdikt</div>
        <p style={{ marginTop: 12, fontSize: '1rem', color: 'var(--text-secondary)' }}>
          {t('landingTagline')}
        </p>
      </div>

      <div className="card" style={{ maxWidth: 400 }}>
        <div className="input-group">
          <label className="input-label">{t('yourName')}</label>
          <input
            className="input"
            placeholder={t('enterName')}
            value={name}
            maxLength={24}
            onChange={e => { setName(e.target.value); setNameError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleHost()}
          />
          {nameError && <span className="error-msg">{nameError}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <button className="btn btn-primary btn-full btn-lg" onClick={handleHost}>
            {t('hostGame')}
          </button>
          <button className="btn btn-secondary btn-full btn-lg" onClick={handleJoin}>
            {t('joinGame')}
          </button>
        </div>
      </div>
    </div>
  );
}
