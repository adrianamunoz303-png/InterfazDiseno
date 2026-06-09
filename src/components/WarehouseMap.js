import React from 'react';
import './WarehouseMap.css';

// Extraemos la categoría de forma segura (igual que en Almacenamiento.js)
function getCategoryFromItem(item) {
  if (item.category && ['A', 'B', 'C'].includes(item.category.toUpperCase())) {
    return item.category.toUpperCase();
  }
  if (item.sku?.includes('-A')) return 'A';
  if (item.sku?.includes('-B')) return 'B';
  return 'C';
}

export default function WarehouseMap({ inventario }) {
  // Inicializar grillas vacías para fila A y fila B
  // Fila A = pos_y: 1, pos_x: 1-5
  // Fila B = pos_y: 2, pos_x: 1-5
  const gridA = Array(5).fill(null);
  const gridB = Array(5).fill(null);
  
  // Contadores para zonas especiales
  let enRecepcion = 0;
  
  inventario.forEach(item => {
    // Si tiene posición válida en A
    if (item.pos_y === 1 && item.pos_x >= 1 && item.pos_x <= 5) {
      gridA[item.pos_x - 1] = item;
    } 
    // Si tiene posición válida en B
    else if (item.pos_y === 2 && item.pos_x >= 1 && item.pos_x <= 5) {
      gridB[item.pos_x - 1] = item;
    } 
    // Si no tiene ubicación en el rack (está registrado o x=0,y=0)
    else if (item.status === 'registrado' || (item.pos_x === 0 && item.pos_y === 0)) {
      enRecepcion++;
    }
  });

  const renderBox = (item, index, rowName) => {
    const boxId = `${rowName}${index + 1}`;
    
    if (!item) {
      return (
        <div key={boxId} className="box empty" style={{ zIndex: 3 }}>
          {boxId}
          <div className="tooltip" style={{ background: '#666' }}>
            <strong>Vacío</strong>
            <br/>Posición disponible
          </div>
        </div>
      );
    }

    const cat = getCategoryFromItem(item);
    const stateClass = item.status === 'in_transit' ? 'in-transit' : `occupied-${cat}`;
    const statusText = item.status === 'in_transit' ? 'En Tránsito 🚚' : 'Almacenado 📦';
    
    return (
      <div key={boxId} className={`box ${stateClass}`} style={{ zIndex: 3 }}>
        {boxId}
        <div className="tooltip">
          <strong style={{ color: '#ffe0a0', fontSize: '14px' }}>{item.sku}</strong>
          <br/>ID: #{item.id} | Cat: <strong>{cat}</strong>
          <br/>{statusText}
        </div>
      </div>
    );
  };

  return (
    <div className="warehouse-container">
      <div className="warehouse-grid">
        
        {/* Columna Izquierda (Recepción y Banda) */}
        <div className="left-column">
          <div className="zone-box zone-recepcion">
            Recepción
            {enRecepcion > 0 && (
              <div className="badge-count" title={`${enRecepcion} caja(s) registradas sin asignar`}>
                {enRecepcion}
              </div>
            )}
          </div>
          <div className="zone-box zone-banda">Banda</div>
        </div>

        {/* Área Principal (Derecha) */}
        <div className="main-area">
          
          <div className="top-areas">
             <div className="zone-box zone-pits">Zona de Pits</div>
             <div className="zone-box zone-despacho">Despacho</div>
          </div>

          {/* Sección principal del almacén con los racks */}
          <div className="storage-section">
            <div className="middle-path" />

            {/* Fila A (Superior) */}
            <div className="shelf-row" style={{ marginBottom: '50px' }}>
              {gridA.map((item, i) => (
                <div key={i} className="box-wrapper">
                  {renderBox(item, i, 'A')}
                  <div className="vertical-connector" style={{ marginTop: '-4px' }} />
                </div>
              ))}
            </div>

            {/* Fila B (Inferior) */}
            <div className="shelf-row">
              {gridB.map((item, i) => (
                <div key={i} className="box-wrapper">
                  <div className="vertical-connector" style={{ marginBottom: '-4px' }} />
                  {renderBox(item, i, 'B')}
                </div>
              ))}
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  );
}
