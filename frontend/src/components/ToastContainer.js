import { useState, useEffect, useRef, useCallback } from 'react';
import { useToastStore } from '../hooks/useToast';

const ICONS  = { success: '✓', error: '✕', info: 'i', warn: '⚠' };
const COLORS = {
  success: { bg: '#0f2e1e', border: '#00d68f', icon: '#00d68f' },
  error:   { bg: '#2c1111', border: '#f75f5f', icon: '#f75f5f' },
  info:    { bg: '#0d1e3a', border: '#4f8ef7', icon: '#4f8ef7' },
  warn:    { bg: '#2c1f00', border: '#f7a44f', icon: '#f7a44f' },
};

function ToastItem({ t, onRemove }) {
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const c = COLORS[t.type] || COLORS.info;

  const schedule = useCallback(() => {
    if (t.persistent) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onRemove(t.id), t.duration);
  }, [t.id, t.persistent, t.duration, onRemove]);

  useEffect(() => {
    schedule();
    return () => clearTimeout(timerRef.current);
  }, [schedule]);

  return (
    <div
      onMouseEnter={() => { setPaused(true);  clearTimeout(timerRef.current); }}
      onMouseLeave={() => { setPaused(false); schedule(); }}
      style={{
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: 6,
        padding: '12px 14px 16px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderLeft: `4px solid ${c.border}`,
        borderRadius: 8,
        boxShadow: '0 6px 24px rgba(0,0,0,0.5)',
        animation: 'toastIn 0.2s ease',
        minWidth: 260, maxWidth: 360,
        cursor: 'default',
      }}
    >
      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 20, height: 20, borderRadius: '50%',
          background: c.border + '22', color: c.icon,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 11, flexShrink: 0,
        }}>
          {ICONS[t.type]}
        </span>
        <span style={{
          flex: 1, fontSize: 13,
          fontWeight: t.title ? 600 : 400,
          color: '#e6edf3', lineHeight: 1.4,
        }}>
          {t.title || t.message}
        </span>
        <button
          onClick={() => onRemove(t.id)}
          style={{
            background: 'none', border: 'none', color: '#525a6a',
            cursor: 'pointer', fontSize: 16, lineHeight: 1,
            padding: 0, flexShrink: 0,
          }}
        >×</button>
      </div>

      {/* ── Body (shown only when a title is present) ── */}
      {t.title && (
        <p style={{ margin: '0 0 0 28px', fontSize: 13, color: '#8b95a5', lineHeight: 1.5 }}>
          {t.message}
        </p>
      )}

      {/* ── Action button ── */}
      {t.action && (
        <div style={{ marginLeft: 28 }}>
          <button
            onClick={() => { t.action.onClick(); onRemove(t.id); }}
            style={{
              background: 'none',
              border: `1px solid ${c.border}`,
              color: c.icon, cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
              padding: '3px 10px', borderRadius: 4,
              letterSpacing: 0.3,
            }}
          >
            {t.action.label}
          </button>
        </div>
      )}

      {/* ── Progress bar (disappears on hover) ── */}
      {!t.persistent && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 3, background: c.border + '33',
        }}>
          <div style={{
            height: '100%',
            background: c.border,
            animation: `toastProgress ${t.duration}ms linear forwards`,
            animationPlayState: paused ? 'paused' : 'running',
          }} />
        </div>
      )}
    </div>
  );
}

export const ToastContainer = () => {
  const { toasts, remove } = useToastStore();
  if (!toasts.length) return null;

  return (
    <div style={{
      position: 'fixed', top: 64, right: 20,
      display: 'flex', flexDirection: 'column', gap: 10,
      zIndex: 9999,
    }}>
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} onRemove={remove} />
      ))}
    </div>
  );
};
