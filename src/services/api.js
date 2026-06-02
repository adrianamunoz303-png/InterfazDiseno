import { API_URL } from '../config/api';

// ---------------------------------------------------------------------------
// Helper: lee el token JWT de la sesion activa y lo adjunta a cada peticion.
// Si el backend responde 401 (sesion expirada) limpia la sesion y redirige
// al login, previniendo que un usuario vea datos de otra sesion.
// ---------------------------------------------------------------------------
function getToken() {
    try {
        const saved = sessionStorage.getItem('asrs_user');
        return saved ? JSON.parse(saved)?.token : null;
    } catch {
        return null;
    }
}

async function authFetch(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
        if (token) {
            // Solo redirigir si HABIA un token (sesion expirada).
            // Si no habia token, simplemente lanzar el error sin redirigir.
            sessionStorage.removeItem('asrs_user');
            window.location.href = '/login';
        }
        throw new Error('No autorizado');
    }
    return res;
}

// ---------------------------------------------------------------------------
// Inventario
// ---------------------------------------------------------------------------
export const obtenerInventario = async () => {
    try {
        const res = await authFetch(`${API_URL}/inventario`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error('Error al obtener inventario:', error);
        return { total_paquetes: 0, inventario: [] };
    }
};

// ---------------------------------------------------------------------------
// Usuarios
// ---------------------------------------------------------------------------
export const obtenerUsuarios = async () => {
    const res = await authFetch(`${API_URL}/usuarios`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
};

export const eliminarUsuarioBackend = async (userId) => {
    const res = await authFetch(`${API_URL}/usuarios/${userId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
};

// ---------------------------------------------------------------------------
// Operaciones logisticas
// ---------------------------------------------------------------------------
export const crearProductoEnInventario = async (codigo, peso) => {
    const res = await authFetch(`${API_URL}/ordenar_paquete`, {
        method: 'POST',
        body: JSON.stringify({ codigo, peso }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error del servidor');
    }
    return res.json();
};

// Registra metadatos del producto antes de su ingreso físico (POST /productos)
export const registrarProducto = async (sku, categoria, descripcion = '') => {
    const res = await authFetch(`${API_URL}/productos`, {
        method: 'POST',
        body: JSON.stringify({ sku, categoria, descripcion }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Error al registrar producto');
    }
    return res.json();
};

// ---------------------------------------------------------------------------
// Flota AGV
// ---------------------------------------------------------------------------
export const obtenerVehiculos = async () => {
    try {
        const res = await authFetch(`${API_URL}/agvs`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return await res.json(); // array de { id, battery_level, status, pos_x, pos_y, last_connection }
    } catch (error) {
        console.error('Error al obtener flota AGV:', error);
        return [];
    }
};

export const actualizarAgv = async (agvId, data) => {
    const res = await authFetch(`${API_URL}/agvs/${agvId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
};

// Simula un escaneo QR publicando al tópico MQTT wms/infra/qr/lecturas (requiere endpoint /test/simular-qr en el backend)
export const simularEscaneoQR = async (sku) => {
    const res = await authFetch(`${API_URL}/test/simular-qr`, {
        method: 'POST',
        body: JSON.stringify({ sku, source: 'frontend_sim' }),
    });
    if (!res.ok) throw new Error('Endpoint de simulación no disponible en el backend');
    return res.json();
};
