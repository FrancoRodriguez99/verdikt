import { useState, useRef, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';

/**
 * Easter-egg owner panel.
 * Only renders for the player named "Franco" who is also the host.
 * A subtle 🔒 button lives in the bottom-right corner.
 * Typing the secret code "owner" unlocks a collapsible prank panel.
 * `children` receive the prank controls for the current screen.
 */
export default function OwnerPanel({ children }) {
  const { isHost, playerName, ownerUnlocked, unlockOwner } = useGame();
  const [showInput, setShowInput] = useState(false);
  const [code, setCode] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  // Only Franco the host gets this
  if (!isHost || playerName?.toLowerCase() !== 'franco') return null;

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      if (code === 'owner') {
        unlockOwner();
        setShowInput(false);
        setCode('');
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 400);
        setCode('');
      }
    }
    if (e.key === 'Escape') {
      setShowInput(false);
      setCode('');
    }
  }

  useEffect(() => {
    if (showInput) inputRef.current?.focus();
  }, [showInput]);

  if (!ownerUnlocked) {
    return (
      <div style={{
        position: 'fixed',
        bottom: 14,
        right: 14,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        {showInput && (
          <input
            ref={inputRef}
            type="password"
            value={code}
            maxLength={10}
            onChange={e => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { setShowInput(false); setCode(''); }}
            placeholder="code"
            style={{
              background: 'var(--surface)',
              border: `1px solid ${shake ? 'var(--danger)' : 'var(--border)'}`,
              borderRadius: 8,
              color: 'var(--text)',
              padding: '6px 10px',
              fontSize: '0.85rem',
              width: 90,
              outline: 'none',
              transition: 'border-color 0.15s',
              animation: shake ? 'shake 0.3s ease' : 'none',
            }}
          />
        )}
        <button
          onClick={() => setShowInput(v => !v)}
          title="…"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          🔒
        </button>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-4px); }
            40%, 80% { transform: translateX(4px); }
          }
        `}</style>
      </div>
    );
  }

  // Unlocked — render prank panel inline wherever this component is placed
  return (
    <div style={{
      background: 'rgba(124,58,237,0.08)',
      border: '1px dashed var(--primary-border)',
      borderRadius: 'var(--radius-sm)',
      padding: '14px 16px',
      marginTop: 20,
    }}>
      <div style={{
        fontSize: '0.65rem',
        fontWeight: 800,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--primary-light)',
        marginBottom: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        🎭 Owner Mode
      </div>
      {children}
    </div>
  );
}
