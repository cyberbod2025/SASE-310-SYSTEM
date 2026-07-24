# Plan

## Fase 1 — Frontera institucional

- Cerrar actualización y eliminación directa de solicitudes.
- Mantener registro pendiente y lectura para supervisión activa.
- Crear operaciones transaccionales de aprobación y rechazo.

## Fase 2 — Función canónica

- Autorizar solo con `perfiles_usuario` activo y seguro.
- Resolver aprobación y rechazo mediante RPC de servicio.
- Compensar invitaciones Auth nuevas cuando falle la transacción.
- Retirar auditoría directa y autorización legacy.

## Fase 3 — Cliente

- Crear un servicio tipado para `approve-staff`.
- Sustituir el flujo fragmentado y el modo simulado.
- Mostrar resultados y errores reales.
- Habilitar la ruta para Subdirección.

## Fase 4 — Verificación

- Añadir pruebas de servicio, interfaz, Edge e invariantes SQL.
- Buscar escrituras directas residuales.
- Ejecutar lint, type-check, suite, build y diff.
- Auditar migraciones y validar PostgreSQL local cuando esté disponible.
