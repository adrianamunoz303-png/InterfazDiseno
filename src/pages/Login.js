import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) { setError('Ingrese usuario y contraseña.'); return; }
    setLoading(true);
    setTimeout(() => {
      const result = login(username.trim(), password);
      if (result.ok) navigate('/', { replace: true });
      else { setError(result.error); setLoading(false); }
    }, 400);
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', fontSize: '14px',
    fontFamily: 'Inter, sans-serif', color: '#222222',
    border: '1.5px solid #DADADA', borderRadius: '8px',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s', background: '#FAFAFA'
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden',
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px),
        linear-gradient(135deg, #001020 0%, #001f3f 55%, #003366 100%)
      `,
      backgroundSize: '48px 48px, 48px 48px, 100% 100%'
    }}>

      {/* Franja superior de colores */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
        background: 'linear-gradient(90deg, #003366, #0055a5, #AD3333, #D48B00, #1A9E5A)'
      }} />

      {/* Círculos decorativos de fondo */}
      <div style={{ position:'absolute', top:'8%', right:'7%', width:'300px', height:'300px',
        borderRadius:'50%', background:'rgba(0,83,166,0.07)',
        border:'1px solid rgba(0,83,166,0.13)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'6%', left:'5%', width:'220px', height:'220px',
        borderRadius:'50%', background:'rgba(0,51,102,0.09)',
        border:'1px solid rgba(0,83,166,0.11)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:'42%', left:'3%', width:'130px', height:'130px',
        borderRadius:'50%', background:'rgba(26,158,90,0.05)',
        border:'1px solid rgba(26,158,90,0.09)', pointerEvents:'none' }} />

      {/* Layout: panel izquierdo + card */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '52px',
        zIndex: 1, width: '100%', maxWidth: '860px', padding: '24px'
      }}>

        {/* Panel izquierdo — branding */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column',
          alignItems: 'flex-start', gap: '22px', color: '#FFFFFF' }}>

          <img
            src="/logo_U_png.png"
            alt="Universidad de Pamplona"
            style={{
              height: '68px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.28))'
            }}
          />

          <div>
            <h1 style={{
              margin: 0, fontSize: '30px', fontWeight: '700',
              color: '#FFFFFF', lineHeight: 1.2, letterSpacing: '-0.5px'
            }}>
              AS/RS<br />Sistema de Gestión<br />de Almacén
            </h1>
            <p style={{
              margin: '14px 0 0 0', fontSize: '13px',
              color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: '290px'
            }}>
              Plataforma HMI para la supervisión y control
              del sistema automatizado de almacenamiento
              y recuperación.
            </p>
          </div>
        </div>

        {/* Card de login */}
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          width: '100%', maxWidth: '370px',
          overflow: 'hidden', flexShrink: 0
        }}>
          {/* Header card */}
          <div style={{
            background: '#003366', padding: '28px 36px 22px', textAlign: 'center'
          }}>
            <img
              src="/logo_U_png.png"
              alt="Universidad de Pamplona"
              style={{
                height: '48px',
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto 14px',
                filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.2))'
              }}
            />
            <h2 style={{ margin: 0, color: '#FFFFFF', fontSize: '16px', fontWeight: '700' }}>
              Acceso al Sistema
            </h2>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.55)', fontSize: '11px' }}>
              Universidad de Pamplona · Etapa 2
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} style={{ padding: '28px 36px 32px' }}>

            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: '600',
                color: '#003366', marginBottom: '6px',
                textTransform: 'uppercase', letterSpacing: '0.6px'
              }}>Usuario</label>
              <input
                type="text" value={username} placeholder="Ingrese su usuario"
                autoComplete="username"
                onChange={e => setUsername(e.target.value)}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor='#003366'; e.target.style.background='#FFF'; }}
                onBlur={e => { e.target.style.borderColor='#DADADA'; e.target.style.background='#FAFAFA'; }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: '600',
                color: '#003366', marginBottom: '6px',
                textTransform: 'uppercase', letterSpacing: '0.6px'
              }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  placeholder="Ingrese su contraseña" autoComplete="current-password"
                  onChange={e => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={e => { e.target.style.borderColor='#003366'; e.target.style.background='#FFF'; }}
                  onBlur={e => { e.target.style.borderColor='#DADADA'; e.target.style.background='#FAFAFA'; }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position:'absolute', right:'12px', top:'50%',
                    transform:'translateY(-50%)', background:'none', border:'none',
                    cursor:'pointer', fontSize:'15px', color:'#999', padding:'4px' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                marginBottom: '14px', padding: '10px 14px',
                background: 'rgba(173,51,51,0.07)',
                border: '1px solid rgba(173,51,51,0.25)',
                borderRadius: '8px', color: '#AD3333',
                fontSize: '13px', fontWeight: '600',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px', fontSize: '13px', fontWeight: '700',
                letterSpacing: '1px', fontFamily: 'Inter, sans-serif', color: '#FFFFFF',
                background: loading ? '#5580a3' : '#003366', border: 'none',
                borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s', minHeight: '48px'
              }}
              onMouseEnter={e => { if (!loading) e.target.style.background = '#00204d'; }}
              onMouseLeave={e => { if (!loading) e.target.style.background = '#003366'; }}
            >
              {loading ? 'Verificando...' : 'INGRESAR AL SISTEMA'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: '18px', left: 0, right: 0, textAlign: 'center',
        color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontFamily: 'Inter, sans-serif'
      }}>
        AS/RS Automatizado · Grupo Frontend/HMI · Universidad de Pamplona
      </div>
    </div>
  );
}
