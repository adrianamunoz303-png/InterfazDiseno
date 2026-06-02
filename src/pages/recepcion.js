import React, { useState } from "react";
import { crearProductoEnInventario } from '../services/api';
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

const EMPTY_FORM = { codigo: '', peso: '' };

export default function Recepcion() {
  const [form, setForm]         = useState(EMPTY_FORM);
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores]   = useState({});
  const [queue, setQueue]       = useState([]);
  const [alerts, setAlerts]     = useState([]);

  function validar() {
    const e = {};
    if (!form.codigo.trim())
      e.codigo = 'El código del producto es obligatorio.';
    if (!form.peso || isNaN(form.peso) || Number(form.peso) <= 0)
      e.peso = 'Ingresa un peso válido (kg).';
    return e;
  }

  // Simula un escaneo QR poniendo un código de ejemplo
  function handleScan() {
    const sku = `CAJA-${String.fromCharCode(65 + Math.floor(Math.random() * 3))}${Math.floor(100 + Math.random() * 900)}`;
    setForm(f => ({ ...f, codigo: sku }));
    setErrores({});
  }

  async function handleStart() {
    const e = validar();
    if (Object.keys(e).length) { setErrores(e); return; }
    setErrores({});
    setEnviando(true);

    try {
      const data = await crearProductoEnInventario(form.codigo.trim(), Number(form.peso));

      const now = new Date().toLocaleTimeString('es-CO');
      const pos = data.asignacion_fifo
        ? `(X:${data.asignacion_fifo.x}, Y:${data.asignacion_fifo.y})`
        : '—';

      setQueue(prev => [
        {
          id: form.codigo.trim(),
          status: `Almacenado en posición ${pos}`,
          time: now,
          state: 'Completado',
        },
        ...prev,
      ]);

      setAlerts(prev => [
        { message: `Producto ${form.codigo.trim()} recibido y asignado a posición ${pos}`, time: now },
        ...prev.slice(0, 4),
      ]);

      setForm(EMPTY_FORM);
    } catch (err) {
      const now = new Date().toLocaleTimeString('es-CO');
      setAlerts(prev => [
        { message: `Error al registrar ${form.codigo.trim()}: ${err.message}`, time: now },
        ...prev.slice(0, 4),
      ]);
    } finally {
      setEnviando(false);
    }
  }

  function handlePause()  { /* operación de pausa futura */ }
  function handleAbort()  { setForm(EMPTY_FORM); setErrores({}); }
  function handleCallRobot() { /* envío de comando AGV futuro */ }

  const inputStyle = (hasErr) => ({
    width: '100%', padding: '10px 12px', fontSize: '13px', fontFamily: FONT,
    border: `1.5px solid ${hasErr ? ACCENT : NEUTRAL}`, borderRadius: '8px',
    outline: 'none', background: '#FAFAFA', boxSizing: 'border-box',
  });

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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px auto', gap: '12px', alignItems: 'end' }}>

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

            {/* Botón escanear QR */}
            <button
              onClick={handleScan}
              style={{
                padding: '10px 16px', background: 'white', border: `1.5px solid ${PRIMARY}`,
                borderRadius: '8px', fontSize: '13px', fontWeight: 700, color: PRIMARY,
                cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap',
              }}
              title="Simular escaneo QR"
            >
              📷 Escanear QR
            </button>
          </div>

          {/* Estado de envío */}
          {enviando && (
            <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '8px',
              background: '#e8f0fb', color: PRIMARY, fontSize: '13px', fontFamily: MONO }}>
              Enviando al almacén...
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
