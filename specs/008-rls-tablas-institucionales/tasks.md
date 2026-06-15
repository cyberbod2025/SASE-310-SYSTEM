1. Confirmar hallazgos localmente
2. Crear migracion `20260612000001_sos_alerts_y_auto_escalation.sql` (copiar desde `_wip/sos/`)
3. Crear migracion `20260612000002_rls_tablas_institucionales.sql` (RLS policies)
4. Regenerar tipos TypeScript con `supabase gen types typescript --local > src/supabase/types.ts`
5. Quitar `as any` en `src/hooks/useInstitutionalActions.ts`
6. Agregar `student_id` al INSERT de `registerEvidence()`
7. Verificar `src/store.tsx` referencias a evidence_log
8. `pnpm type-check` sin errores
9. `pnpm test` pasa
10. `./scripts/audit-migrations.sh` sin errores
11. Prueba manual end-to-end (ver spec)
