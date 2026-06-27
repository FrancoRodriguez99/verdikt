'use strict';

/**
 * Lightweight UA string parser.
 * Returns { os, browser, deviceType } without any npm dependency.
 */
function parseUserAgent(ua = '') {
  const s = ua.toLowerCase();

  // ── OS ──────────────────────────────────────────────────────────────────────
  let os = 'Unknown';
  if (s.includes('iphone'))             os = 'iOS (iPhone)';
  else if (s.includes('ipad'))          os = 'iOS (iPad)';
  else if (s.includes('android'))       os = 'Android';
  else if (s.includes('windows nt'))    os = 'Windows';
  else if (s.includes('mac os x'))      os = 'macOS';
  else if (s.includes('linux'))         os = 'Linux';
  else if (s.includes('cros'))          os = 'ChromeOS';

  // ── Browser ─────────────────────────────────────────────────────────────────
  let browser = 'Unknown';
  if (s.includes('edg/') || s.includes('edge/'))  browser = 'Edge';
  else if (s.includes('opr/') || s.includes('opera')) browser = 'Opera';
  else if (s.includes('samsungbrowser'))          browser = 'Samsung Browser';
  else if (s.includes('chrome'))                  browser = 'Chrome';
  else if (s.includes('firefox'))                 browser = 'Firefox';
  else if (s.includes('safari'))                  browser = 'Safari';

  // ── Device type ─────────────────────────────────────────────────────────────
  let deviceType = 'Desktop';
  if (s.includes('mobile'))   deviceType = 'Mobile';
  else if (s.includes('tablet') || s.includes('ipad')) deviceType = 'Tablet';

  return { os, browser, deviceType };
}

/**
 * Build the full device object stored on each player.
 * @param {import('socket.io').Socket} socket
 */
function extractDevice(socket) {
  const ua = socket.handshake.headers['user-agent'] || '';
  const ip =
    socket.handshake.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    socket.handshake.address ||
    'unknown';
  const language = socket.handshake.headers['accept-language']?.split(',')[0] || null;

  return {
    userAgent: ua,
    ip,
    language,
    ...parseUserAgent(ua),
    connectedAt: new Date(),
  };
}

module.exports = { extractDevice, parseUserAgent };
