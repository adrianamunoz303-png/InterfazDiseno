# Registro 01: Configuración de Red Local y CORS

## 🎯 Objetivo
Permitir que otros dispositivos (como celulares u otras PCs) conectados a la misma red Wi-Fi puedan acceder al sistema (Frontend) y comunicarse correctamente con el servidor (Backend).

## 🛠️ ¿Qué modificamos?

1. **Exponer el Backend a la red:**
   * Cambiamos el comando de arranque a: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
   * El parámetro `--host 0.0.0.0` le indica al servidor que deje de escuchar solo internamente (`localhost`) y comience a aceptar peticiones externas.

2. **Apuntar el Frontend a la IP correcta (.env):**
   * Modificamos el archivo `.env` del Frontend para cambiar `localhost` por la IP local de la máquina anfitriona (ej. `192.168.101.9`).
   * Quitamos los `#` (que indicaban que la línea era un comentario ignorado) para que React cargara las variables reales:
     ```env
     REACT_APP_API_URL=http://192.168.101.9:8000
     REACT_APP_WS_URL=ws://192.168.101.9:8000/ws/telemetry
     ```

3. **Configuración de CORS en el Backend (main.py):**
   * Añadimos la URL exacta de nuestro frontend en red (`http://192.168.101.9:3000`) a la lista `allow_origins` de `CORSMiddleware`.

---

## 🧠 Conceptos Aprendidos

### 1. El comando `ipconfig`
* **¿Qué es?:** Es un comando de la terminal de Windows (IP Configuration).
* **¿Para qué sirve?:** Muestra toda la configuración de las tarjetas de red de tu computadora. 
* **¿Cómo lo usamos?:** Al ejecutarlo, buscamos el adaptador que nos da internet (por ejemplo, "Adaptador de LAN inalámbrica Wi-Fi") y leemos la **Dirección IPv4**. Esta es la dirección que el router le asignó a tu computadora en tu casa (ej. 192.168.101.9), como si fuera el número de tu casa dentro de un barrio cerrado.

### 2. CORS (Cross-Origin Resource Sharing)
* **El Problema:** Por defecto, los navegadores web por seguridad impiden que una página web haga peticiones a un servidor que esté en una dirección distinta a la suya.
* **La Solución:** CORS es la política del lado del **Backend**. Es como el "portero de la discoteca" que tiene una lista de invitados VIP (`allow_origins`). 
* **El Funcionamiento:** Cuando el celular intenta hacer Login, el navegador manda una petición de prueba llamada "Preflight" diciendo: *"Hola, soy la página http://192.168.101.9:3000, ¿me dejas pasar?"*. Si esa URL está en la lista de `allow_origins`, el backend responde *"Sí, adelante"*, y la comunicación ocurre. Si no está, el navegador del celular bloquea el acceso y muestra un error de red.

### 3. El archivo `.env` y el Caché
* El archivo `.env` guarda variables de entorno. 
* **Regla de oro:** React empaqueta estas variables **solo cuando se inicia**. Si modificas el archivo `.env` mientras el servidor frontend está corriendo, los cambios no tendrán efecto hasta que detengas el servidor (`Ctrl+C`) y lo vuelvas a iniciar (`npm start`).
* El símbolo `#` al inicio de una línea en estos archivos la convierte en un comentario.
