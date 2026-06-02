import React, { useState, useEffect, useCallback } from "react";
import { registrarProducto, obtenerInventario } from '../services/api';

const PRIMARY = '#003366';
const ACCENT  = '#AD3333';
const NEUTRAL = '#DADADA';
const GREEN   = '#1A9E5A';
const BLUE    = '#2563EB';
const WARN    = '#D48B00';
const FONT    = "'Century Gothic', Candara, 'Trebuchet MS', sans-serif";
const MONO    = "'Roboto Mono', monospace";

const STORAGE_KEY = 'asrs_productos_v2';

const CATEGORIAS = [
  { value: 'A', label: 'A', desc: 'Alta rotación',  color: GREEN  },
  { value: 'B', label: 'B', desc: 'Media rotación', color: BLUE   },
  { value: 'C', label: 'C', desc: 'Baja rotación',  color: WARN   },
];

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveLocal(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// Extrae el número más alto usado en todos los SKUs existentes
function maxNumeroUsado(skus) {
  let max = 0;
  skus.forEach(sku => {
    const match = sku.match(/(\d+)$/);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  });
  return max;
}

function generarSKU(numero) {
  return `CAJA-${String(numero).padStart(3, '0')}`;
}

const EMPTY_FORM = { peso: '', cantidad: '', precio: '', categoria: 'A' };

export default function Dispensa() {
  const [productos, setProductos]   = useState(loadLocal);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [skuGenerado, setSkuGenerado] = useState('');
  const [cargandoSku, setCargandoSku] = useState(true);
  const [enviando, setEnviando]     = useState(false);
  const [errores, setErrores]       = useState({});
  const [exito, setExito]           = useState('');
  const [isMobile, setIsMobile]     = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const r = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);

  useEffect(() => { saveLocal(productos); }, [productos]);

  // Calcula el próximo SKU consultando el backend + local
  const calcularProximoSKU = useCallback(async () => {
    setCargandoSku(true);
    try {
      const data = await obtenerInventario();
      const skusBackend = (data.inventario || []).map(i => i.sku);
      const skusLocal   = productos.map(p => p.codigo);
      const todos       = [...skusBackend, ...skusLocal];
      const siguiente   = maxNumeroUsado(todos) + 1;
      setSkuGenerado(generarSKU(siguiente));
    } catch {
      // Si el backend no responde, usa solo el local
      const skusLocal = productos.map(p => p.codigo);
      const siguiente = maxNumeroUsado(skusLocal) + 1;
      setSkuGenerado(generarSKU(siguiente));
    } finally {
      setCargandoSku(false);
    }
  }, [productos]);

  useEffect(() => { calcularProximoSKU(); }, []); // solo al montar

  function validar() {
    const e = {};
    if (!form.peso || isNaN(form.peso) || Number(form.peso) <= 0)
      e.peso = 'Ingresa un peso válido (kg).';
    if (!form.cantidad || isNaN(form.cantidad) || !Number.isInteger(Number(form.cantidad)) || Number(form.cantidad) <= 0)
      e.cantidad = 'Ingresa una cantidad entera positiva.';
    if (!form.precio || isNaN(form.precio) || Number(form.precio) <= 0)
      e.precio = 'Ingresa un precio válido.';
    return e;
  }

  async function handleGuardar(e) {
    e.preventDefault();
    setExito('');
    const errs = validar();
    if (Object.keys(errs).length) { setErrores(errs); return; }
    setErrores({});
    setEnviando(true);

    let enBackend = false;
    try {
      await registrarProducto(skuGenerado, form.categoria);
      enBackend = true;
    } catch {
      // Guarda localmente si el backend no está disponible
    }

    const nuevo = {
      id:         Date.now(),
      codigo:     skuGenerado,
      categoria:  form.categoria,
      peso:       Number(form.peso),
      cantidad:   Number(form.cantidad),
      precio:     Number(form.precio),
      enBackend,
      created_at: new Date().toISOString(),
    };

    setProductos(prev => [nuevo, ...prev]);
    setExito(`Producto "${skuGenerado}" [Cat. ${form.categoria}] registrado.`);
    setForm(EMPTY_FORM);
    setEnviando(false);
    setTimeout(() => setExito(''), 4000);

    // Recalcula el próximo SKU después de guardar
    await calcularProximoSKU();
  }

  function handleEliminar(id) {
    setProductos(prev => prev.filter(p => p.id !== id));
  }

  const totalProductos = productos.length;
  const totalCantidad  = productos.reduce((s, p) => s + p.cantidad, 0);
  const totalValor     = productos.reduce((s, p) => s + p.precio * p.cantidad, 0);
  const enBackendCount = productos.filter(p => p.enBackend).length;

  const catActual = CATEGORIAS.find(c => c.value === form.categoria);

  return (
    <div style={{ padding: isMobile ? '16px' : '28px', fontFamily: FONT, background: '#f4f6f9', minHeight: '100vh' }}>

      {/* TÍTULO */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: PRIMARY }}>
          Creación de Producto
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
          El código se genera automáticamente en orden. Elige la categoría y completa los datos del producto.
        </p>
      </div>

      {/* ESTADÍSTICAS */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Productos registrados', value: totalProductos,                         color: PRIMARY    },
          { label: 'Unidades totales',      value: totalCantidad,                          color: GREEN      },
          { label: 'Valor total inventario',value: `$${totalValor.toLocaleString('es-CO')}`, color: '#1565C0' },
          { label: 'Guardados en backend',  value: enBackendCount,                         color: '#6A1B9A'  },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            flex: 1, minWidth: '140px', background: 'white', borderRadius: '10px',
            padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            borderTop: `4px solid ${color}`,
          }}>
            <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: MONO, color }}>{value}</div>
            <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '340px 1fr',
        gap: '22px', alignItems: 'start',
      }}>

        {/* ── FORMULARIO ── */}
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ background: PRIMARY, padding: '16px 20px' }}>
            <h3 style={{ margin: 0, color: 'white', fontSize: '15px', fontWeight: 700 }}>Nuevo Producto</h3>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
              Código automático · Categoría seleccionable
            </p>
          </div>

          <form onSubmit={handleGuardar} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* SKU generado automáticamente */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#444', marginBottom: '6px' }}>
                Código generado automáticamente
              </label>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: '8px',
                background: '#f0f4fa', border: `1.5px solid ${PRIMARY}40`,
              }}>
                <span style={{
                  fontFamily: MONO, fontSize: '16px', fontWeight: 800,
                  color: PRIMARY, letterSpacing: '1px', flex: 1,
                }}>
                  {cargandoSku ? '…calculando…' : skuGenerado}
                </span>
                <span style={{
                  fontSize: '10px', fontWeight: 600, color: PRIMARY,
                  background: '#dce8ff', padding: '3px 8px', borderRadius: '10px',
                  textTransform: 'uppercase', letterSpacing: '0.4px',
                }}>
                  Auto
                </span>
              </div>
            </div>

            {/* Selector de Categoría con radio pills */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#444', marginBottom: '10px' }}>
                Categoría *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {CATEGORIAS.map(cat => {
                  const selected = form.categoria === cat.value;
                  return (
                    <label
                      key={cat.value}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: '4px', padding: '12px 8px', borderRadius: '10px',
                        border: `2px solid ${selected ? cat.color : NEUTRAL}`,
                        background: selected ? `${cat.color}15` : 'white',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <input
                        type="radio"
                        name="categoria"
                        value={cat.value}
                        checked={selected}
                        onChange={() => setForm(f => ({ ...f, categoria: cat.value }))}
                        style={{ display: 'none' }}
                      />
                      {/* Círculo indicador */}
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: selected ? cat.color : '#f0f0f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.15s',
                      }}>
                        <span style={{
                          fontFamily: MONO, fontWeight: 800, fontSize: '14px',
                          color: selected ? 'white' : '#bbb',
                        }}>
                          {cat.label}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: selected ? cat.color : '#aaa', textAlign: 'center', lineHeight: 1.2 }}>
                        {cat.desc}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Peso */}
            <Field label="Peso (kg) *" error={errores.peso}>
              <input
                type="number" placeholder="Ej: 2.5" min="0.01" step="0.01"
                value={form.peso}
                onChange={e => { setForm(f => ({ ...f, peso: e.target.value })); setErrores(er => ({ ...er, peso: undefined })); }}
                style={inputStyle(!!errores.peso)}
                onFocus={e => e.target.style.borderColor = PRIMARY}
                onBlur={e  => e.target.style.borderColor = errores.peso ? ACCENT : NEUTRAL}
              />
            </Field>

            {/* Cantidad */}
            <Field label="Cantidad (unidades) *" error={errores.cantidad}>
              <input
                type="number" placeholder="Ej: 10" min="1" step="1"
                value={form.cantidad}
                onChange={e => { setForm(f => ({ ...f, cantidad: e.target.value })); setErrores(er => ({ ...er, cantidad: undefined })); }}
                style={inputStyle(!!errores.cantidad)}
                onFocus={e => e.target.style.borderColor = PRIMARY}
                onBlur={e  => e.target.style.borderColor = errores.cantidad ? ACCENT : NEUTRAL}
              />
            </Field>

            {/* Precio */}
            <Field label="Precio unitario ($) *" error={errores.precio}>
              <input
                type="number" placeholder="Ej: 15000" min="0.01" step="0.01"
                value={form.precio}
                onChange={e => { setForm(f => ({ ...f, precio: e.target.value })); setErrores(er => ({ ...er, precio: undefined })); }}
                style={inputStyle(!!errores.precio)}
                onFocus={e => e.target.style.borderColor = PRIMARY}
                onBlur={e  => e.target.style.borderColor = errores.precio ? ACCENT : NEUTRAL}
              />
            </Field>

            {/* Mensaje éxito */}
            {exito && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px',
                background: '#e8f5ee', border: `1px solid ${GREEN}50`, color: GREEN, fontSize: '13px',
              }}>
                {exito}
              </div>
            )}

            {/* Resumen del producto a crear */}
            {!enviando && skuGenerado && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px',
                background: `${catActual?.color}10`, border: `1px solid ${catActual?.color}40`,
                fontSize: '12px', color: '#555',
              }}>
                Se registrará: <strong style={{ fontFamily: MONO, color: PRIMARY }}>{skuGenerado}</strong>
                {' '}· Categoría <strong style={{ color: catActual?.color }}>{form.categoria} ({catActual?.desc})</strong>
              </div>
            )}

            <button
              type="submit"
              disabled={enviando || cargandoSku}
              style={{
                padding: '12px', borderRadius: '8px', border: 'none',
                background: enviando || cargandoSku ? '#aaa' : PRIMARY,
                color: 'white', fontWeight: 700, fontSize: '14px',
                fontFamily: FONT, cursor: enviando || cargandoSku ? 'not-allowed' : 'pointer',
                marginTop: '4px',
              }}
              onMouseEnter={e => { if (!enviando && !cargandoSku) e.target.style.background = '#00408a'; }}
              onMouseLeave={e => { if (!enviando && !cargandoSku) e.target.style.background = PRIMARY; }}
            >
              {enviando ? 'Registrando en backend...' : `Guardar ${skuGenerado || ''}`}
            </button>
          </form>
        </div>

        {/* ── TABLA DE PRODUCTOS ── */}
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{
            padding: '16px 20px', borderBottom: `1px solid ${NEUTRAL}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: PRIMARY }}>
              Productos Registrados en esta Sesión
            </h3>
            {totalProductos > 0 && (
              <span style={{
                padding: '3px 10px', borderRadius: '12px', fontSize: '12px',
                fontWeight: 700, color: PRIMARY, background: '#e8edf5',
                border: `1px solid ${PRIMARY}30`,
              }}>
                {totalProductos} producto{totalProductos !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {productos.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#bbb' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
              <div style={{ fontSize: '14px' }}>No hay productos registrados aún</div>
              <div style={{ fontSize: '12px', marginTop: '6px', color: '#ccc' }}>Usa el formulario para registrar el primero</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: PRIMARY, color: 'white' }}>
                    {['Código', 'Cat.', 'Peso (kg)', 'Cantidad', 'Precio unit.', 'Valor total', 'Backend', 'Fecha', ''].map(col => (
                      <th key={col} style={{ padding: '11px 14px', textAlign: 'left', fontFamily: FONT, fontWeight: 600, fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p, idx) => {
                    const cat = CATEGORIAS.find(c => c.value === p.categoria) || CATEGORIAS[0];
                    return (
                      <tr key={p.id} style={{
                        background: idx % 2 === 0 ? 'white' : '#fafbfc',
                        borderBottom: `1px solid ${NEUTRAL}`,
                      }}>
                        <td style={{ padding: '11px 14px', fontFamily: MONO, fontWeight: 700, color: PRIMARY }}>
                          {p.codigo}
                        </td>
                        <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '26px', height: '26px', borderRadius: '50%',
                            fontSize: '12px', fontWeight: 800, fontFamily: MONO,
                            color: cat.color, background: `${cat.color}18`,
                            border: `2px solid ${cat.color}50`,
                          }}>
                            {cat.label}
                          </span>
                        </td>
                        <td style={{ padding: '11px 14px', fontFamily: MONO, textAlign: 'right' }}>
                          {p.peso.toLocaleString('es-CO')}
                        </td>
                        <td style={{ padding: '11px 14px', fontFamily: MONO, textAlign: 'right' }}>
                          {p.cantidad.toLocaleString('es-CO')}
                        </td>
                        <td style={{ padding: '11px 14px', fontFamily: MONO, textAlign: 'right' }}>
                          ${p.precio.toLocaleString('es-CO')}
                        </td>
                        <td style={{ padding: '11px 14px', fontFamily: MONO, textAlign: 'right', fontWeight: 600, color: '#1565C0' }}>
                          ${(p.precio * p.cantidad).toLocaleString('es-CO')}
                        </td>
                        <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block', padding: '3px 8px', borderRadius: '10px',
                            fontSize: '11px', fontWeight: 700, fontFamily: FONT,
                            color: p.enBackend ? GREEN : '#888',
                            background: p.enBackend ? '#e8f5ee' : '#f0f0f0',
                            border: `1px solid ${p.enBackend ? GREEN : '#ccc'}40`,
                          }}>
                            {p.enBackend ? '✓ Backend' : 'Local'}
                          </span>
                        </td>
                        <td style={{ padding: '11px 14px', color: '#777', whiteSpace: 'nowrap', fontSize: '11px', fontFamily: MONO }}>
                          {new Date(p.created_at).toLocaleString('es-CO', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <button
                            onClick={() => handleEliminar(p.id)}
                            title="Eliminar de la sesión"
                            style={{
                              padding: '4px 10px', border: `1px solid ${ACCENT}50`,
                              borderRadius: '6px', background: 'white',
                              color: ACCENT, fontSize: '12px', cursor: 'pointer', fontFamily: FONT,
                            }}
                            onMouseEnter={e => e.target.style.background = '#fdecea'}
                            onMouseLeave={e => e.target.style.background = 'white'}
                          >
                            Eliminar
                          </button>
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
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#444', marginBottom: '6px', fontFamily: FONT }}>
        {label}
      </label>
      {children}
      {error && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#AD3333' }}>{error}</p>}
    </div>
  );
}

function inputStyle(hasError) {
  return {
    width: '100%', padding: '10px 14px', boxSizing: 'border-box',
    border: `1px solid ${hasError ? '#AD3333' : '#DADADA'}`,
    borderRadius: '8px', fontSize: '14px',
    fontFamily: "'Roboto Mono', monospace",
    outline: 'none', transition: 'border-color 0.2s',
  };
}
