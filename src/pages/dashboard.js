import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ─── Paleta y meta de roles ─── */
const ROLE_META = {
  superadmin: { label: 'Super Admin', color: '#AD3333' },
  admin:      { label: 'Administrador', color: '#D48B00' },
  operario:   { label: 'Operario',    color: '#1A9E5A' }
};

const SIDEBAR_ITEMS = {
  admin: [
    { icon: '📊', label: 'Dashboard',  to: '/' },
    { icon: '🗄️', label: 'Inventario', to: '/Almacenamiento' }
  ],
  superadmin: [
    { icon: '📊', label: 'Dashboard',  to: '/' },
    { icon: '🚚', label: 'Dispensa',   to: '/Dispensa' },
    { icon: '📦', label: 'Recepción',  to: '/recepcion' },
    { icon: '🗄️', label: 'Inventario', to: '/Almacenamiento' },
    { icon: '🤖', label: 'Robots',     to: '/Robot' }
  ]
};

/* ─────────────────────────────────────────────
   BARRA SUPERIOR
───────────────────────────────────────────── */
function TopBar({ user, hora, onLogout }) {
  const meta = ROLE_META[user?.role] || ROLE_META.operario;
  return (
    <div style={{
      background: '#003366', padding: '0 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      minHeight: '60px', position: 'sticky', top: 0, zIndex: 200,
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src="/logo_U_png.png"
          alt="UP"
          style={{
            height: '34px',
            width: 'auto',
            objectFit: 'contain',
            display: 'block',
            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.22))'
          }}
        />
        <span style={{
          color: '#FFFFFF', fontSize: '15px', fontWeight: '600',
          fontFamily: 'Inter, sans-serif'
        }}>
          AS/RS · Sistema de Gestión de Almacén
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px',
          fontFamily: "'Roboto Mono', monospace" }}>{hora}</span>
        <span style={{
          padding: '4px 12px', borderRadius: '8px', background: meta.color,
          color: '#FFF', fontSize: '11px', fontWeight: '700',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>{meta.label}</span>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
          {user?.nombre}
        </span>
        <button onClick={onLogout} style={{
          padding: '7px 14px', background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.2)', borderRadius: '7px',
          color: '#FFF', fontSize: '12px', fontWeight: '500', cursor: 'pointer'
        }}
        onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.18)'}
        onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SIDEBAR (Admin + SuperAdmin)
───────────────────────────────────────────── */
function Sidebar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const items = SIDEBAR_ITEMS[role] || [];

  return (
    <div style={{
      width: '200px', flexShrink: 0,
      background: '#FFFFFF', borderRight: '1px solid #DADADA',
      position: 'sticky', top: '60px',
      height: 'calc(100vh - 60px)', overflowY: 'auto',
      boxShadow: '2px 0 8px rgba(0,51,102,0.05)'
    }}>
      <div style={{ padding: '16px 12px 8px' }}>
        <p style={{
          margin: 0, fontSize: '10px', fontWeight: '700', color: '#AAAAAA',
          textTransform: 'uppercase', letterSpacing: '0.8px', padding: '0 8px 8px'
        }}>Módulos</p>
        {items.map(item => {
          const active = location.pathname === item.to;
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: '10px', padding: '10px 12px', borderRadius: '8px',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                background: active ? 'rgba(0,51,102,0.08)' : 'transparent',
                color: active ? '#003366' : '#555555',
                fontWeight: active ? '600' : '400',
                fontSize: '13px', fontFamily: 'Inter, sans-serif',
                transition: 'all 0.15s ease',
                borderLeft: active ? '3px solid #003366' : '3px solid transparent',
                marginBottom: '2px'
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#F5F7FA'; e.currentTarget.style.color = '#003366'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#555555'; }}}
            >
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Info de usuario en sidebar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 16px', borderTop: '1px solid #EBEBEB',
        background: '#FAFAFA'
      }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>Conectado como</p>
        <p style={{ margin: '2px 0 0', fontSize: '12px', fontWeight: '600',
          color: '#003366', fontFamily: "'Roboto Mono', monospace" }}>
          {role === 'superadmin' ? 'superadmin' : 'admin'}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VISTA OPERARIO — simple y didáctica
───────────────────────────────────────────── */
function OperarioView({ datos, hora, estadoSistema, conexion }) {
  const { ocupacion, robotsActivos, dispensa, recepcion, alarmas } = datos;
  const hayAlarmas = estadoSistema.alarmasActivas > 0;
  const sistemaOk  = estadoSistema.estado === 'normal';

  return (
    <div style={{ padding: '24px 28px 48px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{ margin: 0, color: '#003366', fontSize: '22px', fontWeight: '700' }}>
          Panel de Control Operativo
        </h1>
        <p style={{ margin: '6px 0 0', color: '#777', fontSize: '13px' }}>
          Bienvenido. Revise el estado del sistema y seleccione un módulo.
        </p>
      </div>

      {/* Estado rápido — 6 tarjetas */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '14px', marginBottom: '24px'
      }}>
        <StatusCard label="Nivel de Ocupación" value={ocupacion.value}
          sub={ocupacion.footer} color="#003366" icon="📦" />
        <StatusCard label="Robots Activos" value={robotsActivos.value}
          sub={robotsActivos.footer} color="#003366" icon="🤖" />
        <StatusCard label="Productos en Dispensa" value={dispensa.value}
          sub={dispensa.footer} color="#1A9E5A" icon="🚚" />
        <StatusCard label="Productos en Recepción" value={recepcion.value}
          sub={recepcion.footer} color="#1A9E5A" icon="🏪" />
        <StatusCard label="Estado del Sistema"
          value={sistemaOk ? 'OPERATIVO' : 'ADVERTENCIA'}
          sub={sistemaOk ? 'Todo funciona correctamente' : 'Revise las alarmas'}
          color={sistemaOk ? '#1A9E5A' : '#D48B00'} icon={sistemaOk ? '✅' : '⚠️'} />
        <StatusCard label="Alarmas Activas" value={alarmas.value}
          sub={hayAlarmas ? 'Requiere atención' : 'Sistema en calma'}
          color={hayAlarmas ? '#AD3333' : '#1A9E5A'}
          icon={hayAlarmas ? '🚨' : '🔕'} />
      </div>

      {/* Módulos de operación */}
      <div style={{
        background: '#FFFFFF', border: '1px solid #DADADA',
        borderRadius: '14px', padding: '24px 28px',
        boxShadow: '0 2px 10px rgba(0,51,102,0.06)', marginBottom: '20px'
      }}>
        <h2 style={{ margin: '0 0 6px', color: '#003366', fontSize: '16px', fontWeight: '600' }}>
          🎛️ Módulos de Operación
        </h2>
        <p style={{ margin: '0 0 20px', color: '#777', fontSize: '13px' }}>
          Toque el módulo al que desea acceder.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <NavCard emoji="🚚" label="Dispensa"   desc="Despacho FIFO de productos"     destino="/Dispensa"       color="#003366" />
          <NavCard emoji="📦" label="Recepción"  desc="Entrada de nuevos productos"     destino="/recepcion"      color="#1A9E5A" />
          <NavCard emoji="🗄️" label="Inventario" desc="Consulta de stock por categoría" destino="/Almacenamiento" color="#D48B00" />
          <NavCard emoji="🤖" label="Robots"     desc="Control y monitoreo de robots"   destino="/Robot"          color="#003366" />
        </div>
      </div>

      {/* Conexión */}
      <div style={{
        background: '#FFFFFF', border: '1px solid #DADADA',
        borderRadius: '14px', padding: '20px 28px',
        boxShadow: '0 2px 10px rgba(0,51,102,0.06)'
      }}>
        <h2 style={{ margin: '0 0 14px', color: '#003366', fontSize: '16px', fontWeight: '600' }}>
          📡 Estado de Conexión
        </h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px',
            borderRadius: '10px', flex: '1', minWidth: '200px',
            background: conexion === 'estable' ? 'rgba(26,158,90,0.07)' : 'rgba(173,51,51,0.07)',
            border: `1px solid ${conexion === 'estable' ? 'rgba(26,158,90,0.3)' : 'rgba(173,51,51,0.3)'}`
          }}>
            <div style={{
              width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0,
              background: conexion === 'estable' ? '#1A9E5A' : '#AD3333',
              boxShadow: conexion === 'estable' ? '0 0 8px rgba(26,158,90,0.5)' : '0 0 8px rgba(173,51,51,0.5)'
            }} />
            <div>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '14px',
                color: conexion === 'estable' ? '#1A9E5A' : '#AD3333' }}>
                Conexión {conexion}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#777' }}>
                Actualización: <span style={{ fontFamily: "'Roboto Mono', monospace" }}>{hora}</span>
              </p>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px',
            borderRadius: '10px', flex: '1', minWidth: '200px',
            background: 'rgba(0,51,102,0.05)', border: '1px solid rgba(0,51,102,0.15)'
          }}>
            <span style={{ fontSize: '24px' }}>🏭</span>
            <div>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#003366' }}>Sistema AS/RS</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#777' }}>Etapa 2 — Operación activa</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      background: '#FFFFFF', borderLeft: `4px solid ${color}`,
      border: `1px solid ${color}22`, borderRadius: '12px', padding: '16px 18px',
      boxShadow: '0 2px 8px rgba(0,51,102,0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <span style={{ fontSize: '12px', color: '#777', fontWeight: '500' }}>{label}</span>
      </div>
      <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color,
        fontFamily: "'Roboto Mono', monospace", lineHeight: 1 }}>{value}</p>
      <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#777' }}>{sub}</p>
    </div>
  );
}

function NavCard({ emoji, label, desc, destino, color }) {
  const navigate = useNavigate();
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={() => navigate(destino)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? color : '#FFFFFF',
        border: `2px solid ${hov ? color : '#DADADA'}`,
        borderRadius: '12px', padding: '20px 16px', cursor: 'pointer', textAlign: 'center',
        transition: 'all 0.2s ease', transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? `0 8px 20px ${color}33` : '0 2px 6px rgba(0,0,0,0.05)'
      }}
    >
      <div style={{ fontSize: '34px', marginBottom: '8px' }}>{emoji}</div>
      <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '14px',
        color: hov ? '#FFF' : '#222' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '11px', color: hov ? 'rgba(255,255,255,0.8)' : '#777' }}>{desc}</p>
    </button>
  );
}

/* ─────────────────────────────────────────────
   VISTA ADMIN — analytics y gestión
───────────────────────────────────────────── */
function AdminView({ datos, estadoSistema, conexion, hora }) {
  const { ocupacion, robotsActivos, dispensa, recepcion, alarmas } = datos;

  const metricas = [
    { label: 'Pedidos hoy',      value: '24',   unit: 'pedidos', color: '#003366', icon: '📋' },
    { label: 'Eficiencia',       value: '94.3', unit: '%',       color: '#1A9E5A', icon: '📈' },
    { label: 'T. prom. despacho',value: '3.2',  unit: 'min',     color: '#D48B00', icon: '⏱️' },
    { label: 'Cola FIFO',        value: '7',    unit: 'items',   color: '#003366', icon: '🔄' },
    { label: 'Uptime',           value: '99.7', unit: '%',       color: '#1A9E5A', icon: '🔗' },
    { label: 'Errores en turno', value: '1',    unit: 'evento',  color: '#AD3333', icon: '⚠️' },
  ];

  const turnos = [
    { nombre: 'Turno 1', hora: '06:00–14:00', pedidos: 10, efic: '96%', estado: 'Completado', c: '#1A9E5A' },
    { nombre: 'Turno 2', hora: '14:00–22:00', pedidos: 14, efic: '93%', estado: 'En curso',   c: '#D48B00' },
    { nombre: 'Turno 3', hora: '22:00–06:00', pedidos: 0,  efic: '—',   estado: 'Pendiente',  c: '#AAAAAA' },
  ];

  const panel = { background: '#FFF', border: '1px solid #DADADA', borderRadius: '12px',
    padding: '20px 22px', boxShadow: '0 2px 8px rgba(0,51,102,0.05)' };
  const panelTitle = { margin: '0 0 18px', color: '#003366', fontSize: '15px', fontWeight: '600' };

  return (
    <div style={{ padding: '24px 24px 48px', flex: 1 }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#003366', fontSize: '20px', fontWeight: '700' }}>
          Panel de Administración
        </h1>
        <p style={{ margin: '4px 0 0', color: '#777', fontSize: '13px' }}>
          Resumen del proceso y estadísticas del turno actual
        </p>
      </div>

      {/* KPIs compactos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          { icon: '📦', title: 'Ocupación', ...ocupacion },
          { icon: '🤖', title: 'Robots',    ...robotsActivos },
          { icon: '🚚', title: 'Dispensa',  ...dispensa },
          { icon: '🏪', title: 'Recepción', ...recepcion },
          { icon: '🚨', title: 'Alarmas',   ...alarmas, barColor: '#AD3333', iconColor: '#AD3333' }
        ].map((k, i) => (
          <div key={i} style={{ background: '#FFF', border: '1px solid #DADADA',
            borderRadius: '10px', padding: '12px 14px', boxShadow: '0 1px 4px rgba(0,51,102,0.05)' }}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '7px' }}>
              <span style={{ fontSize: '13px' }}>{k.icon}</span>
              <span style={{ fontSize: '11px', color: '#777', fontWeight: '500' }}>{k.title}</span>
            </div>
            <p style={{ margin: 0, fontSize: '17px', fontWeight: '600',
              color: k.iconColor || '#003366', fontFamily: "'Roboto Mono', monospace" }}>{k.value}</p>
            <div style={{ marginTop: '7px', height: '3px', background: '#DADADA', borderRadius: '2px' }}>
              <div style={{ height: '3px', width: `${k.progress}%`,
                background: k.barColor || '#003366', borderRadius: '2px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Fila principal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', marginBottom: '16px' }}>
        {/* Métricas */}
        <div style={panel}>
          <h2 style={panelTitle}>📈 Métricas del Proceso</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {metricas.map((m, i) => (
              <div key={i} style={{ background: '#F8F9FB', borderRadius: '10px',
                padding: '12px 14px', border: '1px solid #EBEBEB' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                  <span style={{ fontSize: '13px' }}>{m.icon}</span>
                  <span style={{ fontSize: '11px', color: '#777', fontWeight: '500' }}>{m.label}</span>
                </div>
                <span style={{ fontFamily: "'Roboto Mono', monospace",
                  fontSize: '20px', fontWeight: '600', color: m.color }}>{m.value}</span>
                <span style={{ fontSize: '11px', color: '#999', marginLeft: '4px' }}>{m.unit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Estado + eventos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={panel}>
            <h2 style={{ ...panelTitle, marginBottom: '14px' }}>📊 Estado del Sistema</h2>
            <EstadoIndicador estado={estadoSistema.estado} alarmas={estadoSistema.alarmasActivas} />
            <div style={{
              marginTop: '12px', padding: '9px 12px', borderRadius: '8px', fontSize: '12px',
              background: conexion === 'estable' ? 'rgba(26,158,90,0.07)' : 'rgba(173,51,51,0.07)',
              border: `1px solid ${conexion === 'estable' ? 'rgba(26,158,90,0.3)' : 'rgba(173,51,51,0.3)'}`,
              color: conexion === 'estable' ? '#1A9E5A' : '#AD3333',
              fontWeight: '500', display: 'flex', alignItems: 'center', gap: '7px'
            }}>
              <div style={{ width:'8px', height:'8px', borderRadius:'50%', flexShrink:0,
                background: conexion === 'estable' ? '#1A9E5A' : '#AD3333' }} />
              Conexión {conexion} · <span style={{ fontFamily:"'Roboto Mono', monospace" }}>{hora}</span>
            </div>
          </div>
          <div style={panel}>
            <h2 style={{ ...panelTitle, marginBottom: '12px' }}>🔔 Eventos Recientes</h2>
            {[
              { t: '23:48', msg: 'Robot B2 en mantenimiento', c: '#D48B00' },
              { t: '23:31', msg: 'Cola FIFO superó 5 ítems',  c: '#D48B00' },
              { t: '22:10', msg: 'Turno 2 iniciado',          c: '#1A9E5A' }
            ].map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', padding: '7px 0',
                borderBottom: i < 2 ? '1px solid #F0F0F0' : 'none' }}>
                <span style={{ fontFamily:"'Roboto Mono', monospace", fontSize:'11px',
                  color:'#999', flexShrink:0 }}>{ev.t}</span>
                <span style={{ fontSize:'12px', color:ev.c, fontWeight:'500' }}>{ev.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Turnos */}
      <div style={{ ...panel, marginBottom: '0' }}>
        <h2 style={panelTitle}>🕐 Análisis de Turnos del Día</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#F5F7FA' }}>
              {['Turno', 'Horario', 'Pedidos', 'Eficiencia', 'Estado'].map(h => (
                <th key={h} style={{ padding: '9px 12px', textAlign: 'left', color: '#555',
                  fontWeight: '600', fontSize: '11px', textTransform: 'uppercase',
                  letterSpacing: '0.4px', borderBottom: '1px solid #DADADA' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {turnos.map((t, i) => (
              <tr key={i} style={{ borderBottom: i < 2 ? '1px solid #F0F0F0' : 'none' }}>
                <td style={{ padding: '11px 12px', fontWeight: '600', color: '#222' }}>{t.nombre}</td>
                <td style={{ padding: '11px 12px', color: '#555', fontFamily:"'Roboto Mono', monospace", fontSize:'12px' }}>{t.hora}</td>
                <td style={{ padding: '11px 12px', fontFamily:"'Roboto Mono', monospace", color:'#003366', fontWeight:'600' }}>{t.pedidos}</td>
                <td style={{ padding: '11px 12px', fontFamily:"'Roboto Mono', monospace", color:t.c, fontWeight:'600' }}>{t.efic}</td>
                <td style={{ padding: '11px 12px' }}>
                  <span style={{ padding:'3px 10px', borderRadius:'6px', fontSize:'11px',
                    fontWeight:'600', color:t.c, background:`${t.c}18` }}>{t.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VISTA SUPER ADMIN — centro de operaciones
───────────────────────────────────────────── */
function SuperAdminView({ datos, estadoSistema, conexion, hora }) {
  const { ocupacion, robotsActivos, dispensa, recepcion, alarmas } = datos;

  const conexiones = [
    { nombre: 'MQTT Broker',   estado: 'Conectado',    c: '#1A9E5A' },
    { nombre: 'API REST',      estado: 'Conectado',    c: '#1A9E5A' },
    { nombre: 'Base de datos', estado: 'En revisión',  c: '#D48B00' },
    { nombre: 'WebSocket',     estado: 'Desconectado', c: '#AD3333' },
  ];
  const sysInfo = [
    { k: 'Versión HMI', v: '2.0.0-draft' },
    { k: 'Framework',   v: 'React 19'     },
    { k: 'Protocolo',   v: 'MQTT / REST'  },
    { k: 'Entorno',     v: 'Desarrollo'   },
    { k: 'Uptime',      v: '99.7 %'       },
  ];
  const usuarios = [
    { u: 'superadmin', rol: 'Super Admin', nivel: 3, activo: true  },
    { u: 'admin',      rol: 'Admin',       nivel: 2, activo: true  },
    { u: 'operario',   rol: 'Operario',    nivel: 1, activo: false },
  ];

  const panel = { background: '#FFF', border: '1px solid #DADADA', borderRadius: '12px',
    padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,51,102,0.05)' };
  const panelTitle = { margin: '0 0 14px', color: '#003366', fontSize: '14px', fontWeight: '600' };

  return (
    <div style={{ padding: '24px 24px 48px', flex: 1 }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#003366', fontSize: '20px', fontWeight: '700' }}>
          Centro de Operaciones — Super Admin
        </h1>
        <p style={{ margin: '4px 0 0', color: '#777', fontSize: '13px' }}>
          Vista técnica completa del sistema AS/RS
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '10px', marginBottom: '16px' }}>
        {[
          { icon: '📦', title: 'Ocupación', ...ocupacion },
          { icon: '🤖', title: 'Robots',    ...robotsActivos },
          { icon: '🚚', title: 'Dispensa',  ...dispensa },
          { icon: '🏪', title: 'Recepción', ...recepcion },
          { icon: '🚨', title: 'Alarmas',   ...alarmas, barColor: '#AD3333', iconColor: '#AD3333' }
        ].map((k, i) => (
          <div key={i} style={{ background: '#FFF', border: '1px solid #DADADA',
            borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px' }}>{k.icon}</span>
              <span style={{ fontSize: '11px', color: '#777', fontWeight: '500' }}>{k.title}</span>
            </div>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '600',
              color: k.iconColor || '#003366', fontFamily: "'Roboto Mono', monospace" }}>{k.value}</p>
            <div style={{ marginTop: '6px', height: '3px', background: '#DADADA', borderRadius: '2px' }}>
              <div style={{ height: '3px', width: `${k.progress}%`,
                background: k.barColor || '#003366', borderRadius: '2px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Fila técnica */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 260px', gap: '14px', marginBottom: '14px' }}>
        <div style={panel}>
          <h3 style={panelTitle}>🖥️ Información del Sistema</h3>
          {sysInfo.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
              padding: '7px 0', borderBottom: i < sysInfo.length-1 ? '1px solid #F0F0F0' : 'none' }}>
              <span style={{ fontSize: '12px', color: '#777' }}>{s.k}</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#003366',
                fontFamily: "'Roboto Mono', monospace" }}>{s.v}</span>
            </div>
          ))}
        </div>
        <div style={panel}>
          <h3 style={panelTitle}>🔌 Estado de Conexiones</h3>
          {conexiones.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '8px 0',
              borderBottom: i < conexiones.length-1 ? '1px solid #F0F0F0' : 'none' }}>
              <span style={{ fontSize: '12px', color: '#555' }}>{c.nombre}</span>
              <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 9px',
                borderRadius: '6px', color: c.c, background: `${c.c}18` }}>{c.estado}</span>
            </div>
          ))}
        </div>
        <div style={panel}>
          <h3 style={panelTitle}>📊 Estado General</h3>
          <EstadoIndicador estado={estadoSistema.estado} alarmas={estadoSistema.alarmasActivas} />
          <p style={{ margin: '10px 0 0', fontSize: '11px', color: '#999' }}>
            <span style={{ fontFamily: "'Roboto Mono', monospace" }}>{hora}</span>
          </p>
        </div>
      </div>

      {/* Métricas + Usuarios */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '0' }}>
        <div style={panel}>
          <h3 style={panelTitle}>📈 Métricas del Proceso</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Pedidos hoy',  value: '24',   unit: 'ped',  color: '#003366' },
              { label: 'Eficiencia',   value: '94.3', unit: '%',    color: '#1A9E5A' },
              { label: 'T. despacho',  value: '3.2',  unit: 'min',  color: '#D48B00' },
              { label: 'Cola FIFO',    value: '7',    unit: 'items',color: '#003366' },
              { label: 'Uptime',       value: '99.7', unit: '%',    color: '#1A9E5A' },
              { label: 'Errores',      value: '1',    unit: 'ev.',  color: '#AD3333' },
            ].map((m, i) => (
              <div key={i} style={{ background: '#F8F9FB', borderRadius: '8px',
                padding: '10px 11px', border: '1px solid #EBEBEB' }}>
                <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#777', fontWeight: '500' }}>{m.label}</p>
                <p style={{ margin: 0, fontFamily: "'Roboto Mono', monospace",
                  fontSize: '18px', fontWeight: '600', color: m.color, lineHeight: 1 }}>
                  {m.value}<span style={{ fontSize: '10px', color: '#999', marginLeft: '2px' }}>{m.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...panel, border: '1px solid rgba(173,51,51,0.2)' }}>
          <h3 style={{ ...panelTitle, color: '#AD3333' }}>👥 Gestión de Usuarios</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#F5F7FA' }}>
                {['Usuario', 'Rol', 'Nivel', 'Estado'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#555',
                    fontWeight: '600', fontSize: '11px', textTransform: 'uppercase',
                    borderBottom: '1px solid #DADADA' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u, i) => (
                <tr key={i} style={{ borderBottom: i < 2 ? '1px solid #F0F0F0' : 'none' }}>
                  <td style={{ padding: '10px', fontFamily:"'Roboto Mono', monospace",
                    color:'#003366', fontWeight:'600' }}>{u.u}</td>
                  <td style={{ padding: '10px', color: '#555' }}>{u.rol}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <span style={{ width:'22px', height:'22px', borderRadius:'50%',
                      background:'#003366', color:'#FFF', fontSize:'11px', fontWeight:'700',
                      display:'inline-flex', alignItems:'center', justifyContent:'center' }}>{u.nivel}</span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ padding:'2px 8px', borderRadius:'5px', fontSize:'11px', fontWeight:'600',
                      color: u.activo ? '#1A9E5A' : '#999',
                      background: u.activo ? 'rgba(26,158,90,0.1)' : '#F0F0F0' }}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Indicador de estado compartido ── */
function EstadoIndicador({ estado, alarmas }) {
  const ok = estado === 'normal';
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px',
        borderRadius: '8px', marginBottom: '8px',
        background: ok ? 'rgba(26,158,90,0.06)' : 'rgba(212,139,0,0.06)',
        border: `1px solid ${ok ? 'rgba(26,158,90,0.3)' : 'rgba(212,139,0,0.4)'}`
      }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
          background: ok ? '#1A9E5A' : '#D48B00',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
        }}>{ok ? '✅' : '⚠️'}</div>
        <div>
          <p style={{ margin: 0, fontWeight: '600', fontSize: '12px', color: '#222' }}>Sistema</p>
          <p style={{ margin: '2px 0 0', fontSize: '12px', fontWeight: '500',
            color: ok ? '#1A9E5A' : '#D48B00' }}>{ok ? 'Operativo' : 'En advertencia'}</p>
        </div>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 12px', borderRadius: '8px',
        background: alarmas > 0 ? 'rgba(173,51,51,0.06)' : 'rgba(26,158,90,0.06)',
        border: `1px solid ${alarmas > 0 ? 'rgba(173,51,51,0.25)' : 'rgba(26,158,90,0.3)'}`
      }}>
        <span style={{ fontSize: '12px', fontWeight: '600',
          color: alarmas > 0 ? '#AD3333' : '#1A9E5A' }}>
          {alarmas > 0 ? '🔴 Requiere atención' : '🟢 Sin alarmas'}
        </span>
        <span style={{
          width: '26px', height: '26px', borderRadius: '50%',
          background: alarmas > 0 ? '#AD3333' : '#1A9E5A', color: '#FFF',
          fontWeight: '700', fontSize: '12px', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Roboto Mono', monospace"
        }}>{alarmas}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────── */
export default function Dashboard({
  ocupacion     = { value: '77%',           progress: 77, footer: 'Alta ocupación' },
  robotsActivos = { value: '2 / 5',         progress: 40, footer: 'En espera' },
  dispensa      = { value: '1 / 3 activos', progress: 33, footer: 'Sin' },
  recepcion     = { value: '1 / 2 activos', progress: 50, footer: 'En cola' },
  alarmas       = { value: '2 activas',     progress: 20, footer: 'Requiere atención' },
  estadoSistema = { estado: 'advertencia',  alarmasActivas: 2 },
  ultimaActualizacion: ultimaActualizacionProp,
  conexion      = 'estable'
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'operario';

  const [hora, setHora] = useState(
    ultimaActualizacionProp || new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  );
  useEffect(() => {
    const id = setInterval(() => setHora(
      new Date().toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit', second:'2-digit' })
    ), 1000);
    return () => clearInterval(id);
  }, []);

  function handleLogout() { logout(); navigate('/login', { replace: true }); }

  const datos = { ocupacion, robotsActivos, dispensa, recepcion, alarmas };

  const hasSidebar = role === 'admin' || role === 'superadmin';

  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <TopBar user={user} hora={hora} onLogout={handleLogout} />

      {hasSidebar ? (
        /* Layout con sidebar para admin y superadmin */
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
          <Sidebar role={role} />
          {role === 'admin'      && <AdminView      datos={datos} estadoSistema={estadoSistema} conexion={conexion} hora={hora} />}
          {role === 'superadmin' && <SuperAdminView datos={datos} estadoSistema={estadoSistema} conexion={conexion} hora={hora} />}
        </div>
      ) : (
        /* Layout full-width para operario */
        <OperarioView datos={datos} hora={hora} estadoSistema={estadoSistema} conexion={conexion} />
      )}
    </div>
  );
}
