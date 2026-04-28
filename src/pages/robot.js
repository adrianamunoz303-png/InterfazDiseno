import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const PRIMARY = '#003366';
const ACCENT  = '#AD3333';
const WARN    = '#D48B00';
const FONT    = "'Century Gothic', Candara, 'Trebuchet MS', sans-serif";

export default function Robot() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const userLevelNumber =
    user?.role === 'superadmin' ? '3' : user?.role === 'admin' ? '2' : '1';
  const userLevel =
    user?.role === 'superadmin' ? 'SUPERADMIN' : user?.role === 'admin' ? 'ADMIN' : 'OPERADOR';

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh', fontFamily: FONT }}>
      <div
        style={{
          maxWidth: '900px',
          margin: '60px auto',
          padding: '0 28px',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #DADADA',
            borderRadius: '16px',
            padding: '60px 40px',
            boxShadow: '0 4px 20px rgba(0,51,102,0.07)'
          }}
        >
          <div style={{ fontSize: '72px', marginBottom: '24px' }}>🤖</div>

          <h1
            style={{
              margin: '0 0 12px',
              color: PRIMARY,
              fontSize: '24px',
              fontWeight: '700',
              fontFamily: FONT
            }}
          >
            Módulo de Control de Robots
          </h1>

          <p style={{ margin: '0 0 8px', color: '#555', fontSize: '15px' }}>
            Este módulo está en construcción.
          </p>
          <p style={{ margin: '0 auto 36px', color: '#777', fontSize: '13px', maxWidth: '480px' }}>
            Aquí se implementará el control directo, telemetría y monitoreo en tiempo real de los
            robots del sistema AS/RS.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginBottom: '40px',
              textAlign: 'left'
            }}
          >
            {[
              { icon: '📡', titulo: 'Telemetría', desc: 'Posición y estado en tiempo real' },
              { icon: '🕹️', titulo: 'Control manual', desc: 'Comandos directos al robot' },
              { icon: '🗺️', titulo: 'Mapa en vivo', desc: 'Visualización de trayectorias' },
              { icon: '📊', titulo: 'Estadísticas', desc: 'Rendimiento y ciclos completados' }
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  padding: '16px',
                  background: '#F8F9FB',
                  borderRadius: '10px',
                  border: '1px solid #EBEBEB'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{f.icon}</div>
                <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '13px', color: PRIMARY, fontFamily: FONT }}>
                  {f.titulo}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#777' }}>{f.desc}</p>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              background: `rgba(212,139,0,0.08)`,
              border: `1px solid rgba(212,139,0,0.3)`
            }}
          >
            <span style={{ fontSize: '16px' }}>⚙️</span>
            <span style={{ color: WARN, fontSize: '13px', fontWeight: '700', fontFamily: FONT }}>
              En desarrollo - Etapa 3
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
