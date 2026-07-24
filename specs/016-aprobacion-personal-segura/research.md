# Investigación

## Hallazgos

- `AprobacionesPersonal` invoca `create-user`, calcula permisos e inserta el
  perfil desde el navegador.
- En desarrollo, un fallo de `create-user` genera un ID `sim-*` y continúa.
- Los errores al insertar el perfil se registran en consola, pero el flujo
  sigue y puede marcar la solicitud como aprobada.
- Aprobar y rechazar actualizan `solicitudes_alta_personal` directamente.
- `approve-staff` ya verifica el JWT y usa `service_role`, pero acepta el rol
  desde `profiles` cuando no encuentra `perfiles_usuario`.
- La consulta actual del perfil aprobador no comprueba `estado_cuenta` ni
  `seguridad_status`.
- La función Edge actualiza Auth, perfil, solicitud y auditoría en operaciones
  independientes.
- La matriz frontend concede `can_approve_staff` a Subdirección, pero el router
  no permite abrir el módulo.
- Las políticas históricas de solicitudes se superponen y no aplican de forma
  uniforme el estado activo y seguro.

## Decisiones

- Conservar `approve-staff` como endpoint canónico.
- Añadir una acción explícita `aprobar` o `rechazar` al mismo endpoint.
- Usar RPC públicas no expuestas a clientes mediante revocación total y
  concesión exclusiva a `service_role`.
- Bloquear la fila de solicitud durante la resolución.
- Derivar rol, permisos, aprobador y marcas de tiempo en PostgreSQL.
- Registrar auditoría dentro de la transacción.
- Mantener Auth fuera de la transacción SQL, pero eliminar una invitación nueva
  si la operación institucional no confirma.
- No usar `profiles` para autorizar.
