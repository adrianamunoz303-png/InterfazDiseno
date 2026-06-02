import React from 'react';
import { useWs } from '../../context/WsContext';

const ACCENT = '#AD3333';
const GREEN  = '#1A9E5A';
const FONT   = "'Century Gothic', Candara, 'Trebuchet MS', sans-serif";

export default function ToastNotifications() {
  const ctx = useWs();
  if (!ctx) return null;

  const { toasts } = ctx;
  if (!toasts.length) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div
          key={t.id}
          className="wms-toast"
          style={{
            padding: '14px 18px',
            borderRadius: '10px',
            maxWidth: '360px',
            background: t.type === 'error' ? '#fff0f0' : '#f0faf4',
            border: `1.5px solid ${t.type === 'error' ? ACCENT : GREEN}`,
            boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
            fontFamily: FONT,
            fontSize: '13px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: '20px', lineHeight: 1 }}>
            {t.type === 'error' ? '🔴' : '✅'}
          </span>
          <div>
            <div style={{
              fontWeight: 700,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: t.type === 'error' ? ACCENT : GREEN,
              marginBottom: '3px',
            }}>
              {t.type === 'error' ? 'Alerta de Muelle' : 'Notificación'}
            </div>
            <div style={{ color: '#333', lineHeight: 1.4 }}>{t.msg}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
