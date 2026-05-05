-- Purpose: Fix Supabase Advisor lint 0003_auth_rls_initplan for Simulation Mode Block policies.
-- This migration ONLY wraps auth.jwt() in (SELECT auth.jwt()) to force initPlan.
-- No security logic, roles, commands, or policy scopes are changed.
-- All affected policies are AS RESTRICTIVE — ALTER POLICY preserves that attribute.
-- Source of truth: pg_policies from local Supabase (post db reset).

-- Pattern for Write (FOR ALL):
--   USING(true) WITH CHECK(COALESCE((auth.jwt()->'app_metadata'->>'simulation_mode')::boolean, false) IS NOT TRUE)
-- Pattern for Delete (FOR DELETE):
--   USING(COALESCE((auth.jwt()->'app_metadata'->>'simulation_mode')::boolean, false) IS NOT TRUE)
-- Change: auth.jwt() → (select auth.jwt())

DO $$
DECLARE
  _tbl text;
  _sim_expr text := '(COALESCE(((( select auth.jwt()) -> ''app_metadata''::text) ->> ''simulation_mode''::text)::boolean, false) IS NOT TRUE)';
  _tables text[] := ARRAY[
    'alumnos', 'auditoria', 'comunicados', 'estudiantes',
    'incidencias', 'justificantes', 'objetos_retenidos',
    'perfiles_usuario', 'profiles', 'solicitudes_alta_personal'
  ];
BEGIN
  -- Fix Write policies (FOR ALL): only WITH CHECK needs update
  FOREACH _tbl IN ARRAY _tables LOOP
    EXECUTE format(
      'ALTER POLICY "Simulation Mode Block Write - %1$s" ON public.%1$I WITH CHECK (%2$s)',
      _tbl, _sim_expr
    );
    RAISE NOTICE 'Fixed Simulation Write on %', _tbl;
  END LOOP;

  -- Fix Delete policies (FOR DELETE): only USING needs update
  FOREACH _tbl IN ARRAY _tables LOOP
    EXECUTE format(
      'ALTER POLICY "Simulation Mode Block Delete - %1$s" ON public.%1$I USING (%2$s)',
      _tbl, _sim_expr
    );
    RAISE NOTICE 'Fixed Simulation Delete on %', _tbl;
  END LOOP;
END $$;
