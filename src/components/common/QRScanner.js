import React from "react";

export default function QRScanner({ onScan }) {
  return (
    <div style={{background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
      <h3 style={{margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
        📱 Sensor QR y Verificación
      </h3>
      
      <button 
        onClick={onScan}
        style={{
          padding: '12px 24px',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#f5f5f5';
          e.target.style.borderColor = '#999';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'white';
          e.target.style.borderColor = '#ddd';
        }}
      >
        📷 Iniciar Escaneo QR
      </button>
    </div>
  );
}
