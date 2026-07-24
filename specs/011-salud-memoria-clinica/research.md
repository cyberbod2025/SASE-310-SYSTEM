# Investigación

## Evidencia del repositorio

- `ModuleRouter` usa `DashboardSalud` como módulo real para
  `medico_escolar`; `DashboardMedico` y `DashboardEnfermeria` no son la ruta
  activa.
- `DashboardSalud` deriva su lista de “atenciones” de incidencias con tipo
  Salud.
- `DashboardSalud.handleNotifyTeachers` crea una incidencia por cada alerta y
  copia el padecimiento al texto.
- `atenciones_medicas` ya existe y cuenta con auditoría, pero la política de
  inserción solo verifica sesión.
- `salud` contiene padecimiento, alergias y medicamentos, pero sus políticas
  permiten acceso a cualquier rol considerado `staff`.
- `addAtencionMedica` existe en el slice, pero no forma parte del contrato
  tipado del contexto y no es consumido por el tablero activo.
- `ModuleRouter` no ejecuta `usePermissions` para Salud, UDEII o Trabajo Social.

## Decisiones

### D1. Reutilizar tablas existentes

Se amplían `atenciones_medicas` y `salud`. No se crea una tercera tabla clínica
que fragmente la memoria existente.

### D2. Separar incidencias y salud

Una incidencia puede documentar un accidente o hecho institucional, pero no es
el expediente de atención. El tablero clínico deja de leer y crear incidencias.

### D3. Escritura directa con RLS

Las altas usan `INSERT ... RETURNING` desde `supabase-js`. No se necesita una
función `SECURITY DEFINER`: ambas tablas pueden protegerse con autoría
`auth.uid()` y rol clínico.

### D4. Seguimiento restringido por columnas

El cliente solo recibe permiso para actualizar estado, seguimiento, salida y
observaciones de `atenciones_medicas`. No puede reasignar alumno ni autor.

### D5. Lectura clínica compartida

Servicio Médico, Dirección, Subdirección y System Admin pueden consultar la
memoria clínica. Solo Servicio Médico y System Admin crean alertas y
atenciones; liderazgo puede cerrar atenciones mediante la política de update.

### D6. RBAC de interfaz

El router y `usePermissions` usarán la misma matriz. `developer` se elimina del
acceso clínico por defecto.

## Riesgos

- Docker no está disponible; la migración no podrá probarse contra Postgres
  local en este entorno.
- Las tablas legadas contienen columnas textuales para booleanos
  (`notificacion_padres`, `acudieron_por_el`); se conservan por compatibilidad.
- Datos históricos pueden carecer de autor o metadatos.
- La consulta global de alumnos sigue incluyendo la relación `salud`; RLS hará
  que roles no autorizados reciban una relación vacía, pero no se cambia la
  arquitectura global en este corte.

## Documentación consultada

- Supabase Row Level Security.
- Supabase Securing your API.
- Supabase JavaScript Select.
- Changelog de exposición explícita del Data API, abril de 2026.

