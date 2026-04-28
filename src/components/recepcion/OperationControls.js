import React from "react";

export default function OperationControls({ 
  onStart, 
  onCallRobot, 
  onPause, 
  onAbort 
}) {
  return (
    <div style={{background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
      <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
        <button 
          onClick={onStart}
          style={{
            padding: '10px 20px',
            background: '#9e9e9e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = '#757575'}
          onMouseLeave={(e) => e.target.style.background = '#9e9e9e'}
        >
          ▶️ Iniciar
        </button>

        <button 
          onClick={onCallRobot}
          style={{
            padding: '10px 20px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = '#1976d2'}
          onMouseLeave={(e) => e.target.style.background = '#2196f3'}
        >
          🤖 Llamar a Robot
        </button>

        <button 
          onClick={onPause}
          style={{
            padding: '10px 20px',
            background: 'white',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
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
          ⏸️ Pausar
        </button>

        <button 
          onClick={onAbort}
          style={{
            padding: '10px 20px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = '#d32f2f'}
          onMouseLeave={(e) => e.target.style.background = '#f44336'}
        >
          🛑 Abortar
        </button>
      </div>
    </div>
  );
}
