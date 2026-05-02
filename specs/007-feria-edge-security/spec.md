# Spec 007 - Hardening Edge para Feria

## Problema

Feria consume RPCs `SECURITY DEFINER` expuestas a `authenticated`, incluyendo avance y cierre de trivia. Eso deja operaciones sensibles disponibles por `/rest/v1/rpc/*` para cualquier usuario autenticado.

## Objetivo

Interponer Edge Functions como backend seguro antes de revocar accesos directos a RPC legacy.

## Alcance

- Crear `student-login`, `student-progress`, `student-finish-trivia` y `student-progress-get`.
- Validar `sase_token` de handoff y sesiones opacas de estudiante.
- Mover operaciones críticas a funciones internas ejecutables solo por `service_role`.
- Preparar script manual de revocación sin ejecutarlo.

## No Alcance

- No revocar `registrar_progreso_v2` ni `finalizar_trivia_v2` en esta fase.
- No modificar el frontend de Feria externo.
- No cambiar autenticación institucional de SASE.

## Validación

- Las Edge Functions no confían en puntos ni respuestas enviadas por frontend.
- La tabla de sesiones no tiene políticas RLS para clientes.
- Las funciones internas revocan `anon`, `authenticated` y `public`, y conceden solo a `service_role`.
