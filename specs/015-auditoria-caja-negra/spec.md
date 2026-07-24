# Especificación 015 — Auditoría y Caja Negra institucional

Estado: Implementada y validada en frontend; aplicación SQL local pendiente

## Problema

La bitácora activa no demuestra de forma confiable quién hizo qué, cuándo,
sobre qué registro y con qué propósito:

- lee `public.auditoria` directamente desde el cliente;
- permite decidir acceso con metadatos JWT legados;
- deja que el cliente escriba identidad, correo y rol;
- oculta deliberadamente la identidad del rol `developer`;
- inventa la fecha actual cuando un registro no tiene `fecha`;
- infiere alumnos con una expresión regular sobre texto libre;
- absorbe errores de auditoría sin informar que la trazabilidad falló;
- presenta una descarga CSV simulada;
- consulta la tabla eliminada `audit_log` para detectar citatorios previos.

Eso convierte una supuesta Caja Negra en una vista parcial y potencialmente
engañosa.

## Objetivo

Construir una memoria de auditoría mínima y verificable que permita responder:

- quién realizó la acción;
- desde qué rol institucional activo;
- qué acción se realizó;
- cuándo ocurrió;
- sobre qué tabla y registro;
- sobre qué alumno, cuando aplique;
- con qué propósito institucional.

## Reglas

- La identidad, correo y rol se derivan en Postgres; el cliente no los envía.
- Solo perfiles institucionales activos pueden registrar eventos manuales.
- Solo Dirección, Subdirección, Desarrollo y Administración del Sistema activos
  pueden consultar Caja Negra.
- La consulta no devuelve `old_values`, `new_values`, IP ni agente de usuario.
- `public.auditoria` no se consulta ni muta directamente desde `anon` o
  `authenticated`.
- Los clientes autenticados solo acceden mediante RPC explícitas.
- No se inventan fechas, alumnos, responsables ni resultados.
- El servicio devuelve los errores de auditoría; los adaptadores legados los
  muestran de forma visible y no confirman trazabilidad inexistente.
- La exportación CSV se genera realmente desde los datos visibles y registra su
  propósito antes de descargar.
- Caja Negra es append-only para clientes: no existe RPC de actualización ni
  borrado y no hay privilegios directos sobre la tabla.

## Criterios de aceptación

- Existe una RPC de escritura con identidad derivada y autorización fail-closed.
- Existe una RPC de lectura paginada con filtros y autorización fail-closed.
- La tabla conserva RLS y revoca privilegios directos del Data API.
- La pantalla muestra errores, nulos y fechas sin fabricar valores.
- La pantalla permite filtrar por categoría, rol, tabla, fecha y texto.
- La pantalla muestra tabla, registro, alumno, propósito y origen.
- La descarga CSV crea un archivo real y no contiene payloads sensibles.
- `useAuditLogic` deja de insertar directamente y deja de ocultar actores.
- La detección de citatorios usa `documentos_institucionales`, no `audit_log`.
- Las aprobaciones de personal dejan de escribir auditoría directamente.
- Los accesos sensibles dejan de aceptar usuario y rol enviados por el cliente.
- Los registros de `auditoria_accesos` se conservan con su rol marcado como
  legado no verificado y la tabla queda cerrada al Data API.
- Existen pruebas de servicio, UI e invariantes SQL.

## Fuera de alcance

- Firmas criptográficas o encadenamiento hash de eventos.
- Retención legal y archivado de largo plazo.
- Unificación de `audit_logs` y `smoke_test_logs`.
- Reparar en esta vertical el flujo completo de aprobación de personal; queda
  sujeto al endpoint canónico `approve-staff`.

## Riesgos

- Revocar acceso directo rompe cualquier consumidor no localizado.
- Eventos legados pueden no tener propósito, alumno u origen estructurado.
- Un RPC `SECURITY DEFINER` mal protegido podría omitir RLS.
- Los filtros de texto pueden encarecerse cuando la tabla crezca.

## Mitigaciones

- Se rastrean consumidores y escrituras antes de revocar privilegios.
- Los registros legados se muestran como no documentados, no se rellenan.
- Cada RPC valida `auth.uid()`, estado de cuenta, estado de seguridad y rol.
- Se revoca `EXECUTE` a `PUBLIC` y se concede solo a `authenticated`.
- Se añaden índices para fecha, rol/fecha, tabla/fecha y alumno/fecha.

## Estado de validación

Implementación y verificación frontend completadas:

- `pnpm type-check`: correcto.
- `pnpm lint`: cero errores y cinco advertencias preexistentes.
- pruebas focalizadas: cinco archivos y dieciocho pruebas correctas.
- suite completa: treinta y ocho archivos y ciento noventa y dos pruebas
  correctas.
- `pnpm build`: correcto, con advertencias preexistentes de división de
  módulos y tamaño de chunks.
- `git diff --check`: correcto; Git solo informó conversión de finales de
  línea.
- `scripts/audit-migrations.sh`: correcto al ejecutarse con Git Bash.

La migración todavía no se declara aplicada ni validada por PostgreSQL local:
`supabase db start` no pudo abrir el motor de Docker y, por ello,
`supabase db lint --local` y `supabase migration list --local` no pudieron
conectarse a `127.0.0.1:54322`.
