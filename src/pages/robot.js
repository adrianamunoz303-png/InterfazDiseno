import React, { useEffect, useState, useCallback } from 'react';
import { useWs } from '../context/WsContext';
import { obtenerVehiculos } from '../services/api';

const PRIMARY = '#003366';
const ACCENT  = '#AD3333';
const GREEN   = '#1A9E5A';
const WARN    = '#D48B00';
const BLUE    = '#2563EB';
const NEUTRAL = '#DADADA';
const FONT    = "'Century Gothic', Candara, 'Trebuchet MS', sans-serif";
const MONO    = "'Roboto Mono', monospace";

const ESTADO_CFG = {
  idle:     { label: 'En espera',     color: '#555',  bg: '#f5f5f5', icon: '⏸️' },
  moving:   { label: 'En movimiento', color: WARN,    bg: '#fff8e1', icon: '🚗' },
  charging: { label: 'Cargando',      color: BLUE,    bg: '#eff6ff', icon: '🔋' },
  error:    { label: 'Error',         color: ACCENT,  bg: '#fff0f0', icon: '⚠️' },
};

function getToken() {
  try {
    const user = JSON.parse(sessionStorage.getItem('asrs_user') || '{}');
    return user.token || '';
  } catch {
    return '';
  }
}

function BatteryBar({ nivel }) {
  const pct   = Math.max(0, Math.min(100, Number(nivel) || 0));
  const color = pct < 20 ? ACCENT : pct < 50 ? WARN : GREEN;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', color: '#777' }}>Batería</span>
        <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: MONO, color }}>{pct.toFixed(1)}%</span>
      </div>
      <div style={{ background: NEUTRAL, borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          borderRadius: '6px', transition: 'width 0.8s ease',
        }} />
      </div>
    </div>
  );
}

function AgvCard({ data, onEliminar }) {
  const cfg     = ESTADO_CFG[data.status] || ESTADO_CFG.idle;
  const secsAgo = data.last_connection
    ? Math.round((Date.now() - new Date(data.last_connection).getTime()) / 1000)
    : null;

  return (
    <div style={{
      background: 'white', borderRadius: '14px',
      border: `2px solid ${cfg.color}40`,
      padding: '22px', boxShadow: '0 3px 16px rgba(0,51,102,0.09)',
      display: 'flex', flexDirection: 'column', gap: '16px',
    }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
            Vehículo AGV
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: MONO, color: PRIMARY }}>
            {data.id}
          </div>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '5px 12px', borderRadius: '20px',
          background: cfg.bg, color: cfg.color,
          fontSize: '12px', fontWeight: 700, fontFamily: FONT,
          border: `1px solid ${cfg.color}40`,
        }}>
          <span className={data.status === 'moving' ? 'wms-pulse' : ''}>{cfg.icon}</span>
          {cfg.label}
        </span>
      </div>

      {/* Batería */}
      <BatteryBar nivel={data.battery_level} />

      {/* Posición */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {[
          { label: 'Pos. X', value: data.pos_x ?? 0 },
          { label: 'Pos. Y', value: data.pos_y ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: '#f8f9fb', borderRadius: '8px', padding: '10px 14px',
          }}>
            <div style={{ fontSize: '10px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: MONO, color: PRIMARY }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Última actualización */}
      <div style={{ fontSize: '11px', color: '#bbb', fontFamily: MONO, textAlign: 'right' }}>
        {secsAgo !== null
          ? secsAgo < 60
            ? `Hace ${secsAgo}s`
            : `Hace ${Math.round(secsAgo / 60)}min`
          : 'Sin conexión registrada'}
      </div>

      {/* Botón Eliminar */}
      <button
        onClick={() => onEliminar(data.id)}
        style={{
          width: '100%', padding: '10px',
          background: 'white', color: ACCENT,
          border: `1.5px solid ${ACCENT}`, borderRadius: '8px',
          fontSize: '13px', fontWeight: 700, fontFamily: FONT,
          cursor: 'pointer', transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        }}
        onMouseEnter={e => { e.target.style.background = ACCENT; e.target.style.color = 'white'; }}
        onMouseLeave={e => { e.target.style.background = 'white'; e.target.style.color = ACCENT; }}
      >
        🗑️ Eliminar Robot
      </button>
    </div>
  );
}

export default function Robot() {
  const wsCtx    = useWs();
  const [dbAgvs, setDbAgvs] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [eliminando, setEliminando] = useState(null);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Reloj
  useEffect(() => {
    const t = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Polling GET /agvs cada 5 s
  const fetchAgvs = useCallback(async () => {
    const data = await obtenerVehiculos();
    if (data.length) setDbAgvs(data);
    setCargando(false);
  }, []);

  useEffect(() => {
    fetchAgvs();
    const t = setInterval(fetchAgvs, 5000);
    return () => clearInterval(t);
  }, [fetchAgvs]);

  // Función eliminar robot
  const eliminarRobot = useCallback(async (robotId) => {
    if (!window.confirm(`¿Eliminar ${robotId} permanentemente?\n\nEsta acción no se puede deshacer.`)) return;
    
    setEliminando(robotId);
    try {
      const res = await fetch(`http://localhost:8000/robots/${robotId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al eliminar el robot');
      }
      
      alert(`✅ Robot ${robotId} eliminado correctamente`);
      fetchAgvs(); // Recargar la lista
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setEliminando(null);
    }
  }, [fetchAgvs]);

  // Fusionar datos: WebSocket actualiza en tiempo real encima de los datos de BD
  const wsData   = wsCtx?.agvData || {};
  const wsStatus = wsCtx?.wsStatus || 'disconnected';

  const agvList = dbAgvs.map(v => {
    const live = wsData[v.id];
    if (!live) return v;
    return {
      ...v,
      battery_level: live.bateria ?? v.battery_level,
      status:        live.estado  ?? v.status,
      pos_x:         live.pos_x   ?? v.pos_x,
      pos_y:         live.pos_y   ?? v.pos_y,
      last_connection: live.lastUpdate ?? v.last_connection,
    };
  });

  Object.keys(wsData).forEach(id => {
    if (!agvList.find(v => v.id === id)) {
      const d = wsData[id];
      agvList.push({
        id,
        battery_level: d.bateria ?? 0,
        status:        d.estado  ?? 'idle',
        pos_x:         d.pos_x   ?? 0,
        pos_y:         d.pos_y   ?? 0,
        last_connection: d.lastUpdate || null,
      });
    }
  });

  const wsStatusCfg = {
    connected:    { color: GREEN,  bg: '#e8f5ee', label: 'WS Conectado',   icon: '🟢' },
    connecting:   { color: WARN,   bg: '#fff8e1', label: 'Conectando…',    icon: '🟡' },
    disconnected: { color: ACCENT, bg: '#fff0f0', label: 'WS Desconectado', icon: '🔴' },
  };
  const ws = wsStatusCfg[wsStatus] || wsStatusCfg.disconnected;

  return (
    <div style={{ background: '#f4f6f9', minHeight: '100vh', fontFamily: FONT, padding: '28px' }}>

      {/* ENCABEZADO */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: PRIMARY }}>
            🤖 Control de Robots AGV
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#777' }}>
            Telemetría en tiempo real · datos desde PostgreSQL
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '20px',
            background: ws.bg, color: ws.color,
            fontSize: '12px', fontWeight: 700, fontFamily: MONO,
            border: `1px solid ${ws.color}40`,
          }}>
            {ws.icon} {ws.label}
          </span>
          <span style={{ fontSize: '13px', fontFamily: MONO, color: '#aaa' }}>{currentTime}</span>
        </div>
      </div>

      {/* TARJETAS AGV */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          Cargando flota AGV desde base de datos...
        </div>
      ) : agvList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤖</div>
          No hay robots registrados en el sistema
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}>
          {agvList.map(v => (
            <AgvCard 
              key={v.id} 
              data={v} 
              onEliminar={eliminando === v.id ? null : eliminarRobot}
            />
          ))}
        </div>
      )}

      {/* PANEL DE ESTADO */}
      <div style={{
        background: 'white', borderRadius: '12px', padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(0,51,102,0.07)',
        display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: '28px' }}>📡</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: PRIMARY, marginBottom: '2px' }}>
            Canal en tiempo real — <code style={{ fontFamily: MONO, fontSize: '12px' }}>ws://localhost:8000/ws/telemetry</code>
          </div>
          <div style={{ fontSize: '12px', color: '#777' }}>
            {wsStatus === 'connected'
              ? `WebSocket activo · ${agvList.length} AGV${agvList.length !== 1 ? 's' : ''} en flota · polling BD cada 5s`
              : wsStatus === 'connecting'
              ? 'Intentando conectar con el backend...'
              : 'Sin WebSocket — mostrando datos de BD (polling 5s)'}
          </div>
        </div>
        <button
          onClick={fetchAgvs}
          style={{
            padding: '8px 18px', border: `1px solid ${PRIMARY}`, borderRadius: '8px',
            background: 'white', color: PRIMARY, fontSize: '12px',
            fontFamily: FONT, cursor: 'pointer', fontWeight: 600,
          }}
          onMouseEnter={e => { e.target.style.background = PRIMARY; e.target.style.color = 'white'; }}
          onMouseLeave={e => { e.target.style.background = 'white'; e.target.style.color = PRIMARY; }}
        >
          Actualizar
        </button>
      </div>

    </div>
  );
}
