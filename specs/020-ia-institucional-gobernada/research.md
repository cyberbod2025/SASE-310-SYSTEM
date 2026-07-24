# Investigación

## Hallazgos

- Gemini y OpenRouter solo comprueban que el token pertenezca a un usuario Auth.
- Ambos aceptan `prompt` y `model`; no existe propósito ni clasificación del uso.
- Los fallos externos se devuelven con el mensaje crudo del proveedor.
- El rate limit usa únicamente dirección de red.
- No existe auditoría de uso de IA.
- `routeAI` envía consultas libres de Sasito a OpenRouter.
- `AIClient` agrega `JSON.stringify(request.context)` al prompt.
- `guards.ts` solo bloquea tarjetas y un marcador `@@@`; el comentario lo reconoce
  como simulado.
- El expediente envía nombre, grupo, descripciones de incidencias y folios.
- El generador de documentos directo no agrega token.
- Los servicios de redacción sí agregan token, pero no propósito ni contexto.

## Decisiones

- Mantener los dos proveedores, pero hacer que compartan una puerta server-side.
- No persistir prompts ni respuestas en auditoría.
- Rechazar identificadores obvios en servidor; el control del navegador solo es una
  defensa adicional.
- No intentar anonimizar expedientes libres de forma heurística: retirar esa salida
  externa y usar una síntesis local verificable.
- Mantener `routeAI` para el asistente, pero sin serializar contexto y con propósito
  explícito.
- Conservar el servicio de redacción general gobernado, pero generar localmente los
  documentos de caso que incorporan datos escolares.
- Tratar toda salida de IA como borrador y no como decisión.
