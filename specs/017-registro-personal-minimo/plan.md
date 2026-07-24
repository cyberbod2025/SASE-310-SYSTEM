# Plan

Estado: implementación y validación estática completadas; validación local de
PostgreSQL pendiente.

## Fase 1 — Minimización

- Retirar secretos y datos redundantes del estado, interfaz y payload.
- Añadir correo institucional visible y validado.
- Corregir mensajes de proceso, aprobación y privacidad.

## Fase 2 — Persistencia

- Crear un servicio tipado para validar nómina y enviar la solicitud mínima.
- Generar un folio de referencia no secuencial.
- Mantener la matrícula institucional bajo autoridad de la base de datos.
- Persistir mediante un endpoint limitado y una RPC exclusiva de
  `service_role` que vuelva a validar la nómina.

## Fase 3 — Servidor y base

- Consultar la nómina por índice y devolver solo coincidencia y rol.
- Limpiar secretos legados conocidos.
- Prohibir claves sensibles en `metadata`.
- Reforzar el dominio institucional en la política de inserción.
- Revocar la inserción directa y derivar rol y folio en PostgreSQL.

## Fase 4 — Verificación

- Añadir pruebas de servicio, interfaz, API e invariantes SQL.
- Buscar secretos y afirmaciones engañosas residuales.
- Ejecutar lint, type-check, suite, build y diff.
- Auditar migraciones y validar PostgreSQL local cuando esté disponible.
