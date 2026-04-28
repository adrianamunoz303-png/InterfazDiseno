import React, { useState, useEffect } from "react";
import CardElements from "../components/common/CardElements";
import PageHeader from "../components/common/PageHeader";
import useAlmacen from "../hooks/useAlmacen";

export default function Almacenamiento() {
  const { items, cargando, error } = useAlmacen();

  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const hora = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(hora);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const obtenerCategoria = (item) => {
    const ubicacionLetra = item.ubicacion?.charAt(0).toUpperCase();
    if (ubicacionLetra && /^[A-C]$/.test(ubicacionLetra)) {
      return ubicacionLetra;
    }

    return 'C';
  };

  const productosA = items.filter(item => obtenerCategoria(item) === 'A');
  const productosB = items.filter(item => obtenerCategoria(item) === 'B');
  const productosC = items.filter(item => obtenerCategoria(item) === 'C');

  const productosAlmacenados = items.filter(item => item.estado === 'almacenado');
  const totalA = productosA.filter(item => item.estado === 'almacenado').length;
  const totalB = productosB.filter(item => item.estado === 'almacenado').length;
  const totalC = productosC.filter(item => item.estado === 'almacenado').length;
  const totalUnidades = productosAlmacenados.length;
  const maxUnidades = 50;
  const porcentajeOcupacion = Math.round((totalUnidades / maxUnidades) * 100);

  const stockBajoA = productosA.filter(item => item.estado === 'Stock Bajo' || item.estado === 'bajo').length;
  const stockBajoB = productosB.filter(item => item.estado === 'Stock Bajo' || item.estado === 'bajo').length;
  const stockBajoC = productosC.filter(item => item.estado === 'Stock Bajo' || item.estado === 'bajo').length;

  return (
    <div className="almacenamiento-container">
      <PageHeader
        icon="📦"
        title="Gestión de Almacenamiento"
        subtitle="Control de inventario por categorías"
        userLevel="OPERADOR"
        userLevelNumber="1"
        time={currentTime}
      />

      <div className="almacenamiento-content">
        <div className="alm-section">
          <h3>Porcentaje de Ocupación</h3>

          <div className="alm-percentage" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
            {cargando ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Cargando datos...</div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#f44336' }}>Error: {error}</div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '48px', fontWeight: 700, color: '#0e0e0e' }}>{porcentajeOcupacion}%</div>

                  <div style={{ display: 'flex', flexDirection: 'row', gap: '40px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ fontSize: '32px', fontWeight: 700, color: '#4caf50' }}>{totalA.toLocaleString()}</div>
                      <div style={{ fontSize: '13px', color: '#666' }}>Categoría A</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ fontSize: '32px', fontWeight: 700, color: '#2196f3' }}>{totalB.toLocaleString()}</div>
                      <div style={{ fontSize: '13px', color: '#666' }}>Categoría B</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ fontSize: '32px', fontWeight: 700, color: '#ff5722' }}>{totalC.toLocaleString()}</div>
                      <div style={{ fontSize: '13px', color: '#666' }}>Categoría C</div>
                    </div>
                  </div>
                </div>

                <div style={{ color: '#666', fontSize: '14px' }}>
                  {totalUnidades} productos de {maxUnidades} máximo
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="alm-bar-background" style={{ width: '100%', height: '12px', borderRadius: '6px', background: '#e0e0e0', overflow: 'hidden' }}>
                    <div className="alm-bar-fill" style={{ width: `${porcentajeOcupacion}%`, height: '100%', background: '#1a1a1a' }}></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', fontSize: '12px' }}>
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="alm-columns">
          <div className="alm-card-category">
            <div className="alm-cat-header">
              <h4>Productos en Categoría A</h4>
              <span className="alm-badge green">{productosA.length} productos</span>
            </div>

            {stockBajoA > 0 && (
              <div className="alm-alert red">{stockBajoA} producto{stockBajoA > 1 ? 's' : ''} con stock bajo</div>
            )}

            <div className="alm-product-list">
              {productosA.length > 0 ? (
                productosA.map((item, index) => (
                  <CardElements
                    key={item.id || index}
                    nombre={`Producto ${item.producto_id}`}
                    codigo={item.producto_id}
                    cantidad={item.trayectoria}
                    ubicacion={item.ubicacion}
                    estado={item.estado}
                    categoria="A"
                    timestamp={item.timestamp}
                  />
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No hay productos en esta categoría</div>
              )}
            </div>

            <div className="alm-total">Total productos: <strong>{totalA}</strong></div>
          </div>

          <div className="alm-card-category">
            <div className="alm-cat-header">
              <h4>Productos en Categoría B</h4>
              <span className="alm-badge blue">{productosB.length} productos</span>
            </div>

            {stockBajoB > 0 && (
              <div className="alm-alert red">{stockBajoB} producto{stockBajoB > 1 ? 's' : ''} con stock bajo</div>
            )}

            <div className="alm-product-list">
              {productosB.length > 0 ? (
                productosB.map((item, index) => (
                  <CardElements
                    key={item.id || index}
                    nombre={`Producto ${item.producto_id}`}
                    codigo={item.producto_id}
                    cantidad={item.trayectoria}
                    ubicacion={item.ubicacion}
                    estado={item.estado}
                    categoria="B"
                    timestamp={item.timestamp}
                  />
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No hay productos en esta categoría</div>
              )}
            </div>

            <div className="alm-total">Total productos: <strong>{totalB}</strong></div>
          </div>

          <div className="alm-card-category">
            <div className="alm-cat-header">
              <h4>Productos en Categoría C</h4>
              <span className="alm-badge orange">{productosC.length} productos</span>
            </div>

            {stockBajoC > 0 && (
              <div className="alm-alert red">{stockBajoC} producto{stockBajoC > 1 ? 's' : ''} con stock bajo</div>
            )}

            <div className="alm-product-list">
              {productosC.length > 0 ? (
                productosC.map((item, index) => (
                  <CardElements
                    key={item.id || index}
                    nombre={`Producto ${item.producto_id}`}
                    codigo={item.producto_id}
                    cantidad={item.trayectoria}
                    ubicacion={item.ubicacion}
                    estado={item.estado}
                    categoria="C"
                    timestamp={item.timestamp}
                  />
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No hay productos en esta categoría</div>
              )}
            </div>

            <div className="alm-total">Total productos: <strong>{totalC}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
