import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/dashboard';
import Recepcion from './pages/recepcion';
import Almacenamiento from './pages/Almacenamiento';
import Dispensa from './pages/Dispensa';
import Robot from './pages/robot';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard — todos los roles */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Módulos operativos — Operario y Super Admin */}
          <Route path="/Dispensa" element={
            <ProtectedRoute allowedRoles={['operario', 'superadmin']}>
              <Dispensa />
            </ProtectedRoute>
          } />
          <Route path="/recepcion" element={
            <ProtectedRoute allowedRoles={['operario', 'superadmin']}>
              <Recepcion />
            </ProtectedRoute>
          } />
          <Route path="/Robot" element={
            <ProtectedRoute allowedRoles={['operario', 'superadmin']}>
              <Robot />
            </ProtectedRoute>
          } />

          {/* Inventario — Admin también puede consultarlo */}
          <Route path="/Almacenamiento" element={
            <ProtectedRoute allowedRoles={['operario', 'admin', 'superadmin']}>
              <Almacenamiento />
            </ProtectedRoute>
          } />

          {/* Cualquier ruta desconocida → dashboard (si autenticado) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
