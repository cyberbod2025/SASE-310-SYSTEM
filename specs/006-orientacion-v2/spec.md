# Spec - Orientacion v2

## Problema

Orientacion opera hoy sobre una UI legacy que mezcla alumnos en riesgo, citatorios e intervenciones, pero no tiene caso institucional persistente, solicitud docente asignada, plan de intervencion ni bitacora propia con evidencia. Esto impide defender decisiones ante Direccion, supervision o familias sin depender de incidencias o seguimiento social.

## Alcance

- Backend base Supabase para casos de Orientacion.
- RLS fail-closed por rol institucional real.
- RPCs institucionales para mutaciones con auditoria.
- Dashboard Orientacion v2 mobile-first.
- Reutilizacion de `alumnos`, `incidencias`, vistas de expediente, `citas_padres`, `contacts_log`, `interventions_log` y `seguimiento_social` sin duplicar su dominio.

## Fuera de alcance

- Crear incidencias desde Orientacion.
- Cerrar casos finales como Direccion.
- Ejecutar visitas domiciliarias.
- Reemplazar Trabajo Social o seguimiento social.
- Cambiar autenticacion.

## Reglas funcionales

- Orientacion abre, analiza, solicita diagnosticos, define planes, deriva a Trabajo Social y escala a Direccion.
- Docentes solo responden diagnosticos asignados.
- Trabajo Social solo ve casos derivados a su area.
- Direccion y Subdireccion ven todos los casos para supervision institucional.
- `developer` y `system_admin` tienen acceso completo.

## Validacion

- `pnpm type-check`
- `pnpm build`
- `pnpm test`
- `./scripts/audit-migrations.sh`
- `supabase db start`
- `supabase db lint --local`
