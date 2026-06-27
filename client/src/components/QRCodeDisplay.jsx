import { QRCodeSVG } from 'qrcode.react';
import { useLang } from '../contexts/LanguageContext';

export default function QRCodeDisplay({ roomCode }) {
  const { t } = useLang();
  const joinUrl = `${window.location.origin}?room=${roomCode}`;

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="section-title">{t('scanToJoin')}</div>
      <div className="qr-wrap">
        <QRCodeSVG value={joinUrl} size={160} level="M" />
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
        {t('orEnterCode')}
      </p>
      <div className="room-code">{roomCode}</div>
    </div>
  );
}
