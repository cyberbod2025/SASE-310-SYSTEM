# Plan

## Fase 1 — Contrato de datos

- Añadir propósito, alumno y origen estructurados a `auditoria`.
- Crear índices para lectura temporal y filtros institucionales.
- Mantener compatibilidad con eventos legados.

## Fase 2 — Escritura segura

- Crear RPC que derive actor, correo y rol desde la sesión.
- Validar campos y longitud.
- Revocar escritura directa del cliente.

## Fase 3 — Consulta segura

- Crear RPC paginada y filtrable.
- Restringir a roles de supervisión activos.
- Excluir payloads sensibles.
- Auditar la propia consulta.

## Fase 4 — Cliente

- Añadir servicio tipado y fail-closed.
- Migrar `useAuditLogic` y escrituras directas.
- Sustituir la pantalla por datos reales y exportación CSV.
- Retirar la consulta a `audit_log`.

## Fase 5 — Verificación

- Pruebas de servicio, interfaz e invariantes SQL.
- Búsqueda final de accesos directos del cliente.
- Lint, type-check, suite, build y diff.
- Auditoría de migraciones y Postgres local cuando esté disponible.
