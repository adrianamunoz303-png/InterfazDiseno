import os
import threading
import time
import json
# from ultralytics import YOLO
import cv2
import paho.mqtt.client as mqtt
from flask import Flask, Response, render_template_string

# --- CONFIGURACIÓN DE RUTAS Y MODELO (Desactivado para pruebas locales) ---
# model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "RED_NEURONAL", "best.pt")
# print("Cargando cerebro personalizado del AGV...")
# model = YOLO(model_path)

# =================================
# CONFIG MQTT
# =================================
BROKER  = "broker.emqx.io"
PUERTO  = 1883
ID_AGV  = "AGV_01"

TOPIC_POSICION = f"wms/agv/{ID_AGV}/posicion"
TOPIC_ALERTA   = "wms/sistema/alerta"

mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

def on_connect_pub(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print(f"[MQTT] Conectado al broker {BROKER}")
    else:
        print(f"[MQTT] Error de conexion: {rc}")

mqtt_client.on_connect = on_connect_pub

MQTT_ACTIVO = False
try:
    mqtt_client.connect(BROKER, PUERTO, 5)   # timeout corto: 5s
    mqtt_client.loop_start()
    MQTT_ACTIVO = True
except Exception as e:
    print(f"[MQTT] No se pudo conectar: {e}")
    print("[MQTT] Continuando sin MQTT — solo web y consola")

def publicar_posicion(ubicacion, coordenadas, destino, instruccion, visto):
    if not MQTT_ACTIVO:
        return
    payload = {
        "ubicacion":   ubicacion,
        "coordenadas": list(coordenadas),
        "destino":     destino,
        "instruccion": instruccion,
        "visto":       visto,
        "timestamp":   time.strftime("%Y-%m-%d %H:%M:%S")
    }
    mqtt_client.publish(TOPIC_POSICION, json.dumps(payload))
    if not visto:
        mqtt_client.publish(TOPIC_ALERTA, json.dumps({
            "tipo": "AGV_PERDIDO",
            "agv":  ID_AGV,
            "timestamp": payload["timestamp"]
        }))

# =================================
# VARIABLES GLOBALES DE CONTROL
# =================================
destino_agv       = "Ninguno"
ubicacion_actual  = "Desconocida"
coordenadas_actuales = (0, 0)
ultima_impresion  = 0
visto_ahora       = False
instruccion_actual = "ESPERANDO DESTINO..."
centro_x, centro_y = 0, 0

# Frame compartido entre el loop de OpenCV y el servidor Flask
frame_web  = None
lock_frame = threading.Lock()

# =================================
# SERVIDOR WEB FLASK (para el celular)
# =================================
app = Flask(__name__)

PAGINA_HTML = """
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Supervisor AGV</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0d0d0d;
      color: #ffffff;
      font-family: 'Segoe UI', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      gap: 16px;
    }
    h1 {
      font-size: 1.2rem;
      color: #00e5ff;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    img#video {
      width: 100%;
      max-width: 640px;
      border-radius: 10px;
      border: 2px solid #00e5ff;
    }
    .panel {
      width: 100%;
      max-width: 640px;
      background: #1a1a2e;
      border-radius: 10px;
      padding: 16px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .card {
      background: #16213e;
      border-radius: 8px;
      padding: 12px;
      border-left: 4px solid #00e5ff;
    }
    .card.alerta  { border-left-color: #ff1744; }
    .card.ok      { border-left-color: #00e676; }
    .card.warning { border-left-color: #ffea00; }
    .card label {
      font-size: 0.65rem;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .card p {
      font-size: 1rem;
      font-weight: bold;
      margin-top: 4px;
      word-break: break-word;
    }
    .card.full { grid-column: 1 / -1; }
    #dot {
      display: inline-block;
      width: 10px; height: 10px;
      border-radius: 50%;
      margin-right: 6px;
      background: #ff1744;
    }
    #dot.vivo { background: #00e676; animation: pulso 1s infinite; }
    @keyframes pulso {
      0%,100% { opacity: 1; } 50% { opacity: 0.3; }
    }
    #timestamp { font-size: 0.75rem; color: #555; text-align: center; }
  </style>
</head>
<body>
  <h1>&#128065; Supervisor AGV</h1>

  <img id="video" src="/video" alt="Video en vivo">

  <div class="panel">
    <div class="card" id="card-ubicacion">
      <label>Ubicacion</label>
      <p id="ubicacion">--</p>
    </div>
    <div class="card" id="card-destino">
      <label>Destino</label>
      <p id="destino">--</p>
    </div>
    <div class="card" id="card-coords">
      <label>Coordenadas</label>
      <p id="coords">--</p>
    </div>
    <div class="card" id="card-estado">
      <label>Estado camara</label>
      <p><span id="dot"></span><span id="estado-vista">--</span></p>
    </div>
    <div class="card full" id="card-instruccion">
      <label>Instruccion</label>
      <p id="instruccion">--</p>
    </div>
  </div>

  <p id="timestamp">Actualizando...</p>

  <script>
    async function actualizar() {
      try {
        const res  = await fetch('/estado');
        const data = await res.json();

        document.getElementById('ubicacion').textContent   = data.ubicacion;
        document.getElementById('destino').textContent     = data.destino;
        document.getElementById('coords').textContent      = `X=${data.coordenadas[0]}  Y=${data.coordenadas[1]}`;
        document.getElementById('instruccion').textContent = data.instruccion;
        document.getElementById('timestamp').textContent   = 'Actualizado: ' + data.timestamp;

        const dot    = document.getElementById('dot');
        const estado = document.getElementById('estado-vista');
        const cardE  = document.getElementById('card-estado');
        if (data.visto) {
          dot.className = 'vivo';
          estado.textContent = 'EN VIVO';
          cardE.className = 'card ok';
        } else {
          dot.className = '';
          estado.textContent = 'PERDIDO';
          cardE.className = 'card alerta';
        }

        const cardI = document.getElementById('card-instruccion');
        if (data.instruccion.includes('EXITOSA')) {
          cardI.className = 'card full ok';
        } else if (data.instruccion.includes('PERDIDO') || data.instruccion.includes('ALERTA')) {
          cardI.className = 'card full alerta';
        } else {
          cardI.className = 'card full warning';
        }

      } catch (e) {
        document.getElementById('timestamp').textContent = 'Sin conexion con el servidor';
      }
    }

    // Actualiza los datos cada 1 segundo
    setInterval(actualizar, 1000);
    actualizar();
  </script>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(PAGINA_HTML)

@app.route('/estado')
def estado():
    return {
        "ubicacion":   ubicacion_actual,
        "coordenadas": list(coordenadas_actuales),
        "destino":     destino_agv,
        "instruccion": instruccion_actual,
        "visto":       visto_ahora,
        "timestamp":   time.strftime("%H:%M:%S")
    }

def generar_frames():
    """Genera el stream MJPEG que el celular recibe como video."""
    while True:
        with lock_frame:
            if frame_web is None:
                time.sleep(0.05)
                continue
            ret, buffer = cv2.imencode('.jpg', frame_web, [cv2.IMWRITE_JPEG_QUALITY, 70])
            if not ret:
                continue
            frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.04)  # ~25 fps

@app.route('/video')
def video():
    return Response(
        generar_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )

def iniciar_servidor_web():
    # use_reloader=False es obligatorio cuando Flask corre dentro de un hilo
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)

threading.Thread(target=iniciar_servidor_web, daemon=True).start()
print("[WEB] Servidor iniciado en http://0.0.0.0:5000")

# =================================
# ZONAS DEL ALMACEN
# Escala: planta 2000×1500mm → cámara 640×480px (0.32 px/mm)
# =================================
zonas = {
    # Zonas superiores
    "Zona Pits":   ( 85,  15, 340,  95),   # 800mm × 250mm
    "Despacho":    (485,  15, 600,  95),   # 350mm × 250mm
    # Zonas izquierdas
    "Recepcion":   ( 18, 105, 115, 215),   # 300mm × 350mm
    "Banda":       ( 18, 230, 115, 425),   # 300mm × 600mm
    # Nodo central
    "Bifurcacion": (115, 158, 156, 275),   # junction (corredor central)
    # Fila A — almacenes superiores (cada uno 220mm × 250mm)
    "A1": (156, 155, 226, 240),
    "A2": (226, 155, 296, 240),
    "A3": (296, 155, 366, 240),
    "A4": (366, 155, 436, 240),
    "A5": (436, 155, 506, 240),
    # Fila B — almacenes inferiores (misma base x)
    "B1": (156, 276, 226, 361),
    "B2": (226, 276, 296, 361),
    "B3": (296, 276, 366, 361),
    "B4": (366, 276, 436, 361),
    "B5": (436, 276, 506, 361),
}

# =================================
# HILO CONSOLA (destino manual)
# =================================
def leer_consola():
    global destino_agv
    while True:
        nuevo_destino = input("\n>>> Ingrese destino (ej: A2, B5, Zona Pits): ").strip()
        if nuevo_destino in zonas:
            destino_agv = nuevo_destino
            print(f"[SISTEMA] Destino actualizado a: {destino_agv}")
        else:
            print("[ERROR] Destino no reconocido.")

threading.Thread(target=leer_consola, daemon=True).start()

# =================================
# CAMARA — detección automática
# =================================
def encontrar_camara():
    for indice in range(1,4):         # prueba índices 0, 1, 2, 3, 4
        
        c = cv2.VideoCapture(indice)
        if c.isOpened():
            ok, _ = c.read()
            if ok:
                print(f"[CAMARA] Encontrada en índice {indice}")
                return c, indice
            c.release()
    return None, -1

#cap, indice_camara = encontrar_camara()
cap = cv2.VideoCapture(0) # Abre directamente la cámara de Iriun (índice 0)
indice_camara = 0

if cap is None:
    print("[ERROR] No se encontró ninguna cámara disponible.")
    print("        Conecta una cámara y vuelve a ejecutar.")
    input("Presiona Enter para salir...")
    exit()

cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

# Muestra la IP local para que el usuario sepa a qué conectarse
import socket
try:
    ip_local = socket.gethostbyname(socket.gethostname())
except:
    ip_local = "127.0.0.1"
print(f"\n{'='*45}")
print(f"  Abre en tu celular (misma WiFi):")
print(f"  http://{ip_local}:5000")
print(f"{'='*45}\n")
print("SISTEMA OJO DE DIOS ACTIVO")

# =================================
# LOOP PRINCIPAL
# =================================
while cap.isOpened():
    success, frame = cap.read()
    if not success:
        break

    # --- DIBUJAR PLANTA ---

    # 1. Caminos del carro (líneas grises, estilo original)
    cv2.line(frame, (506, 258), ( 18, 258), (128, 128, 128), 3)  # este → oeste
    cv2.line(frame, (135, 258), (135,  88), (128, 128, 128), 3)  # norte (spine)
    cv2.line(frame, (135,  88), (485,  88), (128, 128, 128), 3)  # hacia Despacho

    # 2. Rectángulos de zonas (contorno azul, sin relleno)
    COLOR_ZONA  = (210,  80,  10)   # azul oscuro (BGR)
    COLOR_TEXTO = (210,  80,  10)

    # Tamaño de fuente por tipo de zona
    FUENTE = cv2.FONT_HERSHEY_SIMPLEX

    for nombre, (zx1, zy1, zx2, zy2) in zonas.items():
        cv2.rectangle(frame, (zx1, zy1), (zx2, zy2), COLOR_ZONA, 2)

        ancho = zx2 - zx1
        alto  = zy2 - zy1
        cx    = (zx1 + zx2) // 2
        cy    = (zy1 + zy2) // 2

        # Fuente grande para zonas amplias, pequeña para celdas
        if ancho > 150:                        # Zona Pits, Despacho
            escala, grosor = 0.50, 1
            tw, th = cv2.getTextSize(nombre, FUENTE, escala, grosor)[0]
            cv2.putText(frame, nombre, (cx - tw//2, cy + th//2), FUENTE, escala, COLOR_TEXTO, grosor)

        elif ancho > 80:                       # Recepcion, Banda
            escala, grosor = 0.40, 1
            tw, th = cv2.getTextSize(nombre, FUENTE, escala, grosor)[0]
            cv2.putText(frame, nombre, (cx - tw//2, cy + th//2), FUENTE, escala, COLOR_TEXTO, grosor)

        elif nombre == "Bifurcacion":          # Bifurcacion (estrecha)
            escala, grosor = 0.28, 1
            for i, parte in enumerate(["Bifur", "cacion"]):
                tw, th = cv2.getTextSize(parte, FUENTE, escala, grosor)[0]
                cv2.putText(frame, parte, (cx - tw//2, zy1 + 20 + i*16), FUENTE, escala, COLOR_TEXTO, grosor)

        else:                                  # A1-A5, B1-B5
            escala, grosor = 0.38, 1
            tw, th = cv2.getTextSize(nombre, FUENTE, escala, grosor)[0]
            cv2.putText(frame, nombre, (cx - tw//2, cy + th//2), FUENTE, escala, COLOR_TEXTO, grosor)

    # === SIMULACIÓN DE DETECCIÓN (Se omitió YOLO para pruebas locales) ===
    visto_ahora = True
    import math
    centro_x = int(320 + 200 * math.sin(time.time() * 0.5))
    centro_y = 210  # Fijo en una línea visible
    coordenadas_actuales = (centro_x, centro_y)

    en_cuadro = False
    for nombre_zona, (zx1, zy1, zx2, zy2) in zonas.items():
        if zx1 < centro_x < zx2 and zy1 < centro_y < zy2:
            ubicacion_actual = nombre_zona
            en_cuadro = True
            break
    if not en_cuadro:
        ubicacion_actual = "En Ruta"

    # Dibujar el punto rojo representativo del AGV simulado
    cv2.circle(frame, (centro_x, centro_y), 15, (0, 0, 255), -1)

    # Máquina de estados de navegación
    instruccion_actual = "ESPERANDO DESTINO..."

    if destino_agv != "Ninguno" and visto_ahora:
        meta_x1, meta_y1, meta_x2, meta_y2 = zonas[destino_agv]

        if ubicacion_actual == destino_agv:
            instruccion_actual = "LLEGADA EXITOSA! DETENER MOTORES"

        elif ubicacion_actual == "Bifurcacion":
            if destino_agv in ["Zona Pits", "Despacho"]:
                instruccion_actual = "GIRAR A LA DERECHA (NORTE)"
            elif destino_agv in ["Recepcion", "Banda"]:
                instruccion_actual = "SEGUIR DERECHO (OESTE)"
            else:
                instruccion_actual = "GIRAR HACIA ALMACENES (ESTE)"

        elif ubicacion_actual == "En Ruta":
            if meta_x1 <= centro_x <= meta_x2:
                if "A" in destino_agv:
                    instruccion_actual = f"ALINEADO: GIRAR ARRIBA HACIA {destino_agv}"
                elif "B" in destino_agv:
                    instruccion_actual = f"ALINEADO: GIRAR ABAJO HACIA {destino_agv}"
                else:
                    instruccion_actual = "ALINEADO: ENTRAR A ZONA"
            elif centro_x > meta_x2:
                instruccion_actual = "AVANZAR A LA IZQUIERDA"
            elif centro_x < meta_x1:
                instruccion_actual = "AVANZAR A LA DERECHA"
        else:
            instruccion_actual = "SALIR A LA LINEA PRINCIPAL"

    # Publicar MQTT + consola cada 2 segundos
    if time.time() - ultima_impresion > 2:
        status = "VIVO" if visto_ahora else "PERDIDO"
        print(f"[{status}] {ubicacion_actual} | Destino: {destino_agv} | {coordenadas_actuales}")
        if destino_agv != "Ninguno":
            print(f"   -> {instruccion_actual}")
        publicar_posicion(ubicacion_actual, coordenadas_actuales, destino_agv, instruccion_actual, visto_ahora)
        ultima_impresion = time.time()

    # Overlay en la ventana local
    color_orden = (0, 255, 0) if "EXITOSA" in instruccion_actual else (0, 255, 255)
    cv2.putText(frame, f"DESTINO: {destino_agv}",      (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
    cv2.putText(frame, f"ORDEN: {instruccion_actual}", (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color_orden, 2)
    cv2.imshow("Supervisor AGV - MecaPsi", frame)

    # Guardar frame para el stream web
    with lock_frame:
        frame_web = frame.copy()

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
mqtt_client.loop_stop()
mqtt_client.disconnect()