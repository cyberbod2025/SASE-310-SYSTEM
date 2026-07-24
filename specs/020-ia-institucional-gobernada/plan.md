# Plan

## Fase 1 — Puerta común de seguridad

- Crear autorización server-side compartida.
- Validar perfil canónico, rol, payload, propósito y contexto.
- Aplicar rate limit por identidad e IP.
- Rechazar identificadores personales frecuentes.

## Fase 2 — Proveedores trazables

- Endurecer Gemini y OpenRouter con la puerta común.
- Auditar solicitud y resolución sin contenido.
- Devolver errores seguros y validar respuestas.

## Fase 3 — Clientes honestos

- Enviar autenticación, propósito y contexto desde todos los clientes.
- Eliminar selección de modelos obsoletos y contexto serializado.
- Sustituir el guardrail simulado por controles deterministas.
- Mantener la redacción general autorizada como borrador revisable.
- Generar localmente los documentos de caso que contienen datos escolares.

## Fase 4 — Expedientes protegidos

- Retirar la transferencia externa de expedientes.
- Generar una síntesis local descriptiva basada en hechos y conteos.
- Actualizar copy y trazabilidad para no llamarla análisis de IA.

## Fase 5 — Verificación

- Añadir pruebas focales y de invariantes.
- Empaquetar ambos handlers.
- Ejecutar type-check, lint, suite, build y `git diff --check`.
- Documentar la ausencia de una prueba con proveedores o Supabase reales.
