-- Purpose: Fix Supabase Advisor lint 0003_auth_rls_initplan for Blindaje Smoke Test policies.
-- This migration ONLY wraps auth.uid() in (SELECT auth.uid()) to force initPlan.
-- No security logic, roles, commands, or policy scopes are changed.
-- All affected policies are AS RESTRICTIVE — ALTER POLICY preserves that attribute.
-- Source of truth: pg_policies from local Supabase (post db reset).

-- Pattern for Write (FOR ALL):
--   USING(true) WITH CHECK(NOT EXISTS(... WHERE id = auth.uid() AND es_test = true))
-- Pattern for Delete (FOR DELETE):
--   USING(NOT EXISTS(... WHERE id = auth.uid() AND es_test = true))
-- Change: auth.uid() → (select auth.uid())

-- Note: "Blindaje Smoke Test Delete - alumnos" was already fixed in
-- migration 20260504235200. "Blindaje Smoke Test Write - alumnos" is fixed here.

DO $$
DECLARE
  _tbl text;
  _write_expr text := '(NOT (EXISTS ( SELECT 1 FROM perfiles_usuario WHERE ((perfiles_usuario.id = (select auth.uid())) AND (perfiles_usuario.es_test = true)))))';
  _tables_write text[] := ARRAY[
    'alumnos', 'auditoria', 'comunicados', 'estudiantes',
    'incidencias', 'justificantes', 'objetos_retenidos',
    'profiles', 'solicitudes_alta_personal'
  ];
  _tables_delete text[] := ARRAY[
    'auditoria', 'comunicados', 'estudiantes',
    'incidencias', 'justificantes', 'objetos_retenidos',
    'profiles', 'solicitudes_alta_personal'
  ];
BEGIN
  -- Fix Write policies (FOR ALL): only WITH CHECK needs update
  FOREACH _tbl IN ARRAY _tables_write LOOP
    EXECUTE format(
      'ALTER POLICY "Blindaje Smoke Test Write - %1$s" ON public.%1$I WITH CHECK (%2$s)',
      _tbl, _write_expr
    );
    RAISE NOTICE 'Fixed Blindaje Write on %', _tbl;
  END LOOP;

  -- Fix Delete policies (FOR DELETE): only USING needs update
  FOREACH _tbl IN ARRAY _tables_delete LOOP
    EXECUTE format(
      'ALTER POLICY "Blindaje Smoke Test Delete - %1$s" ON public.%1$I USING (%2$s)',
      _tbl, _write_expr
    );
    RAISE NOTICE 'Fixed Blindaje Delete on %', _tbl;
  END LOOP;
END $$;
