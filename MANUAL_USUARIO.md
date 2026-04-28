# Manual de Usuario
## AS/RS — Sistema de Gestión de Almacén
### Universidad de Pamplona · Interfaz HMI · Etapa 2

---

## Contenido

1. [Introducción](#1-introducción)
2. [Acceso al sistema — Inicio de sesión](#2-acceso-al-sistema--inicio-de-sesión)
3. [Estructura general de la interfaz](#3-estructura-general-de-la-interfaz)
4. [Panel de control — Dashboard](#4-panel-de-control--dashboard)
5. [Módulo de Inventario — Almacenamiento](#5-módulo-de-inventario--almacenamiento)
6. [Módulo de Dispensa](#6-módulo-de-dispensa)
7. [Módulo de Recepción](#7-módulo-de-recepción)
8. [Módulo de Robots](#8-módulo-de-robots)
9. [Gestión de Usuarios (Solo Super Admin)](#9-gestión-de-usuarios-solo-super-admin)
10. [Cerrar sesión](#10-cerrar-sesión)
11. [Roles y permisos](#11-roles-y-permisos)
12. [Preguntas frecuentes](#12-preguntas-frecuentes)

---

## 1. Introducción

El **Sistema AS/RS HMI** es la interfaz de supervisión y control del sistema automatizado de almacenamiento y recuperación de la Universidad de Pamplona. Permite a los usuarios consultar el estado del inventario, gestionar despachos, registrar recepciones de productos y controlar los robots del almacén, según el nivel de acceso asignado.

La plataforma está diseñada para tres tipos de usuarios:

| Perfil | Descripción |
|--------|-------------|
| **Operario** | Personal operativo. Accede a los módulos de Dispensa, Recepción, Inventario y Robots. |
| **Administrador** | Supervisa el proceso. Accede a Inventario y Robots con métricas de gestión. |
| **Super Administrador** | Control total del sistema, incluyendo la creación y eliminación de usuarios. |

---

## 2. Acceso al sistema — Inicio de sesión

### Paso a paso

**1.** Abra el navegador y diríjase a la dirección del sistema (por defecto: `http://localhost:3000`).

**2.** Verá la pantalla de inicio de sesión con dos campos:

- **Usuario** — ingrese su nombre de usuario (sin espacios, en minúsculas)
- **Contraseña** — ingrese su contraseña

**3.** Haga clic en el botón **INGRESAR AL SISTEMA**.

**4.** Si los datos son correctos, el sistema lo llevará automáticamente al Panel de Control correspondiente a su rol.

### Credenciales por defecto

> **Nota:** Estas credenciales son para pruebas. El Super Admin puede crear nuevas cuentas desde el módulo de Gestión de Usuarios.

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| `superadmin` | `SA@2025!` | Super Administrador |
| `admin` | `Adm@2025!` | Administrador |
| `operario` | `Op@2025!` | Operario |

### Mensajes de error comunes

| Mensaje | Solución |
|---------|----------|
| *"Usuario o contraseña incorrectos"* | Verifique que no haya espacios al inicio o al final. Las contraseñas distinguen mayúsculas y minúsculas. |
| *"Ingrese usuario y contraseña"* | Ambos campos son obligatorios. |

### Consejo
Puede usar el ícono 👁️ al lado del campo de contraseña para mostrar u ocultar lo que está escribiendo.

---

## 3. Estructura general de la interfaz

Una vez dentro del sistema, la pantalla se divide en tres partes:

```
┌─────────────────────────────────────────────────────────────┐
│                     BARRA SUPERIOR (TopBar)                  │
│  Logo UP | Nombre del sistema | Hora | Rol | Usuario | Salir │
├───────────────┬─────────────────────────────────────────────┤
│               │                                             │
│   MENÚ        │                                             │
│   LATERAL     │         ÁREA DE CONTENIDO                   │
│   (Sidebar)   │         (módulo activo)                     │
│               │                                             │
│  - Dashboard  │                                             │
│  - Dispensa   │                                             │
│  - Recepción  │                                             │
│  - Inventario │                                             │
│  - Robots     │                                             │
│  - Usuarios*  │                                             │
│               │                                             │
└───────────────┴─────────────────────────────────────────────┘
                * Solo visible para Super Admin
```

### Barra superior (TopBar)

- **Logo y nombre** — identifica el sistema AS/RS
- **Hora** — reloj en tiempo real (se actualiza cada segundo)
- **Badge de rol** — indica su nivel de acceso (SUPER ADMIN / ADMIN / OPERADOR) con color según perfil
- **Nombre del usuario** — muestra el nombre del usuario conectado
- **Cerrar sesión** — botón para salir del sistema

### Menú lateral (Sidebar)

- Muestra las opciones disponibles según su rol
- El módulo activo se resalta con un borde azul a la izquierda y fondo azul claro
- Al hacer clic en una opción, el contenido se actualiza **sin recargar la página**
- En la parte inferior muestra el rol con el que está conectado

---

## 4. Panel de control — Dashboard

El Dashboard es la pantalla de inicio después de ingresar. Su contenido varía según el rol.

---

### Dashboard — Vista Operario

Muestra el estado operativo en tiempo real del sistema con 6 indicadores:

| Indicador | Descripción |
|-----------|-------------|
| **Nivel de Ocupación** | Porcentaje actual de ocupación del almacén |
| **Robots Activos** | Cuántos robots están en operación |
| **Productos en Dispensa** | Productos activos en el área de despacho |
| **Productos en Recepción** | Productos pendientes de recepción |
| **Estado del Sistema** | OPERATIVO (verde) o ADVERTENCIA (amarillo) |
| **Alarmas Activas** | Número de alarmas sin atender |

También incluye el **panel de Estado de Conexión** que muestra si la comunicación con el sistema es estable o si hay problemas.

---

### Dashboard — Vista Administrador

Muestra métricas de gestión del proceso:

- **5 indicadores KPI:** Ocupación, Robots, Dispensa, Recepción, Alarmas con barras de progreso
- **Métricas del proceso:** Pedidos del día, eficiencia, tiempo promedio de despacho, cola FIFO, uptime, errores del turno
- **Estado del sistema** y estado de conexión
- **Eventos recientes:** registro de los últimos eventos del sistema
- **Análisis de turnos:** tabla con los tres turnos del día (completado, en curso, pendiente), pedidos y eficiencia por turno

---

### Dashboard — Vista Super Administrador

Muestra una visión técnica completa:

- **5 indicadores KPI** (igual que Admin)
- **Información del sistema:** versión HMI, framework, protocolo, entorno, uptime
- **Estado de conexiones:** MQTT Broker, API REST, Base de datos, WebSocket
- **Estado general** con indicador de alarmas
- **Métricas del proceso** (6 métricas en grilla)
- **Tabla de usuarios registrados** con su rol, nivel y estado de sesión (quién está conectado actualmente)

---

## 5. Módulo de Inventario — Almacenamiento

**Acceso:** Todos los roles → opción **Inventario** en el menú lateral.

Este módulo muestra el estado actual del inventario del almacén organizado en tres categorías.

### ¿Qué información muestra?

#### Panel superior — Porcentaje de Ocupación

- **Número grande:** porcentaje total de ocupación del almacén (calculado sobre 50 unidades máximas)
- **Tres contadores:** cantidad de productos almacenados por categoría (A, B, C)
- **Barra de progreso:** representación visual del nivel de ocupación

#### Columnas de categorías

El inventario se divide en tres columnas:

| Categoría | Color del badge | Descripción |
|-----------|----------------|-------------|
| **Categoría A** | Verde | Productos ubicados en zonas A del almacén |
| **Categoría B** | Azul | Productos ubicados en zonas B del almacén |
| **Categoría C** | Naranja | Productos ubicados en zonas C del almacén |

#### Tarjeta de producto

Cada producto muestra:
- **Nombre / Código** del producto
- **Ubicación** dentro del almacén
- **Estado** del producto (almacenado, stock bajo, etc.)
- **Fecha y hora** de registro

#### Alerta de stock bajo

Si alguna categoría tiene productos con stock bajo, aparece un aviso en rojo en la parte superior de esa columna indicando cuántos productos requieren atención.

### Puntos importantes

- Los datos se cargan automáticamente desde el backend al abrir el módulo
- Si aparece *"Cargando datos..."* espere unos segundos
- Si aparece un error de conexión, comuníquese con el administrador del sistema

---

## 6. Módulo de Dispensa

**Acceso:** Operario y Super Admin → opción **Dispensa** en el menú lateral.

Este módulo permite solicitar y despachar productos del almacén mediante el sistema de cola FIFO.

### Descripción de los paneles

La pantalla se divide en cuatro paneles horizontales:

---

#### Panel 1 — Solicitar Producto del Almacén (izquierda)

Aquí puede buscar y despachar productos individualmente.

**Cómo buscar un producto:**

1. Escriba en el campo de búsqueda el nombre o código del producto
2. Use el menú desplegable para filtrar por categoría: Todas / Categoría A / B / C
3. Los productos coincidentes aparecen en la lista de abajo

**Cómo despachar un producto:**

1. Localice el producto en la lista
2. Verifique que su estado sea **"almacenado"** (solo estos se pueden despachar)
3. Haga clic en el botón **📦 Despachar**
4. El sistema confirmará el despacho y el producto pasará al panel de "Productos Despachados"

> **Nota:** Solo se pueden despachar productos con estado *"almacenado"*. Si el botón aparece gris, el producto no está disponible para despacho.

---

#### Panel 2 — Lógica FIFO

Muestra los productos que están en cola de despacho ordenados por orden de llegada (primero en entrar, primero en salir).

- El número en el círculo de cada producto indica su posición en la cola
- El producto con **badge verde "SIGUIENTE"** es el que se despachará primero
- Puede hacer clic en **📦 Despachar Producto** directamente desde este panel

---

#### Panel 3 — Notificaciones

Muestra los mensajes del sistema sobre el estado de las operaciones:
- **Verde** (✓): operación completada con éxito
- **Azul** (ℹ): información general del sistema

---

#### Panel 4 — Productos Despachados

Registro de todos los productos despachados durante la sesión actual, con:
- Código del producto
- Ubicación original en el almacén
- Fecha y hora exacta del despacho

El contador en el encabezado indica cuántos productos se han despachado en la sesión.

---

## 7. Módulo de Recepción

**Acceso:** Operario y Super Admin → opción **Recepción** en el menú lateral.

Este módulo gestiona la entrada de nuevos productos al almacén.

### Descripción de los paneles

---

#### Estado de Estación

Indica el estado de la estación de recepción **D1**:
- Muestra si la estación está **activa** o inactiva
- Punto verde parpadeante = estación operativa

#### Cola de Productos

Lista de productos que están actualmente esperando ser procesados:
- **ID del producto** (ej. PROD-0001)
- **Estado actual** (ej. "En banda transportadora")
- **Hora de llegada**
- **Estado de procesamiento** (Pendiente / En proceso / Completado)

#### Escáner QR

Permite activar el lector de códigos QR para identificar productos entrantes:
- Haga clic en **"Iniciar escaneo"** para activar el escáner
- Apunte al código QR del producto
- El sistema leerá automáticamente la información del producto

#### Alertas Locales

Panel de avisos del módulo de recepción:
- Muestra alertas sobre productos en espera
- Notificaciones de verificación requerida
- Cada alerta incluye el mensaje y la hora

---

### Controles de Operación (barra inferior)

Cuatro botones para controlar el proceso de recepción:

| Botón | Función |
|-------|---------|
| **INICIAR** | Inicia el proceso de recepción de productos |
| **LLAMAR ROBOTS** | Envía una señal para que el robot retire el producto de la banda |
| **PAUSAR** | Pausa temporalmente la operación en curso |
| **ABORTAR** | Detiene y cancela la operación actual |

> **Importante:** Los botones PAUSAR y ABORTAR deben usarse solo cuando sea necesario, ya que interrumpen el flujo de trabajo del almacén.

---

## 8. Módulo de Robots

**Acceso:** Todos los roles → opción **Robots** en el menú lateral.

> **Este módulo está actualmente en desarrollo (Etapa 3).**

Cuando esté disponible, ofrecerá las siguientes funcionalidades:

| Función | Descripción |
|---------|-------------|
| **Telemetría** | Posición y estado del robot en tiempo real |
| **Control manual** | Envío de comandos directos al robot |
| **Mapa en vivo** | Visualización de las trayectorias del robot |
| **Estadísticas** | Rendimiento y número de ciclos completados |

---

## 9. Gestión de Usuarios (Solo Super Admin)

**Acceso:** Solo Super Admin → opción **Usuarios** en el menú lateral.

Este módulo permite crear y eliminar cuentas de acceso al sistema.

---

### Crear un nuevo usuario

**1.** En el panel izquierdo **"Nuevo Usuario"**, complete el formulario:

| Campo | Descripción |
|-------|-------------|
| **Nombre completo** | Nombre real del usuario (ej: Juan Pérez) |
| **Nombre de usuario** | Identificador para iniciar sesión (sin espacios, se convierte automáticamente a minúsculas) |
| **Contraseña** | Mínimo 6 caracteres. Use el ícono 👁️ para verificar lo que escribe |
| **Confirmar contraseña** | Debe coincidir exactamente con la contraseña ingresada |
| **Rol del usuario** | Seleccione uno de los tres roles (ver tabla de roles) |

**2.** Seleccione el rol haciendo clic en uno de los tres botones:
   - 🔴 **Super Admin** — acceso total al sistema
   - 🟡 **Admin** — supervisión y métricas
   - 🟢 **Operario** — operación del almacén

**3.** Haga clic en **CREAR USUARIO**.

**4.** Si todo es correcto, aparecerá un mensaje verde de confirmación y el formulario se limpiará. El nuevo usuario aparecerá inmediatamente en la lista y podrá iniciar sesión.

**Errores posibles:**

| Error | Causa |
|-------|-------|
| *"El nombre es requerido"* | El campo Nombre completo está vacío |
| *"Sin espacios en el usuario"* | El nombre de usuario contiene espacios |
| *"Mínimo 6 caracteres"* | La contraseña es muy corta |
| *"Las contraseñas no coinciden"* | Los campos Contraseña y Confirmar no son iguales |
| *"El nombre de usuario ya existe"* | Ya hay un usuario registrado con ese username |

---

### Ver y filtrar usuarios

El panel derecho muestra todos los usuarios registrados.

**Filtrar por rol:** use los botones en la parte superior:
- **Todos** — muestra todos los usuarios
- **Super Admin** — filtra solo superadmins
- **Admin** — filtra solo administradores
- **Operario** — filtra solo operarios

Cada botón muestra entre paréntesis cuántos usuarios hay en esa categoría.

**Indicador de sesión activa:** el usuario que está conectado en este momento aparece con el badge verde **"● Sesión activa"**.

---

### Ver contraseña de un usuario

Haga clic en el ícono 👁️ en la tarjeta del usuario para mostrar u ocultar su contraseña.

---

### Eliminar un usuario

**1.** Localice el usuario en la lista.

**2.** Haga clic en el ícono 🗑️ (aparece en rojo al pasar el cursor).

**3.** El sistema pedirá confirmación. Haga clic en **Confirmar** para eliminar o **Cancelar** para cancelar.

> **Importante:** No es posible eliminar su propio usuario mientras esté con la sesión iniciada. El botón de eliminar no aparece para el usuario activo.

---

## 10. Cerrar sesión

Para cerrar la sesión de forma segura:

1. Haga clic en el botón **Cerrar sesión** ubicado en la esquina superior derecha de la barra azul
2. El sistema lo llevará de vuelta a la pantalla de inicio de sesión
3. La sesión se cierra inmediatamente y no podrá acceder al sistema sin volver a ingresar sus credenciales

> **Nota de seguridad:** La sesión también se cierra automáticamente si cierra la pestaña del navegador.

---

## 11. Roles y permisos

### ¿Qué puede hacer cada rol?

| Módulo | Operario | Admin | Super Admin |
|--------|:--------:|:-----:|:-----------:|
| Dashboard (vista operativa) | ✓ | — | — |
| Dashboard (vista de gestión) | — | ✓ | — |
| Dashboard (vista técnica completa) | — | — | ✓ |
| Dispensa | ✓ | — | ✓ |
| Recepción | ✓ | — | ✓ |
| Inventario / Almacenamiento | ✓ | ✓ | ✓ |
| Robots | ✓ | ✓ | ✓ |
| Gestión de Usuarios | — | — | ✓ |

### Identificación visual por rol

Al ingresar al sistema, el badge en la barra superior indica su rol con un color específico:

| Rol | Color del badge | Texto |
|-----|----------------|-------|
| Super Admin | Rojo burdeos `#AD3333` | SUPER ADMIN |
| Admin | Amarillo `#D48B00` | ADMIN |
| Operario | Verde `#1A9E5A` | OPERADOR |

---

## 12. Preguntas frecuentes

**¿Puedo usar el sistema desde el celular?**
La interfaz está optimizada para pantallas de escritorio. En pantallas pequeñas algunos elementos pueden no verse correctamente.

**¿Los datos del inventario se actualizan solos?**
Sí. Los módulos de Almacenamiento y Dispensa obtienen los datos del servidor al abrirlos. El reloj del Dashboard se actualiza cada segundo.

**¿Qué pasa si el sistema muestra "Error al conectar"?**
Significa que no hay conexión con el servidor backend. Contacte al administrador del sistema para verificar el estado del servidor.

**¿Puedo tener dos sesiones abiertas al mismo tiempo?**
Cada pestaña del navegador mantiene su propia sesión. Sin embargo, se recomienda trabajar con una sola sesión activa para evitar inconsistencias.

**¿Los usuarios que creo desaparecen si recargo la página?**
No. Los usuarios se guardan localmente en el navegador (localStorage). Permanecen aunque recargue la página o cierre y vuelva a abrir el navegador en el mismo computador.

**¿Cómo sé quién está conectado actualmente?**
El Super Admin puede ver desde el Dashboard (sección "Gestión de Usuarios") qué usuario tiene sesión activa, marcado con el badge "● Activo".

**Olvidé mi contraseña, ¿qué hago?**
Contacte al Super Administrador del sistema para que le asigne una nueva contraseña desde el módulo de Gestión de Usuarios.

---

*Manual de Usuario v2.0 · AS/RS Sistema de Gestión de Almacén · Universidad de Pamplona · Grupo Frontend/HMI*
