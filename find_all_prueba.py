import json

log_path = r"C:\Users\DELL\.gemini\antigravity\brain\4be66572-89b5-44a1-b040-4146ef56ed57\.system_generated\logs\transcript.jsonl"

try:
    with open(log_path, "r", encoding="utf-8") as f:
        for idx, line in enumerate(f, 1):
            if "prueba" in line.lower():
                print(f"Línea {idx} | Longitud: {len(line)} | Contiene 'prueba'")
                try:
                    data = json.loads(line)
                    print(f"  -> Step Index: {data.get('step_index')}, Type: {data.get('type')}, Source: {data.get('source')}")
                except:
                    pass
except Exception as e:
    print(f"Error: {e}")
