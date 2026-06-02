# Tasks: Reconciliacion local del historial Supabase

Estado: borrador local

## Hecho en esta rama

- [x] Crear rama local de reconciliacion.
- [x] Agregar snapshot local de `20260503220000_sos_auto_escalation`.
- [x] Agregar snapshots locales de fixes remotos de `diagnosticos_docentes`.
- [x] Agregar snapshots locales de `feedback_institucional`.
- [x] Documentar evidencia, riesgos y plan SDD.
- [x] Ejecutar `./scripts/audit-migrations.sh`.
- [x] Confirmar con `supabase migration list --linked` que los cinco IDs remotos agregados ahora existen tambien en local.
- [x] Ejecutar `supabase db start` local.
- [x] Ejecutar `supabase db lint --local` y registrar errores existentes fuera de alcance.

## Pendiente

- [ ] Auditar seguridad de `sos_alerts`: RLS, grants, `SECURITY DEFINER`, `pg_cron`.
- [ ] Confirmar forma real remota de `public.diagnosticos_docentes`.
- [ ] Proponer comandos remotos exactos solo despues de autorizacion explicita.
