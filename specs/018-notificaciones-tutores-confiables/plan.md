# Plan

## Fase 1 — Autoridad institucional

- Validar sesión, cuenta activa, seguridad activa y rol canónico.
- Derivar incidencia, alumno y teléfono desde PostgreSQL.
- Reducir el payload público a `incidentId`.

## Fase 2 — Memoria de entrega

- Crear tabla RLS de intentos de WhatsApp.
- Crear RPC de inicio y resolución exclusivas de `service_role`.
- Auditar cada resolución con actor, propósito, incidencia y alumno.

## Fase 3 — Semántica honesta

- Separar `delivered` de `simulated`.
- No marcar incidencias ante simulación o fallo.
- Retirar el envío externo automático de escaladas.
- Actualizar la interfaz únicamente tras confirmación real.

## Fase 4 — Verificación

- Añadir pruebas de servicio, interfaz, endpoint y SQL.
- Empaquetar el handler.
- Ejecutar lint, type-check, suite, build y diff.
- Auditar migraciones y validar PostgreSQL local si está disponible.
