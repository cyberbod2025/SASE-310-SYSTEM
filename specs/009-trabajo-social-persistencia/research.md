# Investigación

## Hallazgos iniciales

- `DashboardTrabajoSocial` mantiene `citatorios`, `contacts`, `visits`, `agreements`, estados y bitácora en `useState`.
- `buildInitialCitatorios`, `buildInitialContacts`, `buildInitialVisits` y `buildInitialAgreements` generan datos de presentación.
- El panel usa `createEmergencyAlert` para emergencias, pero no tiene una mutación persistente equivalente para el seguimiento social.
- `seguimiento_social` contiene `motivo`, `seguimiento`, `acuerdos`, `estatus`, `es_sensible`, `creado_por` y `fecha`, pero no expresa explícitamente tipo de evento ni relación con un caso operativo.
- El repositorio ya contiene tablas recientes de contactos, citas e intervenciones; se debe confirmar su contrato y sus políticas antes de reutilizarlas.

## Decisión adoptada

- Reutilizar `contacts_log` para contactos familiares.
- Reutilizar `citas_padres` para citatorios y asistencia.
- Reutilizar `interventions_log` para inicio, escalamiento y devolución.
- Ampliar `seguimiento_social` con `tipo_evento`, `metadata` y `updated_at` para visitas domiciliarias y acuerdos, porque esos eventos no caben de forma estructurada en las tablas anteriores.
- Mantener `es_sensible = true` en visitas y acuerdos.
- Sustituir los fixtures del panel por consultas persistentes y conservar los formularios cuando una escritura falla.

## Seguridad

La migración limita lectura a Trabajo Social, Orientación, Dirección, Subdirección y `system_admin`; exige autoría con `auth.uid()` para insertar y restringe las actualizaciones a la columna de estado. Los índices siguen los filtros usados por alumno, autor y fecha.

## Límite de validación local

Supabase CLI 2.107.0 está instalado. `supabase db start` y `supabase db lint --local` no pudieron ejecutarse porque el daemon de Docker no está disponible en este entorno. La migración no se aplicó a una base local ni remota.
