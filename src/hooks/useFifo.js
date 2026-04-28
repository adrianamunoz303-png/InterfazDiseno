import { useEffect, useState } from "react";

export default function useFifo() {
  const [fifoQueue, setFifoQueue] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function obtenerColaFifo() {
      try {
        console.log('Obteniendo cola FIFO...');
        const resp = await fetch("https://8648035cba35.ngrok-free.app/inventario/fifo", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
        });
        
        console.log('Respuesta FIFO recibida:', resp.status);
        if (!resp.ok) throw new Error(`Error HTTP: ${resp.status}`);

        const data = await resp.json();
        console.log('Cola FIFO recibida:', data);
        
        // La API devuelve un objeto con {status, message, producto}
        // Convertimos el producto en un array para mantener la estructura de cola
        if (data.producto) {
          setFifoQueue([data.producto]);
        } else {
          setFifoQueue([]);
        }

      } catch (err) {
        console.error('Error en useFifo:', err);
        setError(err.message || 'Error de conexión con el servidor');
      } finally {
        setCargando(false);
      }
    }

    obtenerColaFifo();
    
    // Actualizar cada 5 segundos
    const interval = setInterval(obtenerColaFifo, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return { fifoQueue, cargando, error };
}
