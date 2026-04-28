import { useEffect, useState } from "react";

export default function useAlmacen() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function obtenerDatos() {
      try {
        console.log('Intentando conectar con la API...');
        const resp = await fetch("https://8648035cba35.ngrok-free.app/inventario/listar", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
        });
        
        console.log('Respuesta recibida:', resp.status);
        if (!resp.ok) throw new Error(`Error HTTP: ${resp.status}`);

        const data = await resp.json();
        console.log('Datos recibidos:', data);
        setItems(data);

      } catch (err) {
        console.error('Error en useAlmacen:', err);
        setError(err.message || 'Error de conexión con el servidor');
      } finally {
        setCargando(false);
      }
    }

    obtenerDatos();
  }, []);

  return { items, cargando, error };
}
