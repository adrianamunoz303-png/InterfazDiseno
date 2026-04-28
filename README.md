# Sistema de Almacenamiento y Recuperación Automatizado (AS/RS)

## 📋 Descripción General


Este repositorio contiene el desarrollo de la Interfaz Humano-Máquina (HMI) para un sistema automatizado de almacenamiento y recuperación (AS/RS). La interfaz permite visualizar el estado del inventario en tiempo real, mostrando la ubicación de los productos dentro del almacén. También permite simular pedidos de clientes para solicitar productos específicos. El sistema está diseñado para la gestión de almacén con módulos de recepción, almacenamiento, dispensa y control de inventario mediante sistema FIFO.


---

## 📁 Estructura de Carpetas

```
interfaz/
├── 📄 package.json              # Dependencias y configuración del proyecto
├── 📄 package-lock.json         # Versiones bloqueadas de dependencias
├── 📄 README.md                 # Documentación del proyecto
├── 📄 ESTRUCTURA.md             # Este archivo
├── 🗂️ .git/                     # Control de versiones Git
├── 🗂️ .vscode/                  # Configuración de VS Code
├── 🗂️ .gitignore                # Archivos ignorados por Git
├── 🗂️ node_modules/             # Librerías instaladas
├── 🗂️ public/                   # Archivos estáticos
│   ├── 📄 index.html
│   ├── 📄 manifest.json
│   └── 📄 robots.txt
│
└── 🗂️ src/                      # Código fuente principal
    ├── 📄 index.js              # Punto de entrada de la aplicación
    ├── 📄 App.js                # Componente raíz con rutas
    ├── 📄 App.css               # Estilos globales
    ├── 📄 App.test.js           # Tests de App
    ├── 📄 index.css             # Estilos generales
    ├── 📄 logo.svg              # Logo de React
    ├── 📄 reportWebVitals.js    # Métricas de rendimiento
    ├── 📄 setupTests.js         # Configuración de tests
    │
    ├── 🗂️ pages/                # Páginas principales (vistas)
    │   ├── 📄 dashboard.js      # Panel principal del sistema
    │   ├── 📄 Almacenamiento.js # Gestión de inventario por categorías
    │   ├── 📄 Dispensa.js       # Sistema de despacho y FIFO
    │   ├── 📄 recepcion.js      # Módulo de recepción de productos
    │   └── 📄 robot.js          # Control y monitoreo de robots
    │
    ├── 🗂️ components/           # Componentes reutilizables
    │   │
    │   ├── 🗂️ common/           # Componentes comunes
    │   │   ├── 📄 PageHeader.js # Encabezado de página con info del usuario
    │   │   ├── 📄 BackButton.js # Botón para volver atrás
    │   │   ├── 📄 Card.js       # Componente Card (botón)
    │   │   ├── 📄 boton.js      # Componente de botón personalizado
    │   │   ├── 📄 CardElements.js # Tarjeta de producto
    │   │   ├── 📄 CardElements.css # Estilos de CardElements
    │   │   ├── 📄 LocalAlerts.js # Sistema de alertas locales
    │   │   ├── 📄 OperationControls.js # Controles de operaciones
    │   │   ├── 📄 ProductQueue.js # Cola de productos
    │   │   ├── 📄 QRScanner.js  # Escáner de códigos QR
    │   │   └── 📄 StationStatus.js # Estado de estaciones
    │   │
    │   └── 🗂️ recepcion/        # Componentes específicos de recepción
    │       ├── 📄 LocalAlerts.js
    │       ├── 📄 OperationControls.js
    │       ├── 📄 ProductQueue.js
    │       ├── 📄 QRScanner.js
    │       └── 📄 StationStatus.js
    │
    └── 🗂️ hooks/                # Custom Hooks para lógica reutilizable
        ├── 📄 useAlmacen.js     # Hook para obtener inventario del servidor
        └── 📄 useFifo.js        # Hook para gestionar cola FIFO
```

---

## 📖 Descripción por Carpeta

### **src/** - Código Fuente Principal
Contiene toda la lógica de la aplicación React.

### **src/pages/** - Páginas Principales
Cada archivo representa una página/vista completa de la aplicación:

| Archivo | Descripción |
|---------|-------------|
| `dashboard.js` | Panel de control principal con estado del sistema |
| `Almacenamiento.js` | Gestión de inventario organizado por categorías A, B, C |
| `Dispensa.js` | Sistema de despacho con búsqueda, filtros y cola FIFO |
| `recepcion.js` | Recepción de nuevos productos al almacén |
| `robot.js` | Control y monitoreo de robots de almacén |

### **src/components/common/** - Componentes Reutilizables
Componentes genéricos usados en varias páginas:

| Componente | Función |
|-----------|----------|
| `PageHeader` | Encabezado con título, hora y nivel de acceso |
| `BackButton` | Botón de navegación hacia atrás |
| `CardElements` | Tarjeta para mostrar información de productos |
| `Card / boton` | Botones personalizados |
| `LocalAlerts` | Sistema de notificaciones locales |
| `QRScanner` | Escáner de códigos QR |
| `ProductQueue` | Cola visual de productos |
| `StationStatus` | Indicador de estado de estaciones |
| `OperationControls` | Controles de operaciones [**INICIAR, LLAMAR ROBOTS, PAUSAR, ABORTAR**] - Usado en recepción |



## RECOMENDACION:
-Para Mantener la coherencia a la estructura modular se sugiere que si se utilice
elementos css o jss en un solo modulo se almacene en  **src/components/Modulo/**

- **OperationControls**: Actualmente solo implementado en recepción. Considerar si otros módulos (Dispensa, Robot) necesitan controles similares.



### **src/hooks/** - Custom Hooks
Lógica reutilizable para obtener,gestionar y enviar datos con el Back-end:

## RECOMENDACION:
-Para Mantener la coherencia a la estructura modular se sugiere que si se utilice
elementos css o jss en un solo modulo se almacene en  **src/hooks/Modulo/**


| Hook | Descripción |
|------|-------------|
| `useAlmacen` | Obtiene lista de productos del inventario del servidor |
| `useFifo` | Obtiene y gestiona la cola FIFO de despachos |

---

## 🔄 Flujo de Datos

```
API Backend
    ↓
hooks(GET)
    ↓
Pages (Dashboard, Almacenamiento, Dispensa, etc.)
    ↓
Components (Renderiza UI)
    ↓
Usuario (Interacciona)
    ↓
hooks(POST)
    ↓
API Backend

```
## 📦 Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `App.js` | Configuración de rutas y componente raíz |
| `index.js` | Punto de entrada de la aplicación |
| `package.json` | Dependencias: react, react-router-dom, etc. |

---

## 🎯 Módulos Principales
### 1. **Dashboard**
- Panel principal con estado general del sistema
- Reloj en tiempo real
- Información de ocupación y robots activos

### 2. **Almacenamiento**
- Vista de inventario por categorías (A, B, C)
- Basado en ubicación del producto
- Porcentaje de ocupación
- Filtrado por categoría

### 3. **Dispensa**
- Búsqueda y filtrado de productos
- Cola FIFO automática
- Botones de despacho en dos ubicaciones
- Historial de productos despachados

### 4. **Recepción**
- Ingreso de nuevos productos
- Lectura de códigos QR
- Asignación de ubicación

### 5. **Robot**
- Monitoreo de robots
- Estado de operaciones
- Historial de movimientos

---

## 🔗 Relaciones entre Componentes

```
App.js (Router)
├── Dashboard
│   └── PageHeader, CardElements
├── Almacenamiento
│   ├── useAlmacen (Hook)
│   ├── PageHeader
│   └── CardElements
├── Dispensa
│   ├── useAlmacen (Hook)
│   ├── useFifo (Hook)
│   ├── PageHeader
│   ├── CardElements
│   └── BackButton
├── Recepcion
│   ├── QRScanner
│   ├── PageHeader
│   ├── LocalAlerts
│   └── OperationControls
└── Robot
    ├── 
    └── 
```


--
## 🚀 Punto de Entrada

1. `public/index.html` → Carga la aplicación
2. `src/index.js` → Renderiza App en el DOM
3. `src/App.js` → Define rutas y estructura
4. `src/pages/*` → Renderiza la página según ruta

---

## 💻 Tecnologías y Versiones

### **JavaScript**
- **Versión**: ES6+ (ES2015+)
- **Características usadas**:
  - Arrow functions (`=>`)
  - Template literals (`` ` ``)
  - Destructuring assignment
  - Async/await
  - Modules (import/export)
  - React Hooks (useState, useEffect)

### **CSS**
- **Versión**: CSS3
- **Enfoque**: CSS-in-JS (estilos inline en componentes)
- **Características**: Flexbox, Grid, Transiciones, Media queries

### **React**
- **Versión**: 19.2.0
- **Características**: Functional Components, Hooks, React Router DOM

### **Node.js**
- **Versión**: 24.11.1
- **Package Manager**: npm

### **Dependencias Principales**
| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `react` | ^19.2.0 | Framework principal |
| `react-dom` | ^19.2.0 | Renderizado en DOM |
| `react-router-dom` | ^7.9.6 | Enrutamiento SPA |
| `react-scripts` | 5.0.1 | Herramientas de desarrollo |
| `@testing-library/react` | ^16.3.0 | Testing utilities |

---

## DETALLES / Resumen
### Dashboard
- Carece de mapa de visualizacion la planta
- Indicadores Estaticos[Desconexion con el back-end]
- Carece del modulo de logging establecido al principio del semestre
- Modulo de Notificaciones nulamente realizada

### ALMACENAMIENTO
- CORRECTAMENTE IMPLEMENTADA
- Conexion con back-end
- Protocolo GET correctamente implementada
- Clasificacion exitosa en las 3 categorias

### DISPENSA
- Actualizacion del Front al Back-end
  - Modificacion de etiquetas/estados de los items, ejemplo,
  pasar del estado de 'almacenado' a en cola,es decir, NO hay POST
  - BOTENES ESTATICOS: No hay implementacion POST

### RECEPCION
- Solo contenido estatico, no hay GET Y POST Con el Back-end,es decir, no modifica la
base de datos
- OperationControls implementado pero sin funcionalidad POST al back-end

### ROBOT
- PESTALLA EN BLANCO


## MI RECOMENDACION
- Crear otra Hooks para el robots
- crear protocolos POST  en el front
- Implementar lista de Notificaciones establecidas en las diapositivaas

