-- Snapshot historico remoto:
--   version: 20260504234803
--   name remoto: fix_diagnosticos_docentes_rls
--
-- El SQL remoto apuntaba a una forma legacy de public.diagnosticos_docentes
-- con columnas docente_nombre y alumno_id. La linea canonica local de
-- Orientacion v2 usa solicitud_id, caso_id y docente_id. Para que el historial
-- sea trazable sin romper replay local, esta migracion solo aplica el parche
-- si detecta esa forma legacy.

DO $$
BEGIN
  IF to_regclass('public.diagnosticos_docentes') IS NOT NULL
     AND EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'diagnosticos_docentes'
         AND column_name = 'docente_nombre'
     )
     AND EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'diagnosticos_docentes'
         AND column_name = 'alumno_id'
     )
  THEN
    -- Eliminar políticas demasiado permisivas
    DROP POLICY IF EXISTS diag_anon_insert ON public.diagnosticos_docentes;
    DROP POLICY IF EXISTS diag_anon_select ON public.diagnosticos_docentes;
    DROP POLICY IF EXISTS diag_auth_insert ON public.diagnosticos_docentes;
    DROP POLICY IF EXISTS diag_auth_select ON public.diagnosticos_docentes;

    -- Crear nueva política para INSERT via anon (solo si docente_nombre viene en el request)
    -- Esto es temporal hasta que se implemente Edge Function para escritura
    CREATE POLICY "diag_anon_insert_controlled"
    ON public.diagnosticos_docentes
    FOR INSERT
    TO anon
    WITH CHECK (
        docente_nombre IS NOT NULL AND
        alumno_id IS NOT NULL AND
        conducta IN ('baja', 'media', 'alta') AND
        aprovechamiento IN ('bajo', 'medio', 'alto') AND
        asistencia IN ('baja', 'media', 'alta')
    );

    -- Select para anon (solo para verificar que el insert funcionó, restringido)
    CREATE POLICY "diag_anon_select_limited"
    ON public.diagnosticos_docentes
    FOR SELECT
    TO anon
    USING (false);  -- No permitir select via anon

    -- Políticas para authenticated (SASE users)
    CREATE POLICY "diag_auth_select"
    ON public.diagnosticos_docentes
    FOR SELECT
    TO authenticated
    USING (true);

    CREATE POLICY "diag_auth_insert"
    ON public.diagnosticos_docentes
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
  ELSE
    RAISE NOTICE 'Saltando fix_diagnosticos_docentes_rls: schema legacy no detectado';
  END IF;
END $$;
