# Spec 002 - Seguridad y Supabase Hardening

Estado: Aprobada para implementación

## Contexto

SASE-310 ya tiene una base SDD y un canon brownfield. El siguiente riesgo material del sistema está en la capa de seguridad operativa: RLS, tablas sensibles, auditoría, aprobación de personal, endpoints privilegiados y configuración local/server-side.

La prioridad de esta fase es cerrar exposiciones conocidas y mover las operaciones sensibles a caminos correctos de servidor o edge, sin introducir regresiones funcionales en registro, onboarding y operación institucional.

## Problema

Hoy existen fallas verificadas de seguridad y consistencia que vuelven frágil la evolución del sistema:

- `solicitudes_alta_personal` tiene una policy `SELECT` abierta a `anon`.
- `audit_log` tuvo o mantiene políticas históricas contradictorias y demasiado permisivas.
- `AprobacionesPersonal.tsx` intenta crear perfiles con IDs simulados incompatibles con `auth.users`.
- El flujo de aprobación vive parcialmente en cliente cuando debería vivir en edge/server.
- `api/notifications/whatsapp.ts` valida sesión, pero no rol institucional, y registra auditoría con columna equivocada.
- `.env.example` y `supabase/config.toml` no reflejan bien el entorno real.
- Existen diferencias de vocabulario y estado (`APROBADO` vs `APROBADA`) que pueden romper flujo y trazabilidad.

## Objetivos

- Cerrar la sobreexposición de datos sensibles en Supabase.
- Consolidar reglas de auditoría y defensa en profundidad en tablas críticas.
- Sacar la aprobación de personal del cliente y moverla a edge/server.
- Corregir endpoints server-side sensibles para que apliquen autorización por rol real.
- Alinear entorno local y documentación mínima para que desarrollo y QA no fallen por configuración incoherente.

## No objetivos

- No rediseñar toda la arquitectura de roles institucionales en una sola fase.
- No resolver todavía la consolidación completa de workflows GitHub.
- No integrar aún TestSprite ni QA E2E.
- No eliminar todavía `profiles`; solo asegurar que el flujo principal use `perfiles_usuario` correctamente.

## Usuarios afectados

- Dirección y subdirección que aprueban o invitan personal.
- Personal que solicita alta institucional.
- Usuarios autenticados que disparan notificaciones sensibles.
- Mantenedores que ejecutan migraciones, reseteos locales y validaciones de seguridad.

## Requisitos funcionales

- FR-001: La tabla `solicitudes_alta_personal` no debe permitir `SELECT` abierto a `anon` o `authenticated` sin restricción institucional explícita.
- FR-002: `audit_log` y `auditoria` no deben aceptar inserciones abiertas a `anon` salvo un caso de negocio explícito, mínimo y auditado; en esta fase se debe cerrar el caso inseguro detectado.
- FR-003: Debe existir un flujo server-side o edge para aprobar solicitudes de alta y materializar el usuario real en `auth.users` y su perfil en `perfiles_usuario` con UUID válido.
- FR-004: `src/components/AprobacionesPersonal.tsx` debe dejar de crear perfiles con IDs simulados y debe consumir el flujo aprobado de servidor.
- FR-005: `api/notifications/whatsapp.ts` debe validar el rol institucional del usuario autenticado antes de procesar el envío.
- FR-006: `api/notifications/whatsapp.ts` debe registrar auditoría usando el schema real de `auditoria`.
- FR-007: El vocabulario de estados de `solicitudes_alta_personal` debe quedar normalizado y consistente entre SQL, frontend y seeds.
- FR-008: `.env.example` debe reflejar el puerto local real y las variables server-side mínimas que el repositorio ya usa.
- FR-009: `supabase/config.toml` debe apuntar al seed real del repositorio o dejar explícita la ausencia de seed compatible.
- FR-010: Todo cambio de esta fase debe quedar respaldado por migración trazable y guía de validación en `quickstart.md`.

## Escenarios de aceptación

### Escenario 1: Registro público de personal

Dado que una persona llena el flujo de `RegistroPersonal`,
cuando envía su solicitud,
entonces la inserción debe seguir funcionando,
pero nadie anónimo debe poder leer solicitudes completas ajenas después.

### Escenario 2: Aprobación institucional correcta

Dado que un usuario con rol permitido aprueba una solicitud,
cuando confirma el alta,
entonces el sistema debe crear o invitar al usuario real en Auth,
persistir el perfil con UUID válido,
y actualizar la solicitud con estado canónico y metadatos consistentes.

### Escenario 3: Notificación sensible

Dado que un usuario autenticado intenta usar `/api/notifications/whatsapp`,
cuando su rol no está autorizado,
entonces el endpoint debe rechazar la operación.

### Escenario 4: Desarrollo local coherente

Dado que un desarrollador configura el proyecto con `.env.example`,
cuando prueba endpoints locales de `api/` o edge functions,
entonces no debe fallar por un `ALLOWED_ORIGINS` desalineado con el puerto real.

## Criterios de éxito

- Se elimina la lectura pública de `solicitudes_alta_personal`.
- El flujo de aprobación deja de depender de IDs falsos en cliente.
- `whatsapp.ts` aplica autorización por rol y auditoría válida.
- El entorno local mínimo queda alineado con el comportamiento real del repo.
- Existe validación reproducible para confirmar que no se rompió registro ni aprobación.
