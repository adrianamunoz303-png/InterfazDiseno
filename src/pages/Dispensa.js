import React, { useState, useEffect } from "react";
import useAlmacen from "../hooks/useAlmacen";
import useFifo from "../hooks/useFifo";

export default function Dispensa() {

    const { items, cargando, error } = useAlmacen();
    const { fifoQueue, cargando: cargandoFifo, error: errorFifo } = useFifo();
  
  // Estado dinámico
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [productosDespachados, setProductosDespachados] = useState([]);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  );

  // Actualizar hora cada segundo
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
  


  const [notifications] = useState([
    {
      message: 'Sistema de Recepción iniciado correctamente',
      time: '22:35:08',
      type: 'info'
    },
    {
      message: 'Conexión con almacén establecida',
      time: '22:36:28',
      type: 'success'
    }
  ]);

  // Handlers
  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleFilterChange = (e) => setFilterCategory(e.target.value);

  // Despachar producto
  const handleDespachar = async (product) => {
    try {
      console.log(`Despachando producto ${product.producto_id}...`);
      const resp = await fetch(`https://8648035cba35.ngrok-free.app/inventario/despachar/${product.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!resp.ok) throw new Error('Error al despachar producto');
      
      const data = await resp.json();
      
      // Agregar producto a despachados con timestamp
      const productoDespachado = {
        ...product,
        fechaDespacho: new Date().toISOString()
      };
      setProductosDespachados([productoDespachado, ...productosDespachados]);
      
      alert(`Producto ${product.producto_id} despachado exitosamente`);
    } catch (err) {
      console.error('Error al despachar:', err);
      alert('Error al despachar el producto');
    }
  };

  // Filtrar productos (excluyendo los despachados)
  const filteredProducts = items?.filter(product => {
    const matchesSearch = product.producto_id?.toLowerCase().includes(searchTerm?.toLowerCase()) || 
                         product.id?.toLowerCase().includes(searchTerm?.toLowerCase());
    const matchesFilter = filterCategory === 'Todas' || product.category === filterCategory;
    const noEstaDespacho = !productosDespachados.some(p => p.id === product.id);
    return matchesSearch && matchesFilter && noEstaDespacho;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      {/* CONTENT */}
      <div style={{ padding: "30px" }}>
        
        {/* MAIN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          
          {/* LEFT - Solicitar Producto */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔍 Solicitar Producto del Almacén
            </h3>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={handleSearch}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '12px',
                boxSizing: 'border-box'
              }}
            />

            {/* Filter Dropdown */}
            <select
              value={filterCategory}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '20px',
                cursor: 'pointer',
                background: 'white'
              }}
            >
              <option value="Todas">Todas</option>
              <option value="A">Categoría A</option>
              <option value="B">Categoría B</option>
              <option value="C">Categoría C</option>
            </select>

            {/* Products List */}
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {filteredProducts.map((product, index) => (
                <div key={index} style={{
                  padding: '12px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e8f5e9'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f8f9fa'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: product.estado === 'almacenado' ? '#4caf50' : product?.estado === '' ? '#2196f3' : '#ff9800',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {product.estado}
                    </span>
                    <span style={{ fontSize: '12px', color: '#666' }}>{product.id}</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{product?.producto_id}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#666' }}>
                    <span>📍 {product.ubicacion}</span>
                    <button
                      onClick={() => handleDespachar(product)}
                      disabled={product.estado !== 'almacenado'}
                      style={{
                        padding: '6px 12px',
                        background: product.estado === 'almacenado' ? '#2196f3' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: product.estado === 'almacenado' ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (product.estado === 'almacenado') {
                          e.target.style.background = '#1976d2';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (product.estado === 'almacenado') {
                          e.target.style.background = '#2196f3';
                        }
                      }}
                    >
                      📦 Despachar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MIDDLE - Lógica FIFO */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔄 Lógica FIFO <span style={{
                background: '#e3f2fd',
                color: '#1976d2',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>{fifoQueue?.length || 0}</span>
            </h3>

            {cargandoFifo ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '60px 20px',
                color: '#999'
              }}>
                <div style={{ fontSize: '14px' }}>Cargando cola FIFO...</div>
              </div>
            ) : errorFifo ? (
              <div style={{ 
                padding: '20px',
                textAlign: 'center',
                color: '#f44336'
              }}>
                Error: {errorFifo}
              </div>
            ) : !fifoQueue || fifoQueue.length === 0 ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '60px 20px',
                color: '#999'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
                <div style={{ fontSize: '14px', textAlign: 'center' }}>No hay productos en cola FIFO</div>
                <div style={{ fontSize: '12px', color: '#bbb', marginTop: '8px' }}>Los productos despachados aparecerán aquí</div>
              </div>
            ) : (
              <div>
                {fifoQueue.map((item, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    background: '#fff',
                    borderRadius: '8px',
                    border: '2px solid #2196f3',
                    marginBottom: '12px',
                    position: 'relative'
                  }}>
                    {/* Número de posición en FIFO */}
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: index === 0 ? '#4caf50' : '#2196f3',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </div>

                    {/* Badge de siguiente */}
                    {index === 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '4px 8px',
                        background: '#4caf50',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        SIGUIENTE
                      </div>
                    )}

                    {/* Contenido del producto */}
                    <div style={{ marginTop: '32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: item.estado === 'almacenado' ? '#4caf50' : '#ff9800',
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {item.estado}
                        </span>
                        <span style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>ID: {item.id}</span>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{item.producto_id}</div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>📍 {item.ubicacion}</div>
                      {item.timestamp && (
                        <div style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>
                          ⏱️ {new Date(item.timestamp).toLocaleString('es-ES')}
                        </div>
                      )}
                      
                      {/* Botón Despachar */}
                      <button
                        onClick={() => handleDespachar(item)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#45a049'}
                        onMouseLeave={(e) => e.target.style.background = '#4caf50'}
                      >
                        📦 Despachar Producto
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT - Notificaciones */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔔 Notificaciones
            </h3>

            {notifications.map((notification, index) => (
              <div key={index} style={{
                padding: '16px',
                background: notification.type === 'success' ? '#d4edda' : '#e3f2fd',
                border: `1px solid ${notification.type === 'success' ? '#4caf50' : '#2196f3'}`,
                borderRadius: '8px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: notification.type === 'success' ? '#4caf50' : '#2196f3',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0
                }}>
                  {notification.type === 'success' ? '✓' : 'ℹ'}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                    {notification.message}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{notification.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Productos Despachados */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✅ Productos Despachados <span style={{
                background: '#e8f5e9',
                color: '#4caf50',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>{productosDespachados.length}</span>
            </h3>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {productosDespachados.length === 0 ? (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '60px 20px',
                  color: '#999'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                  <div style={{ fontSize: '14px', textAlign: 'center' }}>No hay productos despachados</div>
                </div>
              ) : (
                productosDespachados.map((product, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    background: '#e8f5e9',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: '1px solid #4caf50'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: '#4caf50',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        DESPACHADO
                      </span>
                      <span style={{ fontSize: '12px', color: '#666' }}>ID: {product.id}</span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{product.producto_id}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>📍 {product.ubicacion}</div>
                    <div style={{ fontSize: '11px', color: '#999' }}>
                      ⏱️ {new Date(product.fechaDespacho).toLocaleString('es-ES')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
