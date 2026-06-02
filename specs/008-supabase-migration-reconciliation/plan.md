# Plan: Reconciliacion local del historial Supabase

Estado: borrador local

## Principios

- Primero evidencia local, despues cualquier accion remota.
- No aplicar ni reparar migraciones sin autorizacion explicita.
- Mantener cambios reversibles mediante archivos versionados y expediente SDD.

## Fase 1: Snapshots historicos locales

Agregar a `supabase/migrations/` los archivos que remoto ya registra:

- `20260503220000_sos_auto_escalation.sql`
- `20260504234803_fix_diagnosticos_docentes_rls.sql`
- `20260504234816_fix_v_diagnosticos_docentes_view.sql`
- `20260511163305_create_feedback_institucional.sql`
- `20260511163531_refine_feedback_institucional_rls.sql`

Nota: los dos archivos de `diagnosticos_docentes` deben mantenerse condicionados al schema legacy para no romper replay local del schema canonico.

## Fase 2: Validacion local

Ejecutar, cuando haya ventana operativa:

```bash
./scripts/audit-migrations.sh
supabase db start
supabase db lint --local
supabase migration list --linked
```

## Fase 3: Decision remota con autorizacion

Despues de validar schema real remoto y replay local:

- si los efectos de las migraciones locales faltantes ya existen en remoto, preparar `supabase migration repair --status applied` version por version;
- si no existen, preparar migracion de reconciliacion o aplicar por pipeline normal;
- no usar `db push` sobre remoto hasta resolver los conflictos de `diagnosticos_docentes` y `sos_alerts`.

## Criterios de salida

- El repo contiene todos los IDs que remoto registra.
- La lista de migraciones permite distinguir claramente `remote-only`, `local-only` y `both`.
- La siguiente accion remota queda documentada como comando exacto, riesgo y rollback.
