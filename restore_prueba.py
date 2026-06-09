import json
import re

log_path = r"C:\Users\DELL\.gemini\antigravity\brain\4be66572-89b5-44a1-b040-4146ef56ed57\.system_generated\logs\transcript.jsonl"
output_path = r"D:\Desktop\prueba (1).py"

print("Iniciando restauración definitiva de prueba (1).py...")

found_lines = {}
found_any = False

try:
    with open(log_path, "r", encoding="utf-8") as f:
        for line_num, raw_line in enumerate(f, 1):
            # Buscamos un paso que contenga obligatoriamente la primera y la última línea numerada
            if "1: import os" in raw_line and "489:" in raw_line:
                print(f"¡Bloque de código original localizado en el log (línea {line_num})!")
                try:
                    data = json.loads(raw_line)
                    
                    # Buscamos recursivamente el texto que contiene el archivo crudo
                    def find_raw_file(obj):
                        if isinstance(obj, str) and "1: import os" in obj and "489:" in obj:
                            return obj
                        if isinstance(obj, dict):
                            for k, v in obj.items():
                                res = find_raw_file(v)
                                if res:
                                    return res
                        if isinstance(obj, list):
                            for item in obj:
                                res = find_raw_file(item)
                                if res:
                                    return res
                        return None
                    
                    file_text = find_raw_file(data)
                    if file_text:
                        print("¡Bloque de texto del archivo extraído!")
                        
                        # Dividir en líneas por salto de línea
                        lines = re.split(r'\r\n|\n|\\n', file_text)
                        print(f"Dividido en {len(lines)} líneas de texto en bruto.")
                        
                        for l in lines:
                            # Hacer match del formato "Número: Contenido"
                            match = re.match(r"^(\d+):\s*(.*)$", l.strip())
                            if match:
                                num = int(match.group(1))
                                code = match.group(2)
                                # Limpiar escapes JSON
                                code = code.replace('\\"', '"').replace('\\\\', '\\').replace('\\t', '\t').replace('\\/', '/')
                                found_lines[num] = code
                        
                        if len(found_lines) >= 480:
                            print(f"¡Éxito! Se recuperaron {len(found_lines)} líneas.")
                            found_any = True
                            break
                        else:
                            print(f"Advertencia: Solo se obtuvieron {len(found_lines)} líneas de este bloque.")
                except Exception as e:
                    print(f"Error parseando JSON en paso {line_num}: {e}")

    if found_any:
        # Reconstruir el código del 1 al 489
        reconstructed_code = []
        for i in range(1, 490):
            line_content = found_lines.get(i, "")
            reconstructed_code.append(line_content)
            
        full_code = "\n".join(reconstructed_code)
        
        # Aplicamos las correcciones necesarias para usar Iriun en Windows MSMF (índice 1 por defecto)
        full_code = full_code.replace("c = cv2.VideoCapture(indice, cv2.CAP_DSHOW)", "c = cv2.VideoCapture(indice)")
        
        if "INDICE_CAMARA" not in full_code:
            old_cam = """def encontrar_camara():
    for indice in range(0, 5):         # prueba índices 0, 1, 2, 3, 4
        c = cv2.VideoCapture(indice)
        if c.isOpened():
            ok, _ = c.read()
            if ok:
                print(f"[CAMARA] Encontrada en índice {indice}")
                return c, indice
            c.release()
    return None, -1

cap, indice_camara = encontrar_camara()"""

            new_cam = """# =================================
# SELECCIÓN DE CÁMARA
# Si deseas usar una cámara en particular, cambia "auto" por el índice (ej: 0 para laptop, 1 para celular)
# =================================
INDICE_CAMARA = 1  # 1 suele ser Iriun Webcam (celular) y 0 la integrada de la laptop

def encontrar_camara(preferido):
    if preferido != "auto":
        c = cv2.VideoCapture(preferido)
        if c.isOpened():
            ok, _ = c.read()
            if ok:
                print(f"[CAMARA] Abriendo cámara seleccionada en índice {preferido}")
                return c, preferido
            c.release()
        print(f"[CAMARA] Advertencia: No se pudo abrir el índice preferido {preferido}. Buscando automáticamente...")

    for indice in range(0, 5):         # prueba índices 0, 1, 2, 3, 4
        c = cv2.VideoCapture(indice)
        if c.isOpened():
            ok, _ = c.read()
            if ok:
                print(f"[CAMARA] Encontrada automáticamente en índice {indice}")
                return c, indice
            c.release()
    return None, -1

cap, indice_camara = encontrar_camara(INDICE_CAMARA)"""
            full_code = full_code.replace(old_cam, new_cam)
            
        with open(output_path, "w", encoding="utf-8") as out:
            out.write(full_code)
            
        print(f"\n¡RESTAURACIÓN COMPLETADA CON ÉXITO! 🎉")
        print(f"El archivo ha sido recreado en tu escritorio:\n👉 {output_path}")
        print("\nYa puedes abrir tu terminal y ejecutarlo usando:")
        print('python "D:\\Desktop\\prueba (1).py"')
    else:
        print("\n[ERROR] No pudimos extraer las líneas correctas del log. Verifica que el log esté intacto.")
        
except Exception as e:
    print(f"Error general en la restauración: {e}")
