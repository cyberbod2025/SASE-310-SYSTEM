# Plan

## Fase 1 — Cerrar acceso público

- Exigir origen permitido, método POST y token válido.
- Resolver el perfil desde `perfiles_usuario`.
- Exigir cuenta y seguridad activas, además de rol autorizado.
- Añadir rate limit por identidad e IP.

## Fase 2 — Minimizar datos y autoridad

- Validar un cuerpo cerrado con `cycleId` y `purpose`.
- Consultar solo el ciclo activo, grupos y campos mínimos del alumno.
- Mantener la operación como propuesta de solo lectura.
- Hacer determinista la distribución.

## Fase 3 — Trazabilidad y semántica honesta

- Registrar la consulta en `auditoria` con actor y propósito.
- No exponer errores internos.
- Marcar la respuesta como propuesta que requiere aprobación humana.

## Fase 4 — Verificación

- Añadir pruebas del handler y de invariantes de seguridad.
- Empaquetar el endpoint.
- Ejecutar type-check, lint, suite, build y `git diff --check`.
- Documentar que no hubo validación contra Supabase real.
