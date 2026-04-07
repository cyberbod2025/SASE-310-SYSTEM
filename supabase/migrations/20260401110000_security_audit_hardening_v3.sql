-- ==============================================================================
-- SASE-310: AUDIT SECURITY HARDENING PHASE 3 (Search Path & RLS Refining)
-- Fecha: 2026-04-01
-- Objetivo: Resolver advertencias adicionales del auditor de Supabase.
-- ==============================================================================

-- 1. SEARCH PATH HARDENING (Prevención de Secuestro de Ruta)
-- Asegura que las funciones usen exclusivamente el esquema public.

DO $$ 
BEGIN 
  -- fn_get_score_by_gravedad(text)
  IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE proname = 'fn_get_score_by_gravedad' AND nspname = 'public') THEN
    BEGIN
        ALTER FUNCTION public.fn_get_score_by_gravedad(text) SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'fn_get_score_by_gravedad existe pero con argumentos distintos.';
    END;
  END IF;

  -- fn_refresh_student_risk(uuid)
  IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE proname = 'fn_refresh_student_risk' AND nspname = 'public') THEN
    BEGIN
        ALTER FUNCTION public.fn_refresh_student_risk(uuid) SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'fn_refresh_student_risk existe pero con argumentos distintos.';
    END;
  END IF;

  -- tr_refresh_risk_on_event()
  IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE proname = 'tr_refresh_risk_on_event' AND nspname = 'public') THEN
    ALTER FUNCTION public.tr_refresh_risk_on_event() SET search_path = public;
  END IF;
END $$;

-- 2. RLS TIGHTENING: blindaje de respuestas_docentes
-- El auditor reportó una política de inserción sin restricciones (true).

DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'respuestas_docentes') THEN
    -- Asegurar RLS activo
    ALTER TABLE public.respuestas_docentes ENABLE ROW LEVEL SECURITY;
    
    -- Eliminar política insegura reportada
    DROP POLICY IF EXISTS "Allow insert" ON public.respuestas_docentes;
    
    -- Crear política restringida a usuarios autenticados con rol institucional
    CREATE POLICY "Staff only can insert responses" 
    ON public.respuestas_docentes FOR INSERT 
    TO authenticated 
    WITH CHECK (
      public.get_my_role() IN ('docente', 'docente_tutor', 'directivo', 'subdireccion', 'orientacion', 'trabajo_social', 'prefectura')
    );
    
    -- Comentario de cumplimiento
    COMMENT ON TABLE public.respuestas_docentes IS 'Respuestas de diagnósticos docentes con blindaje RLS preventivo.';
  END IF;
END $$;

-- 3. REGISTRO DE AUDITORÍA
-- Utilizamos la tabla de auditoría para dejar registro del blindaje aplicado.
INSERT INTO public.auditoria (tipo_accion, descripcion_accion, tabla_objetivo)
VALUES (
    'SECURITY_HARDENING_V3', 
    'Blindaje de Search Path en funciones de riesgo y restricción de políticas RLS en respuestas_docentes.', 
    'database_security'
);

-- ✅ Fase 3 completada y lista para despliegue.
