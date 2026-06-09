import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PRIMARY = '#003366';
const ACCENT  = '#AD3333';
const GREEN   = '#1A9E5A';
const WARN    = '#D48B00';
const FONT    = "'Century Gothic', Candara, 'Trebuchet MS', sans-serif";
const MONO    = "'Roboto Mono', monospace";

export default function RobotDetalle() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [robot, setRobot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarRobot() {
      try {
        // El backend debe permitir esta llamada sin token (pública)
        const res = await fetch(`http://localhost:8000/robots/${id}`);
        if (!res.ok) throw new Error('Robot no encontrado');
        const data = await res.json();
        setRobot(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    cargarRobot();
  }, [id]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', fontFamily: FONT }}>Cargando...</div>;
  if (error) return <div style={{ padding: 40, color: ACCENT, fontFamily: FONT }}>⚠️ {error}</div>;
  if (!robot) return null;

  return (
    <div style={{ background: '#f4f6f9', minHeight: '100vh', fontFamily: FONT, padding: '28px' }}>
      
      {/* Banner de login si no está autenticado */}
      {!user && (
        <div style={{
          background: `${WARN}15`, border: `1px solid ${WARN}40`, borderRadius: '12px',
          padding: '16px 20px', marginBottom: '24px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '22px' }}>🔒</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: WARN }}>
                Inicia sesión para acceder a todas las funciones
              </div>
              <div style={{ fontSize: '12px', color: '#777', marginTop: '2px' }}>
                Escaneaste el QR de {robot.robot_id || id}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/login', { state: { from: location.pathname } })}
            style={{
              padding: '10px 20px', background: PRIMARY, color: 'white',
              border: 'none', borderRadius: '8px', fontFamily: FONT,
              fontWeight: 600, fontSize: '13px', cursor: 'pointer'
            }}
          >
            Iniciar Sesión
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: PRIMARY }}>
          🤖 {robot.robot_id || id}
        </h1>
        <p style={{ margin: '4px 0 0', color: '#777', fontSize: '13px' }}>
          Especificaciones técnicas del vehículo AGV
        </p>
      </div>

      {/* Tarjetas de especificaciones */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px', maxWidth: '900px'
      }}>
        <SpecCard icono="🤖" label="Modelo" valor={robot.modelo} color={PRIMARY} />
        <SpecCard icono="⚖️" label="Capacidad" valor={`${robot.capacidad_kg} kg`} color={GREEN} />
        <SpecCard icono="⚡" label="Velocidad Máx." valor={`${robot.velocidad_max} m/s`} color={WARN} />
        <SpecCard icono="🔋" label="Autonomía" valor={`${robot.autonomia_min} min`} color={GREEN} />
        <SpecCard icono="📍" label="Ubicación" valor={robot.ubicacion_inicial || 'Zona A'} color={PRIMARY} />
        <SpecCard icono="📝" label="Descripción" valor={robot.descripcion || 'Sin descripción'} color={PRIMARY} />
      </div>

      {/* Estado del robot */}
      <div style={{
        marginTop: '24px', background: 'white', borderRadius: '16px',
        padding: '24px', maxWidth: '900px', boxShadow: '0 3px 16px rgba(0,51,102,0.09)'
      }}>
        <h3 style={{ margin: '0 0 16px', color: PRIMARY, fontSize: '16px', fontWeight: 600 }}>
          Estado Actual
        </h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{
            width: '14px', height: '14px', borderRadius: '50%', background: GREEN,
            boxShadow: `0 0 8px ${GREEN}80`
          }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: GREEN }}>
            Activo y operativo
          </span>
        </div>
      </div>
    </div>
  );
}

function SpecCard({ icono, label, valor, color }) {
  return (
    <div style={{
      background: 'white', borderRadius: '14px', padding: '20px',
      boxShadow: '0 2px 10px rgba(0,51,102,0.06)',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <span style={{ fontSize: '20px' }}>{icono}</span>
        <span style={{ fontSize: '11px', color: '#999', fontWeight: 600, textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: MONO, color }}>
        {valor}
      </div>
    </div>
  );
}