# AS/RS — Sistema de Gestión de Almacén
### HMI · Universidad de Pamplona · Etapa 2

Interfaz Humano-Máquina (HMI) para el sistema automatizado de almacenamiento y recuperación (AS/RS) desarrollado por el Grupo Frontend/HMI de la Universidad de Pamplona. La plataforma permite la supervisión y control del almacén, gestión de inventario, despacho FIFO, recepción de productos, monitoreo de robots y administración de usuarios.

---

## Tecnologías

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| React | ^19.2.0 | Framework principal |
| react-router-dom | ^7.9.6 | Enrutamiento SPA |
| react-scripts | 5.0.1 | Herramientas de desarrollo |
| Node.js | 24.x | Entorno de ejecución |

**Diseño:** Paleta oficial Universidad de Pamplona (`#003366` azul marino · `#AD3333` burdeos · `#DADADA` gris neutro). Tipografía: Century Gothic / Candara / Trebuchet MS.

---

## Estructura del proyecto

```
src/
├── context/
│   └── AuthContext.js       # Autenticación y gestión de usuarios (localStorage)
├── pages/
│   ├── Login.js             # Pantalla de inicio de sesión
│   ├── dashboard.js         # Panel principal con sidebar integrado
│   ├── Almacenamiento.js    # Inventario por categorías A/B/C
│   ├── Dispensa.js          # Despacho con cola FIFO
│   ├── recepcion.js         # Recepción de productos
│   ├── robot.js             # Control y telemetría de robots (Etapa 3)
│   └── GestionUsuarios.js   # Creación y eliminación de usuarios (superadmin)
├── components/
│   └── common/              # PageHeader, BackButton, CardElements, etc.
├── hooks/
│   ├── useAlmacen.js        # GET inventario del backend
│   └── useFifo.js           # Cola FIFO
├── App.js                   # Rutas: /login → / (Dashboard)
├── App.css                  # Estilos globales
└── index.css                # Variables CSS (--up-navy, --up-wine, --font-base)
```

---

## Roles y accesos

| Rol | Nivel | Módulos disponibles |
|-----|-------|---------------------|
| `operario` | 1 | Dashboard, Dispensa, Recepción, Inventario, Robots |
| `admin` | 2 | Dashboard, Inventario, Robots |
| `superadmin` | 3 | Dashboard, Dispensa, Recepción, Inventario, Robots, Usuarios |

Los usuarios se persisten en **localStorage** hasta que se integre el backend. Los credenciales por defecto son:

| Usuario | Contraseña |
|---------|------------|
| `superadmin` | `SA@2025!` |
| `admin` | `Adm@2025!` |
| `operario` | `Op@2025!` |

---

## Instalación y ejecución

```bash
npm install
npm start      # http://localhost:3000
npm run build  # Build de producción
```

---

## Estado de los módulos

| Módulo | Estado | Notas |
|--------|--------|-------|
| Login | Completo | Autenticación local con sesión en sessionStorage |
| Dashboard | Completo | Vistas diferenciadas por rol, navegación lateral sin recarga |
| Almacenamiento | Completo | Conexión GET con backend, clasificación A/B/C |
| Dispensa | Parcial | GET implementado; POST (despacho) pendiente |
| Recepción | Parcial | UI estática; sin conexión POST al backend |
| Robots | En desarrollo | Etapa 3 — telemetría y control manual |
| Gestión de Usuarios | Completo | CRUD local (localStorage); migración a backend pendiente |

---

## Flujo de navegación

```
/login  →  autenticación  →  / (Dashboard)
                               └─ Sidebar
                                   ├── Dashboard (vista por rol)
                                   ├── Dispensa
                                   ├── Recepción
                                   ├── Inventario
                                   ├── Robots
                                   └── Usuarios  ← solo superadmin
```

La navegación entre módulos es **en sitio** (sin cambio de URL): el sidebar actualiza el estado `activeSection` en Dashboard y el área de contenido renderiza el componente correspondiente.

---

## Pendientes (Etapa 3)

- Conectar POST de Dispensa y Recepción al backend
- Implementar telemetría en tiempo real para el módulo Robots
- Migrar gestión de usuarios de localStorage a API REST
- Sistema de notificaciones / logging
- Mapa visual de la planta en Dashboard
