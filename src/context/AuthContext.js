import { createContext, useContext, useState, useEffect } from 'react';

const USERS = [
  {
    id: 1,
    username: 'superadmin',
    password: 'SA@2025!',
    role: 'superadmin',
    nombre: 'Super Administrador',
    nivelAcceso: 3
  },
  {
    id: 2,
    username: 'admin',
    password: 'Adm@2025!',
    role: 'admin',
    nombre: 'Administrador',
    nivelAcceso: 2
  },
  {
    id: 3,
    username: 'operario',
    password: 'Op@2025!',
    role: 'operario',
    nombre: 'Operario',
    nivelAcceso: 1
  }
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('asrs_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('asrs_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('asrs_user');
    }
  }, [user]);

  function login(username, password) {
    const found = USERS.find(
      u => u.username === username && u.password === password
    );
    if (found) {
      const { password: _, ...safeUser } = found;
      setUser(safeUser);
      return { ok: true, user: safeUser };
    }
    return { ok: false, error: 'Usuario o contraseña incorrectos' };
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
