import React, { useState, useEffect, useCallback } from "react";
import { obtenerInventario } from '../services/api';

const PRIMARY  = '#003366';
const ACCENT   = '#AD3333';
const NEUTRAL  = '#DADADA';
const GREEN    = '#1A9E5A';
const WARN     = '#D48B00';
const BLUE     = '#2563EB';
const FONT     = "'Century Gothic', Candara, 'Trebuchet MS', sans-serif";
const MONO     = "'Roboto Mono', monospace";

const MAX_CAPACIDAD = 20;

const MOCK = [
  { id: 1,  sku: "CAJA-A101", category: "A", pos_x: 0, pos_y: 0, status: "stored",     created_at: "2026-05-14T08:15:00" },
  { id: 2,  sku: "CAJA-A102", category: "A", pos_x: 1, pos_y: 0, status: "stored",     created_at: "2026-05-14T09:20:00" },
  { id: 3,  sku: "CAJA-B201", category: "B", pos_x: 2, pos_y: 1, status: "in_transit", created_at: "2026-05-15T10:05:00" },
  { id: 4,  sku: "CAJA-A103", category: "A", pos_x: 0, pos_y: 2, status: "stored",     created_at: "2026-05-15T10:30:00" },
  { id: 5,  sku: "CAJA-C301", category: "C", pos_x: 3, pos_y: 1, status: "stored",     created_at: "2026-05-15T11:00:00" },
  { id: 6,  sku: "CAJA-B202", category: "B", pos_x: 1, pos_y: 3, status: "in_transit", created_at: "2026-05-15T11:45:00" },
  { id: 7,  sku: "CAJA-C302", category: "C", pos_x: 4, pos_y: 0, status: "stored",     created_at: "2026-05-15T12:10:00" },
  { id: 8,  sku: "CAJA-A104", category: "A", pos_x: 2, pos_y: 3, status: "stored",     created_at: "2026-05-15T13:00:00" },
  { id: 9,  sku: "CAJA-B203", category: "B", pos_x: 3, pos_y: 0, status: "stored",     created_at: "2026-05-15T14:10:00" },
  { id: 10, sku: "CAJA-C303", category: "C", pos_x: 4, pos_y: 2, status: "stored",     created_at: "2026-05-15T14:45:00" },
];

// Extrae la categoría del campo category del backend; si no existe, la infiere del SKU
function getCategoryFromItem(item) {
  if (item.category && ['A', 'B', 'C'].includes(item.category.toUpperCase())) {
    return item.category.toUpperCase();
  }
  if (item.sku?.includes('-A')) return 'A';
  if (item.sku?.includes('-B')) return 'B';
  return 'C';
}

const CAT_CFG = {
  A: { label: 'A', color: GREEN,   bg: '#e8f5ee', title: 'Alta rotación'  },
  B: { label: 'B', color: BLUE,    bg: '#eff6ff', title: 'Media rotación' },
  C: { label: 'C', color: WARN,    bg: '#fff8e1', title: 'Baja rotación'  },
};

const STATUS_CFG = {
  stored:     { label: 'En Estantería', color: GREEN,  bg: '#e8f5ee', icon: '📦' },
  in_transit: { label: 'En Tránsito',   color: WARN,   bg: '#fff3e0', icon: '🚚' },
  registrado: { label: 'Registrado',    color: '#777', bg: '#f5f5f5', icon: '📋' },
};

function CategoryBadge({ category }) {
  const cfg = CAT_CFG[category] || { label: category, color: '#888', bg: '#f0f0f0', title: '' };
  return (
    <span
      title={cfg.title}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '26px', height: '26px', borderRadius: '50%',
        fontSize: '12px', fontWeight: 800, fontFamily: MONO,
        color: cfg.color, background: cfg.bg,
        border: `2px solid ${cfg.color}60`,
        cursor: 'default',
      }}
    >
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { label: status, color: '#888', bg: '#f0f0f0', icon: '•' };
  const isMoving = status === 'in_transit';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '12px',
      fontSize: '11px', fontWeight: 700, fontFamily: FONT,
      color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.color}40`,
    }}>
      <span className={isMoving ? 'wms-pulse' : ''}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

export default function Almacenamiento() {
  const [inventario, setInventario] = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [search, setSearch]         = useState('');
  const [filtroStatus, setFiltro]   = useState('todos');
  const [filtroCat, setFiltroCat]   = useState('todas');
  const [isMobile, setIsMobile]     = useState(() => window.innerWidth < 768);
  const [ultimaActualizacion, setUltima] = useState(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const fetchInventario = useCallback(async () => {
    try {
      const data = await obtenerInventario();
      setInventario(data.inventario || []);
    } catch {
      setInventario(MOCK);
    } finally {
      setCargando(false);
      setUltima(new Date());
    }
  }, []);

  useEffect(() => {
    fetchInventario();
    const interval = setInterval(fetchInventario, 30000);
    return () => clearInterval(interval);
  }, [fetchInventario]);

  // Métricas
  const total       = inventario.length;
  const almacenados = inventario.filter(i => i.status === 'stored').length;
  const enTransito  = inventario.filter(i => i.status === 'in_transit').length;
  const ocupacion   = Math.min(Math.round((total / MAX_CAPACIDAD) * 100), 100);
  const barColor    = ocupacion >= 80 ? ACCENT : ocupacion >= 50 ? WARN : GREEN;

  // Filtrado
  const filtrados = inventario.filter(item => {
    const cat = getCategoryFromItem(item);
    const matchSearch = item.sku?.toLowerCase().includes(search.toLowerCase()) ||
                        String(item.id).includes(search);
    const matchStatus = filtroStatus === 'todos' || item.status === filtroStatus;
    const matchCat    = filtroCat === 'todas' || cat === filtroCat;
    return matchSearch && matchStatus && matchCat;
  });

  return (
    <div style={{ padding: isMobile ? '16px' : '28px', fontFamily: FONT, background: '#f4f6f9', minHeight: '100vh' }}>

      {/* TÍTULO */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: PRIMARY }}>
            Inventario del Almacén
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#777' }}>
            Estado en tiempo real · solo lectura
          </p>
        </div>
        {ultimaActualizacion && (
          <span style={{ fontSize: '11px', color: '#aaa', fontFamily: MONO }}>
            Actualizado: {ultimaActualizacion.toLocaleTimeString('es-CO')}
          </span>
        )}
      </div>

      {/* TARJETAS DE STATS */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total registros', value: total,           color: PRIMARY },
          { label: 'En Estantería',   value: almacenados,     color: GREEN   },
          { label: 'En Tránsito',     value: enTransito,      color: WARN    },
          { label: 'Capacidad usada', value: `${ocupacion}%`, color: barColor },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            flex: '1 1 140px', background: 'white', borderRadius: '10px',
            padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            borderTop: `4px solid ${color}`,
          }}>
            <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: MONO, color }}>{value}</div>
            <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* LEYENDA DE CATEGORÍAS */}
      <div style={{ background: 'white', borderRadius: '10px', padding: '14px 20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: PRIMARY }}>Categorías:</span>
        {Object.entries(CAT_CFG).map(([k, v]) => (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#555' }}>
            <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: v.bg, border: `2px solid ${v.color}`, display: 'inline-block' }} />
            <strong style={{ color: v.color }}>{k}</strong> {v.title}
          </span>
        ))}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#555', marginLeft: 'auto' }}>
          <span style={{ fontSize: '16px' }}>🚚</span>
          <span style={{ color: WARN, fontWeight: 700 }}>En Tránsito</span> = AGV en camino
        </span>
      </div>

      {/* BARRA DE OCUPACIÓN */}
      <div style={{ background: 'white', borderRadius: '10px', padding: '18px 22px', marginBottom: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: PRIMARY }}>Porcentaje de Ocupación</span>
          <span style={{ fontSize: '13px', fontFamily: MONO, color: barColor, fontWeight: 700 }}>
            {total} / {MAX_CAPACIDAD} posiciones · {ocupacion}%
          </span>
        </div>
        <div style={{ background: NEUTRAL, borderRadius: '8px', height: '14px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${ocupacion}%`,
            background: `linear-gradient(90deg, ${PRIMARY}, ${barColor})`,
            borderRadius: '8px', transition: 'width 0.6s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          {['0%', '25%', '50%', '75%', '100%'].map(p => (
            <span key={p} style={{ fontSize: '11px', color: '#aaa', fontFamily: MONO }}>{p}</span>
          ))}
        </div>
      </div>

      {/* TABLA */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>

        {/* Barra de filtros */}
        <div style={{
          padding: '14px 20px', borderBottom: `1px solid ${NEUTRAL}`,
          display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center',
        }}>
          <input
            type="text"
            placeholder="Buscar por ID o Código..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: '160px', padding: '8px 12px',
              border: `1px solid ${NEUTRAL}`, borderRadius: '8px',
              fontSize: '13px', fontFamily: FONT, outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = PRIMARY}
            onBlur={e  => e.target.style.borderColor = NEUTRAL}
          />
          {/* Filtro por categoría */}
          <select
            value={filtroCat}
            onChange={e => setFiltroCat(e.target.value)}
            style={{
              padding: '8px 12px', border: `1px solid ${NEUTRAL}`, borderRadius: '8px',
              fontSize: '13px', fontFamily: FONT, background: 'white', color: '#333', cursor: 'pointer',
            }}
          >
            <option value="todas">Todas las categorías</option>
            <option value="A">Categoría A</option>
            <option value="B">Categoría B</option>
            <option value="C">Categoría C</option>
          </select>
          {/* Filtro por estado */}
          <select
            value={filtroStatus}
            onChange={e => setFiltro(e.target.value)}
            style={{
              padding: '8px 12px', border: `1px solid ${NEUTRAL}`, borderRadius: '8px',
              fontSize: '13px', fontFamily: FONT, background: 'white', color: '#333', cursor: 'pointer',
            }}
          >
            <option value="todos">Todos los estados</option>
            <option value="stored">En Estantería</option>
            <option value="in_transit">En Tránsito</option>
          </select>
          <button
            onClick={fetchInventario}
            style={{
              padding: '8px 16px', border: `1px solid ${PRIMARY}`, borderRadius: '8px',
              background: 'white', color: PRIMARY, fontSize: '13px',
              fontFamily: FONT, cursor: 'pointer', fontWeight: 600,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.target.style.background = PRIMARY; e.target.style.color = 'white'; }}
            onMouseLeave={e => { e.target.style.background = 'white'; e.target.style.color = PRIMARY; }}
          >
            Actualizar
          </button>
          <span style={{ fontSize: '12px', color: '#aaa', whiteSpace: 'nowrap' }}>
            {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Contenido */}
        {cargando ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#aaa', fontFamily: FONT }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
            Cargando inventario...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: PRIMARY }}>
                  {[
                    { label: 'ID',               hint: 'Identificador interno del almacén' },
                    { label: 'Código',            hint: 'Código de venta del producto (SKU)' },
                    { label: 'Cat.',              hint: 'A=Alta rotación · B=Media · C=Baja' },
                    { label: 'Pos. X',            hint: 'Columna en la matriz del almacén' },
                    { label: 'Pos. Y',            hint: 'Fila en la matriz del almacén' },
                    { label: 'Estado',            hint: 'En estantería, en tránsito o registrado' },
                    { label: 'Fecha de ingreso',  hint: 'Cuándo ingresó al sistema' },
                  ].map(({ label, hint }) => (
                    <th key={label} title={hint} style={{
                      padding: '12px 16px', textAlign: 'left', color: 'white',
                      fontFamily: FONT, fontWeight: 600, fontSize: '12px',
                      whiteSpace: 'nowrap', letterSpacing: '0.4px', cursor: 'help',
                    }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '52px', textAlign: 'center', color: '#bbb', fontFamily: FONT }}>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                      No hay registros que coincidan con los filtros
                    </td>
                  </tr>
                ) : filtrados.map((item, idx) => {
                  const cat = getCategoryFromItem(item);
                  const isMoving = item.status === 'in_transit';
                  return (
                    <tr
                      key={item.id}
                      style={{
                        background: isMoving
                          ? `rgba(212,139,0,0.04)`
                          : idx % 2 === 0 ? 'white' : '#fafbfc',
                        borderBottom: `1px solid ${isMoving ? '#ffe0a0' : NEUTRAL}`,
                        borderLeft: isMoving ? `3px solid ${WARN}` : '3px solid transparent',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#eef2f8'}
                      onMouseLeave={e => e.currentTarget.style.background = isMoving
                        ? `rgba(212,139,0,0.04)` : idx % 2 === 0 ? 'white' : '#fafbfc'}
                    >
                      <td style={{ padding: '12px 16px', fontFamily: MONO, color: '#999', fontSize: '12px' }}>
                        #{item.id}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: MONO, fontWeight: 700, color: PRIMARY }}>
                        {item.sku}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <CategoryBadge category={cat} />
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontFamily: MONO, fontSize: '14px' }}>
                        {item.pos_x}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontFamily: MONO, fontSize: '14px' }}>
                        {item.pos_y}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <StatusBadge status={item.status} />
                      </td>
                      <td style={{ padding: '12px 16px', color: '#555', whiteSpace: 'nowrap', fontSize: '12px', fontFamily: MONO }}>
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString('es-CO', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
