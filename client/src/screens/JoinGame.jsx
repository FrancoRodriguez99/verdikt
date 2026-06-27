import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { useLang } from '../contexts/LanguageContext';

export default function JoinGame() {
  const { t } = useLang();
  const { joinRoom, goToLanding, errorCode, errorMsg } = useGame();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState({});

  // Pre-fill room code from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) setCode(room.toUpperCase());
  }, []);

  function validate() {
    const e = {};
    if (!name.trim()) e.name = t('nameRequired');
    if (!code.trim()) e.code = t('codeRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleJoin() {
    if (!validate()) return;
    joinRoom(code.trim().toUpperCase(), name.trim());
  }

  const serverError = errorCode && !['INVALID_NAME', 'INVALID_CODE'].includes(errorCode)
    ? (t(`err_${errorCode}`) !== `err_${errorCode}` ? t(`err_${errorCode}`) : errorMsg)
    : null;

  return (
    <div className="screen screen-center">
      <div className="card" style={{ maxWidth: 400 }}>
        <button
          className="btn btn-ghost"
          style={{ marginBottom: 20, padding: '6px 12px', fontSize: '0.85rem' }}
          onClick={goToLanding}
        >
          ← {t('back')}
        </button>

        <h2 style={{ marginBottom: 24 }}>{t('joinTitle')}</h2>

        <div className="input-group">
          <label className="input-label">{t('yourName')}</label>
          <input
            className="input"
            placeholder={t('enterName')}
            value={name}
            maxLength={24}
            onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: null })); }}
          />
          {errors.name && <span className="error-msg">{errors.name}</span>}
        </div>

        <div className="input-group">
          <label className="input-label">{t('roomCode')}</label>
          <input
            className="input"
            placeholder={t('enterRoomCode')}
            value={code}
            maxLength={5}
            style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '1.4rem', fontWeight: 800 }}
            onChange={e => {
              setCode(e.target.value.toUpperCase());
              setErrors(p => ({ ...p, code: null }));
            }}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
          />
          {errors.code && <span className="error-msg">{errors.code}</span>}
        </div>

        {serverError && <div className="error-msg" style={{ marginBottom: 12 }}>{serverError}</div>}

        <button className="btn btn-primary btn-full btn-lg" onClick={handleJoin}>
          {t('join')}
        </button>
      </div>
    </div>
  );
}
