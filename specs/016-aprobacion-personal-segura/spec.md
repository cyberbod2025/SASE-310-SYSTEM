# Especificación 016 — Aprobación segura de personal

Estado: Implementada y validada estáticamente; aplicación y despliegue pendientes

## Problema

La pantalla de aprobación de personal divide una decisión institucional en
varias operaciones desde el navegador:

- crea un usuario mediante `create-user`;
- inventa un usuario `sim-*` si la función falla en desarrollo;
- inserta directamente el perfil institucional;
- absorbe errores de creación de perfil;
- actualiza directamente el estado de la solicitud;
- calcula permisos en el cliente;
- registra auditoría en una operación separada.

La función canónica `approve-staff` existe, pero permite resolver al aprobador
desde `profiles` legado y no exige que `perfiles_usuario` esté activo y sin
restricciones de seguridad.

El resultado puede ser un alta parcial, una aprobación simulada o una decisión
atribuida a un rol que no es la autoridad institucional vigente.

## Objetivo

Concentrar la aprobación y el rechazo en el flujo canónico server-side para que:

- el navegador solo envíe la decisión y la asignación académica;
- la identidad y autorización del aprobador se deriven de la sesión;
- únicamente perfiles institucionales activos y seguros puedan resolver;
- el rol y los permisos finales se deriven de la solicitud en servidor;
- perfil, solicitud y auditoría se confirmen en una sola transacción de base de
  datos;
- una invitación Auth nueva se compense si la transacción institucional falla;
- no exista modo simulado ni escritura directa de aprobación desde el cliente.

## Reglas

- `perfiles_usuario` es la única autoridad para autorizar al aprobador.
- El aprobador debe tener `estado_cuenta = 'activo'` y
  `seguridad_status = 'active'`.
- Los roles autorizados son Dirección, Subdirección, Desarrollo y
  Administración del Sistema.
- Las cuentas técnicas `developer` y `system_admin` no se conceden mediante una
  solicitud pública de alta.
- `profiles` no puede habilitar una aprobación.
- La solicitud debe estar en `PENDIENTE` u `OBSERVACIONES`.
- El cliente no decide el usuario Auth, el rol primario, los roles aprobados,
  los permisos, el aprobador ni la fecha.
- El rechazo requiere un motivo documentado.
- La auditoría se escribe dentro de la misma transacción que la resolución.
- `anon` y `authenticated` no pueden actualizar ni eliminar solicitudes
  directamente.
- Las solicitudes nuevas siguen pudiendo registrarse en estado pendiente.
- Un error del endpoint no se transforma en aprobación local.

## Criterios de aceptación

- `AprobacionesPersonal` invoca exclusivamente `approve-staff` para aprobar o
  rechazar.
- No hay referencias a `create-user`, IDs `sim-*`, inserciones directas en
  `perfiles_usuario` ni actualizaciones directas de solicitudes en esa pantalla.
- `approve-staff` falla cerrado si no existe un perfil institucional activo y
  seguro.
- El endpoint no usa `profiles` para autorizar.
- Existe una RPC transaccional de aprobación accesible solo para
  `service_role`.
- Existe una RPC transaccional de rechazo accesible solo para `service_role`.
- La aprobación deriva roles y permisos en servidor.
- El alta Auth recién invitada se elimina si la transacción de aprobación
  falla.
- Subdirección puede abrir la pantalla conforme a la matriz de permisos.
- Existen pruebas del servicio frontend, la pantalla, la función Edge y las
  invariantes SQL.

## Fuera de alcance

- Sustituir en esta vertical el registro inicial de solicitudes.
- Rediseñar la recuperación de contraseña o las preguntas de seguridad.
- Desplegar la función Edge o aplicar la migración en un proyecto hospedado.
- Garantizar entrega del correo de invitación.

## Estado de validación

Implementación y verificación local sin base de datos completadas:

- pruebas focalizadas: cuatro archivos y quince pruebas correctas;
- suite completa: cuarenta y dos archivos y doscientas siete pruebas correctas;
- `pnpm type-check`: correcto;
- `pnpm lint`: cero errores y cinco advertencias preexistentes;
- `pnpm build`: correcto, con advertencias preexistentes de división de módulos
  y tamaño de chunks;
- análisis sintáctico de `approve-staff` con esbuild: correcto;
- `git diff --check`: correcto; Git solo informó conversión de finales de línea;
- `scripts/audit-migrations.sh`: correcto al ejecutarse con Git Bash.

No se declara la migración aplicada, lintada por PostgreSQL ni la función Edge
desplegada. `supabase db start` no encontró el motor de Docker;
`supabase db lint --local` no pudo conectar y
`supabase migration list --local` recibió rechazo en `127.0.0.1:54322`.
