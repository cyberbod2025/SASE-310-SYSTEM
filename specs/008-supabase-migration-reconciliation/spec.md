# Spec: Reconciliacion local del historial de migraciones Supabase

Estado: borrador local

## Problema

La rama `main` remota de Supabase para el proyecto `uvnetpnjinxzhggoqmwz` reporta `MIGRATIONS_FAILED` aunque la migracion `20260527051018_post_emergency_incident_rpc` aparece aplicada en local y remoto.

El diagnostico muestra que el problema no es esa migracion puntual, sino deriva historica entre:

- los archivos versionados en `supabase/migrations/`
- el historial remoto `supabase_migrations.schema_migrations`
- un archivo WIP aplicado remotamente pero estacionado localmente fuera de migraciones activas

## Alcance

Este expediente solo prepara reconciliacion local y reversible. No autoriza:

- `supabase db push`
- `supabase migration repair`
- aplicar migraciones remotas
- deploy
- merge

## Evidencia

Migraciones remotas sin archivo local antes de esta reconciliacion:

- `20260503220000_sos_auto_escalation`
- `20260504234803_fix_diagnosticos_docentes_rls`
- `20260504234816_fix_v_diagnosticos_docentes_view`
- `20260511163305_create_feedback_institucional`
- `20260511163531_refine_feedback_institucional_rls`

Migraciones locales sin registro remoto:

- `20260501084547_orientacion_v2_backend`
- `20260502011206_feria_edge_security`
- `20260504235200_fix_blindaje_delete_alumnos_initplan`
- `20260505001000_fix_rls_initplan_static_policies`
- `20260505002000_fix_rls_initplan_blindaje_smoke_test`
- `20260505003000_fix_rls_initplan_simulation_mode`
- `20260505150810_fix_rls_enforce_seguimiento_orientacion_author_integrity`
- `20260505211112_fix_diagnostico_colectivo_author_integrity`
- `20260506051327_hotfix_orientacion_v2_grants_and_trigger`
- `20260506063305_fix_diagnostico_colectivo_schema`
- `20260506090000_fix_orientacion_v2_remote_blockers`
- `20260507074852_fix_is_staff_salud_policy`

## Hipotesis

La deriva se origino antes de `20260527051018`. La secuencia mas probable:

1. `20260501084547_orientacion_v2_backend` quedo en Git pero no en historial remoto.
2. Remoto recibio parches ad hoc sobre una forma legacy de `diagnosticos_docentes`.
3. `20260503220000_sos_auto_escalation` fue aplicado en remoto, pero localmente quedo como `_wip/sos/20260503220000_sos_auto_escalation.sql`.
4. Feedback institucional tambien fue aplicado remotamente sin archivo local equivalente.

## Decision local aplicada

Los archivos de `feedback_institucional` se agregaron como snapshots directos del historial remoto.

Los archivos de `diagnosticos_docentes` se agregaron como migraciones historicas condicionadas: preservan los IDs remotos, pero solo ejecutan el SQL legacy si detectan columnas `docente_nombre` y `alumno_id` en `public.diagnosticos_docentes`. En el schema canonico local de Orientacion v2 hacen `NOTICE` y no alteran nada.

`20260503220000_sos_auto_escalation` se copio desde `_wip/sos/` a `supabase/migrations/` para que el ID aplicado remotamente quede visible en el historial versionado. Requiere auditoria de seguridad antes de cualquier accion remota adicional.

## Resultado esperado

El repo debe contener snapshots historicos de las migraciones que remoto ya registra, para que el equipo pueda revisar una reconciliacion transparente antes de decidir cualquier accion remota.

## Riesgos

- Canonizar `sos_auto_escalation` puede introducir una superficie sensible: tabla SOS, RLS permisiva, funciones `SECURITY DEFINER` y `pg_cron`.
- Los fixes remotos de `diagnosticos_docentes` parecen apuntar a un schema legacy distinto al de Orientacion v2.
- Marcar migraciones como aplicadas con `repair` sin validar esquema puede ocultar diferencias reales.
