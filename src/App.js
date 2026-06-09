import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { WsProvider } from './context/WsContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ToastNotifications from './components/common/ToastNotifications';
import Login from './pages/Login';
import Dashboard from './pages/dashboard';
import Recepcion from './pages/recepcion';
import Almacenamiento from './pages/Almacenamiento';
import Dispensa from './pages/Dispensa';
import CrearRobot from './pages/CrearRobot';
import Robot from './pages/robot';
import RobotDetalle from './pages/RobotDetalle';

function App() {
  return (
    <AuthProvider>
      <WsProvider>
        <Router>
          <ToastNotifications />
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard — todos los roles */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/robot/:id" element={<RobotDetalle />} />
          

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
          <Route path="/crear-robot" element={<CrearRobot />} /> 
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
      </WsProvider>
    </AuthProvider>
  );
}

export default App;
