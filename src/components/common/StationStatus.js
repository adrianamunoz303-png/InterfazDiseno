import React from "react";

export default function StationStatus({ stationName = "D1", isActive = true }) {
  return (
    <div style={{background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
      <h3 style={{margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
        ⚡ Estado de Estación de Recepción
      </h3>
      
      <div style={{
        padding: '20px',
        background: '#f8f9fa',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{fontSize: '18px', fontWeight: 600}}>Estación {stationName}</div>
        <div style={{
          padding: '8px 16px',
          background: isActive ? '#d4edda' : '#f8d7da',
          color: isActive ? '#155724' : '#721c24',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {isActive ? '⚡ Activa' : '⚠️ Inactiva'}
        </div>
      </div>
    </div>
  );
}
