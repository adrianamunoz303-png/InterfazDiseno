# AS/RS — Sistema de Gestión de Almacén
### Interfaz HMI · Universidad de Pamplona · Etapa 2

Plataforma Humano-Máquina (HMI) para el sistema automatizado de almacenamiento y recuperación (AS/RS) desarrollado por el Grupo Frontend/HMI de la Universidad de Pamplona, Norte de Santander, Colombia.

---

## Índice

1. [Descripción del sistema](#descripción-del-sistema)
2. [Sistema de diseño — Identidad Visual UP](#sistema-de-diseño--identidad-visual-up)
   - [Paleta de colores](#paleta-de-colores)
   - [Tipografía](#tipografía)
   - [Espaciado y radios](#espaciado-y-radios)
   - [Sombras y superficies](#sombras-y-superficies)
   - [Variables CSS](#variables-css)
3. [Arquitectura y estructura de archivos](#arquitectura-y-estructura-de-archivos)
4. [Módulos de la aplicación](#módulos-de-la-aplicación)
5. [Sistema de autenticación y roles](#sistema-de-autenticación-y-roles)
6. [Navegación](#navegación)
7. [Tecnologías y dependencias](#tecnologías-y-dependencias)
8. [Instalación y ejecución](#instalación-y-ejecución)
9. [Pendientes Etapa 3](#pendientes-etapa-3)

---

## Descripción del sistema

El sistema AS/RS HMI permite:

- Visualizar el estado del inventario en tiempo real (categorías A, B, C)
- Gestionar el despacho de productos mediante cola FIFO
- Registrar la recepción de nuevos productos
- Monitorear el estado de los robots del almacén
- Administrar usuarios con control de acceso por rol
- Control de acceso diferenciado por niveles: Operario → Admin → Super Admin

---

## Sistema de diseño — Identidad Visual UP

El diseño sigue el **Manual de Imagen Institucional** de la Universidad de Pamplona.

### Paleta de colores

#### Colores primarios institucionales

| Token | Hex | RGB | CMYK | Uso |
|-------|-----|-----|------|-----|
| Azul marino (primario) | `#003366` | R:0 G:51 B:102 | C:95 M:90 Y:40 K:5 | Encabezados, barras, botones principales, bordes activos |
| Burdeos (secundario) | `#AD3333` | R:173 G:51 B:51 | C:30 M:90 Y:80 K:5 | Acciones críticas, alertas, badges de Super Admin |
| Gris neutro | `#DADADA` | R:218 G:218 B:218 | C:0 M:0 Y:0 K:20 | Bordes, divisores, barras de progreso vacías |

#### Colores semánticos del sistema

| Token | Hex | Uso |
|-------|-----|-----|
| Verde operativo | `#1A9E5A` | Estado OK, éxito, badge Operario, conexión estable |
| Amarillo advertencia | `#D48B00` | Advertencias, badge Admin, métricas en riesgo |
| Fondo de página | `#F0F2F5` | Superficie de fondo general |
| Superficie de tarjeta | `#FFFFFF` | Cards, paneles, sidebar |
| Superficie alternativa | `#F8F9FB` | Filas de tabla, interior de badges |

#### Uso de color por rol

| Rol | Color | Hex |
|-----|-------|-----|
| Super Admin | Burdeos | `#AD3333` |
| Admin | Advertencia | `#D48B00` |
| Operario | Verde | `#1A9E5A` |

#### Convención de transparencias (fondos de badge/alerta)

```
Fondo de badge de color:   color + "12"  → ej. #AD333312  (7.5% opacidad)
Fondo de alerta crítica:   rgba(173, 51, 51, 0.06–0.08)
Borde de alerta crítica:   rgba(173, 51, 51, 0.2–0.3)
Fondo de alerta ok:        rgba(26, 158, 90, 0.06–0.08)
Fondo azul suave (hover):  rgba(0, 51, 102, 0.05–0.08)
Borde azul suave:          rgba(0, 51, 102, 0.15)
```

---

### Tipografía

#### Fuente principal — institucional UP

```
font-family: 'Century Gothic', Candara, 'Trebuchet MS', -apple-system, BlinkMacSystemFont, sans-serif
```

- **Century Gothic** — fuente oficial del Manual de Imagen de la Universidad de Pamplona
- **Candara** — sustituto disponible en Windows
- **Trebuchet MS** — sustituto de fallback

#### Fuente monoespaciada — datos técnicos

```
font-family: 'Roboto Mono', 'Courier New', monospace
```

Usada en: valores KPI, horas del reloj, usernames, versiones, tiempos de turno, valores de telemetría.  
Cargada desde Google Fonts: `@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap')`

#### Escala tipográfica

| Variable CSS | Tamaño | Uso |
|---|---|---|
| `--text-h1` | 22px | Títulos de página (Panel de Control, Dashboard) |
| `--text-h2` | 18px | Subtítulos de sección |
| `--text-h3` | 14px | Títulos de panel/card |
| `--text-body` | 14px | Texto de cuerpo general |
| `--text-meta` | 12px | Etiquetas, pies de card, timestamps |
| `--text-alert` | 13px | Mensajes de alerta y error |
| `--text-btn` | 13px | Texto de botones |
| `--text-kpi` | 22px | Valores numéricos grandes (KPI) |

#### Pesos tipográficos usados

| Peso | Uso |
|------|-----|
| 400 (regular) | Texto de cuerpo, descripciones |
| 500 (medium) | Etiquetas de campo, metadatos |
| 600 (semibold) | Subtítulos, valores de tabla |
| 700 (bold) | Títulos de página, botones, KPIs |

---

### Espaciado y radios

| Elemento | Valor |
|----------|-------|
| Radio de card principal | `12px` |
| Radio de card grande | `14–16px` |
| Radio de botón | `8px` |
| Radio de badge/chip | `5–10px` (pill: `20px`) |
| Radio de badge circular (nivel) | `50%` |
| Gap entre cards KPI | `10–14px` |
| Padding interior de card | `16–22px` |
| Padding de página | `24px 28px 48px` |
| Ancho del sidebar | `200px` |
| Alto de la TopBar | `60px` |

---

### Sombras y superficies

```css
/* Card estándar */
box-shadow: 0 2px 8px rgba(0, 51, 102, 0.06);

/* Card con mayor elevación */
box-shadow: 0 4px 20px rgba(0, 51, 102, 0.07);

/* Sidebar */
box-shadow: 2px 0 8px rgba(0, 51, 102, 0.05);

/* TopBar */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);

/* Modal / login card */
box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
```

---

### Variables CSS

Definidas en `src/index.css` bajo `:root`:

```css
:root {
  /* ── Paleta oficial Universidad de Pamplona ── */
  --up-navy:    #003366;   /* azul marino — color primario */
  --up-wine:    #AD3333;   /* burdeos — color secundario  */
  --up-neutral: #DADADA;   /* gris claro — neutro         */

  /* Semánticos */
  --color-primary:   #003366;
  --color-secondary: #AD3333;
  --color-critical:  #AD3333;
  --color-neutral:   #DADADA;
  --color-ok:        #1A9E5A;
  --color-warning:   #D48B00;

  /* Superficies */
  --color-surface:     #FFFFFF;
  --color-surface-alt: #F0F2F5;
  --color-border:      #DADADA;

  /* Texto */
  --color-text-primary:   #222222;
  --color-text-secondary: #777777;
  --color-text-meta:      #555555;
  --color-text-on-dark:   #FFFFFF;

  /* Tipografía institucional */
  --font-base: 'Century Gothic', Candara, 'Trebuchet MS', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'Roboto Mono', 'Courier New', monospace;

  /* Escala tipográfica */
  --text-h1:    22px;
  --text-h2:    18px;
  --text-h3:    14px;
  --text-body:  14px;
  --text-meta:  12px;
  --text-alert: 13px;
  --text-btn:   13px;
  --text-kpi:   22px;
}
```

#### Constantes inline en componentes React

Cada página define las mismas constantes como variables JS para usarlas en estilos inline:

```js
const PRIMARY = '#003366';   // azul marino — primario
const ACCENT  = '#AD3333';   // burdeos — secundario
const NEUTRAL = '#DADADA';   // gris neutro
const GREEN   = '#1A9E5A';   // operativo / éxito
const WARN    = '#D48B00';   // advertencia
const FONT    = "'Century Gothic', Candara, 'Trebuchet MS', sans-serif";
const MONO    = "'Roboto Mono', monospace";
```

---

## Arquitectura y estructura de archivos

```
src/
├── context/
│   └── AuthContext.js         # Auth global: login, logout, CRUD usuarios, localStorage
│
├── pages/
│   ├── Login.js               # Pantalla de inicio de sesión
│   ├── dashboard.js           # Panel principal — layout con TopBar + Sidebar + contenido
│   ├── Almacenamiento.js      # Inventario por categorías A/B/C con conexión GET
│   ├── Dispensa.js            # Despacho con cola FIFO
│   ├── recepcion.js           # Recepción de productos
│   ├── robot.js               # Módulo de robots (Etapa 3 — en desarrollo)
│   └── GestionUsuarios.js     # CRUD de usuarios — solo superadmin
│
├── components/
│   └── common/
│       ├── PageHeader.js      # (Legacy — reemplazado por TopBar en Dashboard)
│       ├── BackButton.js
│       ├── Card.js
│       ├── CardElements.js / .css
│       ├── LocalAlerts.js
│       ├── OperationControls.js
│       ├── ProductQueue.js
│       ├── QRScanner.js
│       └── StationStatus.js
│
├── hooks/
│   ├── useAlmacen.js          # GET inventario del backend
│   └── useFifo.js             # Cola FIFO
│
├── App.js                     # Rutas: /login  /
├── App.css                    # Clases CSS para Almacenamiento y layout global
└── index.css                  # Variables CSS y estilos base del body
```

---

## Módulos de la aplicación

### Login

- Fondo: gradiente `linear-gradient(135deg, #001020 0%, #001f3f 55%, #003366 100%)` con grid superpuesto
- Panel izquierdo: logo + branding UP + tres puntos de colores institucionales
- Card derecha: header `#003366`, formulario con validación, toggle de contraseña
- Franja superior: gradiente multicolor institucional (`#003366 → #0055a5 → #AD3333 → #D48B00 → #1A9E5A`)

### Dashboard

Layout de tres capas:

```
TopBar (60px, fijo, #003366)
└── Contenido (flex row)
    ├── Sidebar (200px, sticky, blanco con borde #DADADA)
    └── Área de contenido (flex: 1, fondo #F0F2F5)
        └── Vista según rol: OperarioView | AdminView | SuperAdminView
            o módulo seleccionado: Almacenamiento | Dispensa | Recepción | Robot | GestionUsuarios
```

**TopBar:** logo UP, nombre del sistema, reloj en tiempo real (Roboto Mono), badge de rol con color semántico, nombre del usuario, botón "Cerrar sesión".

**Sidebar:** botones de navegación con estado activo (borde izquierdo `3px solid #003366`, fondo `rgba(0,51,102,0.08)`). Sin cambio de URL — actualiza estado React `activeSection`.

### Almacenamiento

- Conexión GET con backend vía `useAlmacen`
- Clasificación en tres categorías: A (verde), B (azul), C (naranja)
- Barras de progreso de ocupación en `#003366`
- Alertas de capacidad en `rgba(173,51,51,...)` 

### Dispensa

- Sistema de despacho con cola FIFO (`useFifo`)
- Búsqueda y filtrado de productos
- GET implementado; POST pendiente

### Recepción

- UI estática con `OperationControls` (INICIAR, LLAMAR ROBOTS, PAUSAR, ABORTAR)
- Sin conexión POST al backend aún

### Robot

- Módulo en construcción (Etapa 3)
- Cards de funcionalidades futuras: Telemetría, Control manual, Mapa en vivo, Estadísticas
- Badge de estado: `rgba(212,139,0,0.08)` con borde `rgba(212,139,0,0.3)`

### Gestión de Usuarios *(solo superadmin)*

- Panel izquierdo: formulario de creación con validación (nombre, username, contraseña, rol)
- Panel derecho: lista filtrable por rol con indicador de sesión activa, toggle de contraseña, eliminación con confirmación
- Selector de rol visual con colores semánticos por rol
- No se puede eliminar el propio usuario activo

---

## Sistema de autenticación y roles

### Flujo de autenticación

```
Login → AuthContext.login() → sessionStorage (sesión activa)
                            → setUser() → Dashboard
```

- La sesión se guarda en `sessionStorage` (se pierde al cerrar el tab)
- Los usuarios se persisten en `localStorage` (`asrs_users`)
- Al iniciar: si `localStorage` tiene usuarios, los carga; si no, usa los DEFAULT_USERS

### Usuarios por defecto

| Username | Contraseña | Rol | Nivel |
|----------|------------|-----|-------|
| `superadmin` | `SA@2025!` | superadmin | 3 |
| `admin` | `Adm@2025!` | admin | 2 |
| `operario` | `Op@2025!` | operario | 1 |

### Acceso por rol

| Módulo | Operario (1) | Admin (2) | Super Admin (3) |
|--------|:---:|:---:|:---:|
| Dashboard | ✓ | ✓ | ✓ |
| Dispensa | ✓ | — | ✓ |
| Recepción | ✓ | — | ✓ |
| Inventario | ✓ | ✓ | ✓ |
| Robots | ✓ | ✓ | ✓ |
| Gestión de Usuarios | — | — | ✓ |

### API de AuthContext

```js
const { user, users, login, logout, addUser, deleteUser, updateUser } = useAuth();

// login(username, password) → { ok: true, user } | { ok: false, error }
// addUser({ nombre, username, password, role }) → { ok: true } | { ok: false, error }
// deleteUser(id) → void
// updateUser(id, changes) → void
```

---

## Navegación

La navegación es **en sitio** (sin cambio de URL). El sidebar actualiza el estado `activeSection` en Dashboard y `renderContent()` devuelve el componente correspondiente:

```js
function renderContent() {
  switch (activeSection) {
    case 'almacenamiento': return <Almacenamiento />;
    case 'dispensa':       return <Dispensa />;
    case 'recepcion':      return <Recepcion />;
    case 'robot':          return <Robot />;
    case 'usuarios':       return <GestionUsuarios />;
    default:               // vista por rol (OperarioView | AdminView | SuperAdminView)
  }
}
```

Rutas URL de React Router (solo dos):

```
/login  →  Login.js
/       →  Dashboard.js  (requiere sesión activa)
```

---

## Tecnologías y dependencias

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `react` | ^19.2.0 | Framework principal |
| `react-dom` | ^19.2.0 | Renderizado en DOM |
| `react-router-dom` | ^7.9.6 | Enrutamiento SPA |
| `react-scripts` | 5.0.1 | Herramientas de desarrollo (CRA) |
| `@testing-library/react` | ^16.3.0 | Testing |

**Entorno:** Node.js 24.x · npm · Windows 11

**Estilo:** 100% CSS-in-JS (estilos inline en React) + clases CSS globales en `App.css` para el módulo de Almacenamiento. Sin librerías de UI externas (Material UI, Bootstrap, etc.).

---

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:3000)
npm start

# Build de producción
npm run build

# Ejecutar tests
npm test
```

---

## Pendientes Etapa 3

| Tarea | Prioridad |
|-------|-----------|
| Implementar POST en Dispensa (despacho efectivo) | Alta |
| Implementar POST en Recepción (ingreso a BD) | Alta |
| Migrar gestión de usuarios de localStorage a API REST | Alta |
| Telemetría en tiempo real para módulo Robots | Media |
| Control manual de robots (comandos directos) | Media |
| Mapa visual de la planta en Dashboard | Media |
| Sistema de notificaciones / logging | Media |
| Hooks dedicados para módulo Robot | Baja |
| Responsive design (móvil/tablet) | Baja |

---

*AS/RS Automatizado · Grupo Frontend/HMI · Universidad de Pamplona*
