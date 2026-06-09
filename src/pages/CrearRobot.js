import React, { useEffect, useState } from 'react';

// ── Paleta idéntica a robot.js ──────────────────────────────────────────────
const PRIMARY  = '#003366';
const ACCENT   = '#AD3333';
const GREEN    = '#1A9E5A';
const WARN     = '#D48B00';
const BLUE     = '#2563EB';
const NEUTRAL  = '#DADADA';
const FONT     = "'Century Gothic', Candara, 'Trebuchet MS', sans-serif";
const MONO     = "'Roboto Mono', monospace";

// ── Campos del formulario en orden ─────────────────────────────────────────
const CAMPOS = [
  {
    key: 'modelo',
    label: 'Modelo del Robot',
    tipo: 'text',
    placeholder: 'Ej: AGV-X200',
    requerido: true,
    icono: '🤖',
  },
  {
    key: 'capacidad_kg',
    label: 'Capacidad de Carga (kg)',
    tipo: 'number',
    placeholder: 'Ej: 250',
    requerido: true,
    icono: '⚖️',
    min: 0,
    step: 0.5,
  },
  {
    key: 'velocidad_max',
    label: 'Velocidad Máxima (m/s)',
    tipo: 'number',
    placeholder: 'Ej: 1.5',
    requerido: true,
    icono: '⚡',
    min: 0,
    step: 0.1,
  },
  {
    key: 'autonomia_min',
    label: 'Autonomía de Batería (minutos)',
    tipo: 'number',
    placeholder: 'Ej: 480',
    requerido: true,
    icono: '🔋',
    min: 1,
    step: 1,
  },
  {
    key: 'ubicacion_inicial',
    label: 'Ubicación Inicial',
    tipo: 'select',
    opciones: ['Zona A', 'Zona B', 'Zona C', 'Estación de carga', 'Almacén principal'],
    requerido: false,
    icono: '📍',
  },
  {
    key: 'descripcion',
    label: 'Descripción / Notas',
    tipo: 'textarea',
    placeholder: 'Información adicional del robot...',
    requerido: false,
    icono: '📝',
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function getToken() {
  try {
    const user = JSON.parse(sessionStorage.getItem('asrs_user') || '{}');
    return user.token || '';
  } catch {
    return '';
  }
}
// ── Componente principal ────────────────────────────────────────────────────
export default function CrearRobot() {
  const [siguienteNombre, setSiguienteNombre] = useState('AVG_003');
  const [form, setForm]     = useState({ ubicacion_inicial: 'Zona A' });
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null); // { robot_id, qr_base64, specs, numero }
  const [errorGlobal, setErrorGlobal] = useState('');
  const [tab, setTab] = useState('form'); // 'form' | 'qr'

  // Obtener el siguiente número al montar
  useEffect(() => {
    fetch('http://localhost:8000/robots/count', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then(d => setSiguienteNombre(d.siguiente_nombre))
      .catch(() => {});
  }, []);

  // ── Validación ────────────────────────────────────────────────────────────
  function validar() {
    const e = {};
    CAMPOS.forEach(c => {
      if (c.requerido && !form[c.key]) e[c.key] = 'Este campo es requerido';
      if (c.tipo === 'number' && form[c.key] !== undefined && Number(form[c.key]) < 0)
        e[c.key] = 'Debe ser un valor positivo';
    });
    return e;
  }

  // ── Enviar ────────────────────────────────────────────────────────────────
  async function handleCrear() {
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length) return;

    setEnviando(true);
    setErrorGlobal('');
    try {
      const res = await fetch('http://localhost:8000/robots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ...form,
          capacidad_kg:  Number(form.capacidad_kg),
          velocidad_max: Number(form.velocidad_max),
          autonomia_min: Number(form.autonomia_min),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al crear el robot');
      }
      const data = await res.json();
      setResultado(data);
      setTab('qr');
    } catch (err) {
      setErrorGlobal(err.message);
    } finally {
      setEnviando(false);
    }
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  function handleNuevo() {
    setForm({ ubicacion_inicial: 'Zona A' });
    setErrores({});
    setResultado(null);
    setErrorGlobal('');
    setTab('form');
    // Refrescar el número sugerido
    fetch('http://localhost:8000/robots/count', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then(d => setSiguienteNombre(d.siguiente_nombre))
      .catch(() => {});
  }

  // ── Descargar QR ──────────────────────────────────────────────────────────
  function descargarQR() {
    if (!resultado?.qr_base64) return;
    const a = document.createElement('a');
    a.href = `data:image/png;base64,${resultado.qr_base64}`;
    a.download = `QR_${resultado.robot_id.replace(/\s/g, '_')}.png`;
    a.click();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{
      background: '#f4f6f9', minHeight: '100vh',
      fontFamily: FONT, padding: '28px',
    }}>

      {/* ── ENCABEZADO ── */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: PRIMARY }}>
            ➕ Crear Robot AGV
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#777' }}>
            Registra un nuevo vehículo en la flota · Se asignará automáticamente como <strong>{siguienteNombre}</strong>
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['form', 'qr'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              disabled={t === 'qr' && !resultado}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: `1px solid ${tab === t ? PRIMARY : NEUTRAL}`,
                background: tab === t ? PRIMARY : 'white',
                color: tab === t ? 'white' : t === 'qr' && !resultado ? '#bbb' : PRIMARY,
                fontSize: '12px', fontFamily: FONT, cursor: t === 'qr' && !resultado ? 'not-allowed' : 'pointer',
                fontWeight: 600, transition: 'all 0.2s',
              }}
            >
              {t === 'form' ? '📋 Formulario' : '📱 Código QR'}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: FORMULARIO
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'form' && (
        <div style={{
          background: 'white', borderRadius: '16px',
          boxShadow: '0 3px 16px rgba(0,51,102,0.09)',
          padding: '32px', maxWidth: '720px',
        }}>

          {/* Nombre auto-asignado */}
          <div style={{
            background: `${PRIMARY}0d`, borderRadius: '10px',
            padding: '14px 18px', marginBottom: '28px',
            border: `1px solid ${PRIMARY}30`,
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <span style={{ fontSize: '22px' }}>🏷️</span>
            <div>
              <div style={{ fontSize: '11px', color: PRIMARY, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Nombre asignado automáticamente
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: MONO, color: PRIMARY }}>
                {siguienteNombre}
              </div>
            </div>
          </div>

          {/* Campos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {CAMPOS.map((campo, idx) => (
              <div key={campo.key}>
                {/* Label */}
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '13px', fontWeight: 600, color: '#444',
                  marginBottom: '6px',
                }}>
                  <span style={{ fontSize: '15px' }}>{campo.icono}</span>
                  {campo.label}
                  {campo.requerido && <span style={{ color: ACCENT, fontSize: '11px' }}>*</span>}
                  <span style={{
                    marginLeft: '4px', background: '#f0f0f0', borderRadius: '4px',
                    padding: '1px 6px', fontSize: '10px', color: '#888', fontFamily: MONO,
                  }}>
                    {idx + 1}
                  </span>
                </label>

                {/* Input según tipo */}
                {campo.tipo === 'textarea' ? (
                  <textarea
                    rows={3}
                    placeholder={campo.placeholder}
                    value={form[campo.key] || ''}
                    onChange={e => setForm(f => ({ ...f, [campo.key]: e.target.value }))}
                    style={inputStyle(errores[campo.key])}
                  />
                ) : campo.tipo === 'select' ? (
                  <select
                    value={form[campo.key] || ''}
                    onChange={e => setForm(f => ({ ...f, [campo.key]: e.target.value }))}
                    style={inputStyle(errores[campo.key])}
                  >
                    {campo.opciones.map(op => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={campo.tipo}
                    placeholder={campo.placeholder}
                    min={campo.min}
                    step={campo.step}
                    value={form[campo.key] || ''}
                    onChange={e => setForm(f => ({ ...f, [campo.key]: e.target.value }))}
                    style={inputStyle(errores[campo.key])}
                  />
                )}

                {/* Error */}
                {errores[campo.key] && (
                  <div style={{ fontSize: '11px', color: ACCENT, marginTop: '4px' }}>
                    ⚠️ {errores[campo.key]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Error global */}
          {errorGlobal && (
            <div style={{
              marginTop: '20px', padding: '12px 16px',
              background: '#fff0f0', borderRadius: '8px',
              border: `1px solid ${ACCENT}40`, color: ACCENT,
              fontSize: '13px', fontWeight: 600,
            }}>
              ⚠️ {errorGlobal}
            </div>
          )}

          {/* Botón crear */}
          <button
            onClick={handleCrear}
            disabled={enviando}
            style={{
              marginTop: '28px', width: '100%',
              padding: '14px',
              background: enviando ? NEUTRAL : `linear-gradient(135deg, ${PRIMARY}, #1a5599)`,
              color: enviando ? '#999' : 'white',
              border: 'none', borderRadius: '10px',
              fontSize: '15px', fontWeight: 700, fontFamily: FONT,
              cursor: enviando ? 'not-allowed' : 'pointer',
              boxShadow: enviando ? 'none' : `0 4px 14px ${PRIMARY}40`,
              transition: 'all 0.2s',
              letterSpacing: '0.3px',
            }}
          >
            {enviando ? '⏳ Creando robot...' : `🤖 Crear ${siguienteNombre}`}
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: QR + RESUMEN
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'qr' && resultado && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px', maxWidth: '900px',
        }}>

          {/* Tarjeta QR */}
          <div style={{
            background: 'white', borderRadius: '16px',
            boxShadow: '0 3px 16px rgba(0,51,102,0.09)',
            padding: '28px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Código QR del Robot
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: MONO, color: PRIMARY, marginBottom: '20px' }}>
              {resultado.robot_id}
            </div>

            {/* QR image */}
            <div style={{
              display: 'inline-block', padding: '12px',
              background: 'white', borderRadius: '12px',
              border: `2px solid ${PRIMARY}20`,
              boxShadow: '0 4px 20px rgba(0,51,102,0.12)',
            }}>
              <img
                src={`data:image/png;base64,${resultado.qr_base64}`}
                alt={`QR ${resultado.robot_id}`}
                style={{ width: '200px', height: '200px', display: 'block' }}
              />
            </div>

            <p style={{ fontSize: '12px', color: '#999', margin: '14px 0 0', fontFamily: MONO }}>
              Al escanearlo pedirá login y redirige a /robots
            </p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={descargarQR}
                style={{
                  flex: 1, padding: '10px',
                  background: `linear-gradient(135deg, ${PRIMARY}, #1a5599)`,
                  color: 'white', border: 'none', borderRadius: '8px',
                  fontSize: '13px', fontWeight: 700, fontFamily: FONT,
                  cursor: 'pointer',
                }}
              >
                ⬇️ Descargar QR
              </button>
              <button
                onClick={handleNuevo}
                style={{
                  flex: 1, padding: '10px',
                  background: 'white', color: PRIMARY,
                  border: `1px solid ${PRIMARY}`, borderRadius: '8px',
                  fontSize: '13px', fontWeight: 700, fontFamily: FONT,
                  cursor: 'pointer',
                }}
              >
                ➕ Crear otro
              </button>
            </div>
          </div>

          {/* Tarjeta de especificaciones */}
          <div style={{
            background: 'white', borderRadius: '16px',
            boxShadow: '0 3px 16px rgba(0,51,102,0.09)',
            padding: '28px',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
              Especificaciones registradas
            </div>

            {/* Badge éxito */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '20px',
              background: '#e8f5ee', color: GREEN,
              fontSize: '12px', fontWeight: 700, marginBottom: '20px',
              border: `1px solid ${GREEN}40`,
            }}>
              ✅ Robot creado exitosamente
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { icono: '🏷️', label: 'Nombre', valor: resultado.robot_id },
                { icono: '🤖', label: 'Modelo', valor: resultado.specs.modelo },
                { icono: '⚖️', label: 'Capacidad', valor: `${resultado.specs.capacidad_kg} kg` },
                { icono: '⚡', label: 'Velocidad máx.', valor: `${resultado.specs.velocidad_max} m/s` },
                { icono: '🔋', label: 'Autonomía', valor: `${resultado.specs.autonomia_min} min` },
                { icono: '📍', label: 'Ubicación inicial', valor: resultado.specs.ubicacion_inicial || 'Zona A' },
                ...(resultado.specs.descripcion
                  ? [{ icono: '📝', label: 'Descripción', valor: resultado.specs.descripcion }]
                  : []),
              ].map(({ icono, label, valor }) => (
                <div key={label} style={{
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  padding: '10px 14px', borderRadius: '8px',
                  background: '#f8f9fb',
                }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{icono}</span>
                  <div>
                    <div style={{ fontSize: '10px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: MONO, color: PRIMARY }}>
                      {valor}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Estilo reutilizable para inputs ─────────────────────────────────────────
function inputStyle(hasError) {
  return {
    width: '100%', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px',
    fontFamily: "'Century Gothic', Candara, 'Trebuchet MS', sans-serif",
    border: `1px solid ${hasError ? '#AD3333' : '#ddd'}`,
    background: hasError ? '#fff8f8' : 'white',
    color: '#222', outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    resize: 'vertical',
  };
}