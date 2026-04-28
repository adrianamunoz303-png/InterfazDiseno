import React from "react";

export default function LocalAlerts({ alerts = [] }) {
  return (
    <div style={{background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
      <h3 style={{margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
        ⚠️ Alarmas Locales
      </h3>
      
      {alerts.map((alert, index) => (
        <div key={index} style={{
          padding: '16px',
          background: '#e3f2fd',
          border: '1px solid #2196f3',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: alerts.length > 1 && index < alerts.length - 1 ? '12px' : '0'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#2196f3',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            flexShrink: 0
          }}>
            ℹ️
          </div>
          <div>
            <div style={{fontSize: '14px', fontWeight: 600, marginBottom: '4px'}}>
              {alert.message}
            </div>
            <div style={{fontSize: '12px', color: '#666'}}>{alert.time}</div>
          </div>
        </div>
      ))}
      
      {alerts.length === 0 && (
        <div style={{padding: '20px', textAlign: 'center', color: '#999'}}>
          No hay alarmas activas
        </div>
      )}
    </div>
  );
}
