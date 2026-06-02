import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import { obtenerUsuarios, eliminarUsuarioBackend } from '../services/api';

const DEFAULT_USERS = [
  { id: 1, username: 'superadmin', password: 'SA@2025!',  role: 'superadmin', nombre: 'Super Administrador', nivelAcceso: 3, intentosFallidos: 0, bloqueado: false },
  { id: 2, username: 'admin',      password: 'Adm@2025!', role: 'admin',      nombre: 'Administrador',       nivelAcceso: 2, intentosFallidos: 0, bloqueado: false },
  { id: 3, username: 'operario',   password: 'Op@2025!',  role: 'operario',   nombre: 'Operario',            nivelAcceso: 1, intentosFallidos: 0, bloqueado: false },
];

function nivelPorRol(role) {
  return role === 'superadmin' ? 3 : role === 'admin' ? 2 : 1;
}

function loadUsers() {
  try {
    const saved = localStorage.getItem('asrs_users');
    let users = saved ? JSON.parse(saved) : DEFAULT_USERS;
    users = users.map(u => ({ ...u, intentosFallidos: 0, bloqueado: false }));
    localStorage.setItem('asrs_users', JSON.stringify(users));
    return users;
  } catch {
    return DEFAULT_USERS;
  }
}

function saveUsers(users) {
  localStorage.setItem('asrs_users', JSON.stringify(users));
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers);
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('asrs_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Sincroniza la lista de usuarios con la BD solo cuando ya hay sesion activa.
  // Asi evitamos llamadas no autenticadas al arrancar la app.
  useEffect(() => {
    if (!user?.token) return;

    async function syncFromBackend() {
      try {
        const backendUsers = await obtenerUsuarios();
        setUsers(prev => {
          const merged = [...prev];
          for (const bu of backendUsers) {
            const idx = merged.findIndex(u => u.username === bu.username);
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], backend_id: bu.id };
            } else {
              merged.push({
                id: Date.now() + Math.random(),
                username: bu.username,
                nombre: bu.username,
                password: '(protegida)',
                role: bu.role,
                nivelAcceso: nivelPorRol(bu.role),
                intentosFallidos: 0,
                bloqueado: false,
                backend_id: bu.id,
              });
            }
          }
          return merged;
        });
      } catch {
        // Backend no disponible o token invalido — continuar con datos locales
      }
    }
    syncFromBackend();
  }, [user]);   // se re-ejecuta cada vez que cambia el usuario autenticado

  useEffect(() => {
    if (user) sessionStorage.setItem('asrs_user', JSON.stringify(user));
    else sessionStorage.removeItem('asrs_user');
  }, [user]);

  useEffect(() => { saveUsers(users); }, [users]);

  // -------------------------------------------------------------------------
  // LOGIN: autentica contra el backend y almacena el JWT en sessionStorage.
  // Cada pestana del navegador tiene su propio sessionStorage, lo que garantiza
  // sesiones independientes cuando varios usuarios operan al mismo tiempo.
  // -------------------------------------------------------------------------
  async function login(username, password) {
    const userData = users.find(u => u.username === username);
    if (userData?.bloqueado) {
      return { ok: false, error: 'Cuenta bloqueada. Contacta al administrador.' };
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (userData) {
          setUsers(prev => prev.map(u =>
            u.username === username ? { ...u, intentosFallidos: 0, bloqueado: false } : u
          ));
        }
        const loggedUser = { username, role: data.role, token: data.access_token };
        // Guardar en sessionStorage de forma INMEDIATA antes de setUser,
        // para que cualquier componente hijo que monte después encuentre el token.
        sessionStorage.setItem('asrs_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        return { ok: true, user: loggedUser };
      }

      const errorData = await response.json();
      const puedeBloquearse = userData && (userData.role === 'operario' || userData.role === 'admin');
      if (puedeBloquearse) {
        const newAttempts = (userData.intentosFallidos ?? 0) + 1;
        setUsers(prev => prev.map(u =>
          u.username === username
            ? { ...u, intentosFallidos: newAttempts, bloqueado: newAttempts >= 3 }
            : u
        ));
        if (newAttempts >= 3)
          return { ok: false, error: 'Cuenta bloqueada por seguridad. Contacta al administrador.' };
        return { ok: false, error: `Usuario o contrasena incorrectos. Intentos: ${newAttempts}/3` };
      }
      return { ok: false, error: errorData.detail || 'Error al iniciar sesion' };

    } catch {
      return { ok: false, error: 'No se pudo conectar al servidor. El backend esta inactivo.' };
    }
  }

  function logout() {
    sessionStorage.removeItem('asrs_user');
    setUser(null);
  }

  // -------------------------------------------------------------------------
  // CREAR USUARIO: guarda en BD y en estado local.
  // Envia el JWT del usuario autenticado para que el backend autorice la accion.
  // -------------------------------------------------------------------------
  async function addUser({ nombre, username, password, role }) {
    if (users.find(u => u.username === username)) {
      return { ok: false, error: 'El nombre de usuario ya existe' };
    }

    let backend_id = null;
    try {
      const token = user?.token;
      const res = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ username, password, role }),
      });
      if (res.ok) {
        const data = await res.json();
        backend_id = data.id ?? null;
      }
    } catch {
      // Backend no disponible — guardar solo local
    }

    setUsers(prev => [...prev, {
      id: Date.now(),
      username: username.trim(),
      password,
      role,
      nombre: nombre.trim(),
      nivelAcceso: nivelPorRol(role),
      intentosFallidos: 0,
      bloqueado: false,
      backend_id,
    }]);
    return { ok: true };
  }

  // -------------------------------------------------------------------------
  // ELIMINAR USUARIO: borra de BD y de estado local.
  // -------------------------------------------------------------------------
  async function deleteUser(id) {
    const target = users.find(u => u.id === id);
    if (target?.backend_id) {
      try {
        await eliminarUsuarioBackend(target.backend_id);
      } catch {
        // Si falla la BD, igual eliminamos del estado local
      }
    }
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  function unlockUser(userId, requestingUserRole) {
    if (requestingUserRole !== 'superadmin')
      return { ok: false, error: 'No tienes permiso para desbloquear usuarios' };
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, bloqueado: false, intentosFallidos: 0 } : u
    ));
    return { ok: true };
  }

  function updateUser(id, changes) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...changes } : u));
  }

  return (
    <AuthContext.Provider value={{ user, users, login, logout, addUser, deleteUser, updateUser, unlockUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
