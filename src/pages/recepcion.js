import React, { useState } from "react";
import { crearProductoEnInventario, registrarProducto, simularEscaneoQR } from '../services/api';
import { useWs } from '../context/WsContext';
import StationStatus from '../components/recepcion/StationStatus';
import ProductQueue from '../components/recepcion/ProductQueue';
import LocalAlerts from '../components/recepcion/LocalAlerts';
import OperationControls from '../components/recepcion/OperationControls';

const PRIMARY = '#003366';
const GREEN   = '#1A9E5A';
const ACCENT  = '#AD3333';
const NEUTRAL = '#DADADA';
const FONT    = "'Century Gothic', Candara, 'Trebuchet MS', sans-serif";
const MONO    = "'Roboto Mono', monospace";

const CATEGORIAS = [
  { value: 'A', label: 'A — Alta rotación', color: GREEN },
  { value: 'B', label: 'B — Media rotación', color: '#2563EB' },
  { value: 'C', label: 'C — Baja rotación',  color: '#D48B00' },
];

const EMPTY_FORM = { codigo: '', peso: '', categoria: 'A' };

export default function Recepcion() {
  const [form, setForm]         = useState(EMPTY_FORM);
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores]   = useState({});
  const [queue, setQueue]       = useState([]);
  const [alerts, setAlerts]     = useState([]);
  const [simQrCargando, setSimQrCargando] = useState(false);

  const wsCtx = useWs();

  function validar() {
    const e = {};
    if (!form.codigo.trim())
      e.codigo = 'El código del producto es obligatorio.';
    if (!form.peso || isNaN(form.peso) || Number(form.peso) <= 0)
      e.peso = 'Ingresa un peso válido (kg).';
    if (!form.categoria)
      e.categoria = 'Selecciona una categoría.';
    return e;
  }

  // Envía un escaneo QR simulado al tópico MQTT a través del backend
  async function handleSimularQR() {
    const sku = form.codigo.trim() || `CAJA-${form.categoria}${Math.floor(100 + Math.random() * 900)}`;
    setSimQrCargando(true);
    const now = new Date().toLocaleTimeString('es-CO');
    try {
      await simularEscaneoQR(sku);
      setAlerts(prev => [
        { message: `QR simulado enviado al backend: ${sku}`, time: now },
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      // Avisa si el endpoint aún no existe en el backend
      if (wsCtx) wsCtx.addToast(`Simulación QR local: ${sku} — ${err.message}`, 'info');
      setAlerts(prev => [
        { message: `Sim. QR local (${sku}): ${err.message}`, time: now },
        ...prev.slice(0, 4),
      ]);
    } finally {
      setSimQrCargando(false);
    }
  }

  async function handleStart() {
    const e = validar();
    if (Object.keys(e).length) { setErrores(e); return; }
    setErrores({});
    setEnviando(true);

    const sku = form.codigo.trim();
    const now = new Date().toLocaleTimeString('es-CO');

    try {
      // Paso 1: Registrar metadatos del producto con su categoría
      await registrarProducto(sku, form.categoria);

      // Paso 2: Ordenar almacenamiento (calcula ruta A* y envía comando AGV)
      const data = await crearProductoEnInventario(sku, Number(form.peso));

      const pos = data.asignacion_fifo
        ? `(X:${data.asignacion_fifo.x}, Y:${data.asignacion_fifo.y})`
        : '—';

      setQueue(prev => [
        {
          id: sku,
          status: `Cat. ${form.categoria} · Posición ${pos}`,
          time: now,
          state: 'Completado',
        },
        ...prev,
      ]);

      setAlerts(prev => [
        { message: `Producto ${sku} [Cat. ${form.categoria}] recibido y asignado a ${pos}`, time: now },
        ...prev.slice(0, 4),
      ]);

      setForm(EMPTY_FORM);
    } catch (err) {
      setAlerts(prev => [
        { message: `Error al registrar ${sku}: ${err.message}`, time: now },
        ...prev.slice(0, 4),
      ]);
    } finally {
      setEnviando(false);
    }
  }

  function handlePause()    { /* operación de pausa futura */ }
  function handleAbort()    { setForm(EMPTY_FORM); setErrores({}); }
  function handleCallRobot(){ /* envío de comando AGV futuro */ }

  const inputStyle = (hasErr) => ({
    width: '100%', padding: '10px 12px', fontSize: '13px', fontFamily: FONT,
    border: `1.5px solid ${hasErr ? ACCENT : NEUTRAL}`, borderRadius: '8px',
    outline: 'none', background: '#FAFAFA', boxSizing: 'border-box',
  });

  const catActual = CATEGORIAS.find(c => c.value === form.categoria);

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f9', fontFamily: FONT }}>
      <div style={{ padding: '28px' }}>

        {/* FORMULARIO DE RECEPCIÓN */}
        <div style={{
          background: 'white', borderRadius: '12px', padding: '24px',
          boxShadow: '0 2px 8px rgba(0,51,102,0.08)', marginBottom: '20px',
        }}>
          <h3 style={{ margin: '0 0 18px', fontSize: '15px', fontWeight: 700, color: PRIMARY }}>
            Registrar Producto en Almacén
          </h3>

          {/* Fila principal: SKU | Categoría | Peso */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 130px', gap: '12px', alignItems: 'end' }}>

            {/* Código / SKU */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: PRIMARY,
                marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Código del producto (SKU)
              </label>
              <input
                type="text"
                placeholder="Ej: CAJA-A101"
                value={form.codigo}
                onChange={e => setForm(f => ({ ...f, codigo: e.target.value.toUpperCase() }))}
                style={inputStyle(errores.codigo)}
                onFocus={e => e.target.style.borderColor = PRIMARY}
                onBlur={e => e.target.style.borderColor = errores.codigo ? ACCENT : NEUTRAL}
              />
              {errores.codigo && (
                <p style={{ margin: '3px 0 0', fontSize: '11px', color: ACCENT }}>{errores.codigo}</p>
              )}
            </div>

            {/* Categoría */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: PRIMARY,
                marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Categoría
              </label>
              <select
                value={form.categoria}
                onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 12px', fontSize: '13px', fontFamily: FONT,
                  border: `1.5px solid ${errores.categoria ? ACCENT : (catActual?.color || NEUTRAL)}`,
                  borderRadius: '8px', outline: 'none', background: '#FAFAFA',
                  color: catActual?.color || '#333', fontWeight: 700, cursor: 'pointer',
                }}
              >
                {CATEGORIAS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {errores.categoria && (
                <p style={{ margin: '3px 0 0', fontSize: '11px', color: ACCENT }}>{errores.categoria}</p>
              )}
            </div>

            {/* Peso */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: PRIMARY,
                marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Peso (kg)
              </label>
              <input
                type="number"
                placeholder="Ej: 2.5"
                min="0.1"
                step="0.1"
                value={form.peso}
                onChange={e => setForm(f => ({ ...f, peso: e.target.value }))}
                style={inputStyle(errores.peso)}
                onFocus={e => e.target.style.borderColor = PRIMARY}
                onBlur={e => e.target.style.borderColor = errores.peso ? ACCENT : NEUTRAL}
              />
              {errores.peso && (
                <p style={{ margin: '3px 0 0', fontSize: '11px', color: ACCENT }}>{errores.peso}</p>
              )}
            </div>

          </div>

          {/* Fila secundaria: botón Simular QR al MQTT */}
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleSimularQR}
              disabled={simQrCargando}
              style={{
                padding: '8px 14px', background: simQrCargando ? '#f0f0f0' : '#fff8e1',
                border: `1.5px solid #D48B00`, borderRadius: '8px',
                fontSize: '12px', fontWeight: 700, color: '#D48B00',
                cursor: simQrCargando ? 'not-allowed' : 'pointer', fontFamily: FONT,
              }}
              title="Envía un escaneo QR simulado al tópico MQTT wms/infra/qr/lecturas"
            >
              {simQrCargando ? '⏳ Enviando...' : '🧪 Simular Escaneo QR (MQTT)'}
            </button>
            <span style={{ fontSize: '11px', color: '#aaa', fontFamily: MONO }}>
              Requiere endpoint <code>/test/simular-qr</code> en el backend
            </span>
          </div>

          {/* Estado de envío */}
          {enviando && (
            <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '8px',
              background: '#e8f0fb', color: PRIMARY, fontSize: '13px', fontFamily: MONO }}>
              Registrando categoría y enviando al almacén...
            </div>
          )}
        </div>

        {/* GRID PRINCIPAL */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <StationStatus stationName="D1" isActive={true} />
            <ProductQueue products={queue} />
          </div>
          <div>
            <LocalAlerts alerts={alerts} />
          </div>
        </div>

        {/* CONTROLES */}
        <OperationControls
          onStart={handleStart}
          onCallRobot={handleCallRobot}
          onPause={handlePause}
          onAbort={handleAbort}
        />

      </div>
    </div>
  );
}
