-- Snapshot historico remoto:
--   version: 20260504234816
--   name remoto: fix_v_diagnosticos_docentes_view
--
-- La vista remota usaba columnas de una forma legacy de diagnosticos_docentes.
-- Se guarda como migracion condicionada para preservar el ID remoto sin romper
-- el replay local del schema canonico de Orientacion v2.

DO $$
BEGIN
  IF to_regclass('public.diagnosticos_docentes') IS NOT NULL
     AND EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'diagnosticos_docentes'
         AND column_name = 'alumno_id'
     )
     AND EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'diagnosticos_docentes'
         AND column_name = 'docente_nombre'
     )
  THEN
    -- Recrear vista sin SECURITY DEFINER (por defecto es SECURITY INVOKER en PG reciente)
    -- Primero eliminar la vista existente
    DROP VIEW IF EXISTS public.v_diagnosticos_docentes CASCADE;

    -- Recrear como vista normal (SECURITY INVOKER por defecto)
    CREATE VIEW public.v_diagnosticos_docentes AS
    SELECT
        id,
        alumno_id,
        CASE 
            WHEN docente_id IS NOT NULL THEN docente_id::text
            ELSE docente_nombre
        END as docente_id,
        conducta,
        aprovechamiento,
        asistencia,
        observaciones,
        recomendaciones,
        created_at
    FROM public.diagnosticos_docentes;
  ELSE
    RAISE NOTICE 'Saltando fix_v_diagnosticos_docentes_view: schema legacy no detectado';
  END IF;
END $$;
