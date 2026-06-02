import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws/telemetry';

const WsContext = createContext(null);

export function WsProvider({ children }) {
  const [toasts, setToasts]     = useState([]);
  const [agvData, setAgvData]   = useState({});   // keyed by agv_id
  const [wsStatus, setWsStatus] = useState('connecting'); // connecting | connected | disconnected

  const addToast = useCallback((msg, type = 'error') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 6000);
  }, []);

  useEffect(() => {
    let ws;
    let retryTimeout;
    let destroyed = false;

    function connect() {
      if (destroyed) return;
      setWsStatus('connecting');

      try {
        ws = new WebSocket(WS_URL);
      } catch {
        retryTimeout = setTimeout(connect, 5000);
        return;
      }

      ws.onopen = () => {
        if (!destroyed) setWsStatus('connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Alarma de producto no registrado
          if (data.event === 'alarma' || data.tipo === 'alarma' || data.event === 'producto_no_registrado') {
            addToast(data.mensaje || data.detail || 'Producto no registrado detectado en muelle de entrada', 'error');
          }

          // Telemetría AGV — el backend envía { agv_id, bateria, estado, pos_x, pos_y, ... }
          if (data.agv_id) {
            setAgvData(prev => ({
              ...prev,
              [data.agv_id]: {
                ...prev[data.agv_id],
                ...data,
                lastUpdate: new Date().toISOString(),
              },
            }));
          }
        } catch { /* JSON inválido — ignorar */ }
      };

      ws.onclose = () => {
        if (!destroyed) {
          setWsStatus('disconnected');
          retryTimeout = setTimeout(connect, 5000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      destroyed = true;
      clearTimeout(retryTimeout);
      if (ws) ws.close();
    };
  }, [addToast]);

  return (
    <WsContext.Provider value={{ toasts, agvData, wsStatus, addToast }}>
      {children}
    </WsContext.Provider>
  );
}

export function useWs() {
  return useContext(WsContext);
}
