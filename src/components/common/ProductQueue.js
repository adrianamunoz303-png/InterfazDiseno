import React from "react";

export default function ProductQueue({ products = [] }) {
  return (
    <div style={{background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
      <h3 style={{margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
        📦 Productos en Cola <span style={{
          background: '#e3f2fd',
          color: '#1976d2',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>{products.length}/1</span>
      </h3>
      
      {products.map((product, index) => (
        <div key={index} style={{
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '2px solid #2196f3',
          borderLeft: '6px solid #2196f3',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: products.length > 1 ? '12px' : '0'
        }}>
          <div>
            <div style={{fontSize: '16px', fontWeight: 700, marginBottom: '4px'}}>{product.id}</div>
            <div style={{fontSize: '13px', color: '#666', marginBottom: '2px'}}>{product.status}</div>
            <div style={{fontSize: '12px', color: '#999'}}>Detectado: {product.time}</div>
          </div>
          <div style={{
            padding: '6px 12px',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600
          }}>
            {product.state}
          </div>
        </div>
      ))}
      
      {products.length === 0 && (
        <div style={{padding: '20px', textAlign: 'center', color: '#999'}}>
          No hay productos en cola
        </div>
      )}
    </div>
  );
}
