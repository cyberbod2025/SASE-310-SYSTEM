-- Migración: Fix Auth RLS InitPlan — Blindaje Smoke Test Delete (alumnos)
-- Fecha: 2026-05-04
-- Objetivo: Resolver lint "Auth RLS Initialization Plan" (auth_rls_initplan)
--           sin cambiar la lógica de seguridad.
--
-- Problema:
--   La llamada directa a auth.uid() dentro de la cláusula USING se evalúa
--   por cada fila (Nested Loop). Envolviendo en (SELECT auth.uid()) se fuerza
--   un InitPlan que Postgres evalúa una sola vez por statement.
--
-- Cambio: auth.uid() → (select auth.uid())
-- Lógica de seguridad: idéntica.

-- DROP + CREATE es más seguro que ALTER POLICY para preservar
-- la cláusula AS RESTRICTIVE que ALTER POLICY no permite modificar.

DROP POLICY IF EXISTS "Blindaje Smoke Test Delete - alumnos" ON public.alumnos;

CREATE POLICY "Blindaje Smoke Test Delete - alumnos" ON public.alumnos
  AS RESTRICTIVE
  FOR DELETE
  TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1
      FROM public.perfiles_usuario
      WHERE id = (select auth.uid())
        AND es_test = true
    )
  );
