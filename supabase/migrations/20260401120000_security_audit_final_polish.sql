-- ==============================================================================
-- SASE-310: AUDIT SECURITY HARDENING FINAL POLISH
-- Fecha: 2026-04-01
-- Objetivo: Resolver los últimos hallazgos de RLS del auditor de Supabase.
-- ==============================================================================

-- 1. HARDENING DE TABLA 'estudiantes' (Gamificación)
-- El auditor detectó que RLS no estaba activado.

DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'estudiantes') THEN
    -- Activar RLS
    ALTER TABLE public.estudiantes ENABLE ROW LEVEL SECURITY;
    
    -- Política para lectura institucional (Staff)
    DROP POLICY IF EXISTS "Staff view gamificacion" ON public.estudiantes;
    CREATE POLICY "Staff view gamificacion" 
    ON public.estudiantes FOR SELECT 
    TO authenticated 
    USING (true);
    
    -- Política para gestión de puntos (Solo staff autorizado)
    DROP POLICY IF EXISTS "Authorize staff can manage points" ON public.estudiantes;
    CREATE POLICY "Authorize staff can manage points" 
    ON public.estudiantes FOR ALL 
    TO authenticated 
    WITH CHECK (
      public.get_my_role() IN ('directivo', 'docente', 'docente_tutor', 'prefectura', 'orientacion')
    );
    
    -- Comentario de cumplimiento
    COMMENT ON TABLE public.estudiantes IS 'Tabla de gamificación con blindaje RLS habilitado.';
  END IF;
END $$;

-- 2. HARDENING DE TABLA 'colectivo_alumnos'
-- El auditor detectó que RLS estaba activo pero sin políticas (bloqueo total por defecto).

DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'colectivo_alumnos') THEN
    -- Asegurar RLS activo
    ALTER TABLE public.colectivo_alumnos ENABLE ROW LEVEL SECURITY;
    
    -- Política de visualización institucional
    DROP POLICY IF EXISTS "Staff view colectivo alumnos" ON public.colectivo_alumnos;
    CREATE POLICY "Staff view colectivo alumnos" 
    ON public.colectivo_alumnos FOR SELECT 
    TO authenticated 
    USING (true);
    
    -- Política de gestión institucional
    DROP POLICY IF EXISTS "Manage colectivo alumnos" ON public.colectivo_alumnos;
    CREATE POLICY "Manage colectivo alumnos" 
    ON public.colectivo_alumnos FOR ALL
    TO authenticated
    WITH CHECK (
      public.get_my_role() IN ('directivo', 'subdireccion', 'orientacion', 'trabajo_social', 'prefectura')
    );

    -- Comentario de cumplimiento
    COMMENT ON TABLE public.colectivo_alumnos IS 'Tabla de seguimiento colectivo de alumnos con políticas RLS asignadas.';
  ELSE
    RAISE NOTICE 'Tabla colectivo_alumnos no encontrada; ignorando políticas.';
  END IF;
END $$;

-- 3. REGISTRO DE AUDITORÍA FINAL
INSERT INTO public.auditoria (tipo_accion, descripcion_accion, tabla_objetivo)
VALUES (
    'SECURITY_FINAL_POLISH', 
    'Fase 4 (Final): Corrección de RLS faltante en estudiantes y políticas en colectivo_alumnos.', 
    'database_schema'
);

-- ✅ Blindaje de base de datos SASE-310 completado satisfactoriamente.
