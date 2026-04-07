-- ==============================================================================
-- SASE-310: AUDIT SECURITY HARDENING FINAL POLISH V2
-- Fecha: 2026-04-01
-- Objetivo: Corregir políticas RLS demasiado permisivas (Permissive USING in ALL).
-- ==============================================================================

-- 1. REFINAMIENTO DE TABLA 'estudiantes'
-- El auditor detectó que 'USING (true)' en una política 'FOR ALL' es inseguro.

DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'estudiantes') THEN
    -- Eliminar políticas anteriores para reconfigurar con granularidad
    DROP POLICY IF EXISTS "Staff view gamificacion" ON public.estudiantes;
    DROP POLICY IF EXISTS "Authorize staff can manage points" ON public.estudiantes;
    
    -- Política de LECTURA (Permite USING true para lectura pública autenticada)
    CREATE POLICY "Staff view gamificacion" 
    ON public.estudiantes FOR SELECT 
    TO authenticated 
    USING (true);
    
    -- Política de GESTIÓN (Restringe USING y WITH CHECK a roles autorizados)
    CREATE POLICY "Authorize staff can manage points" 
    ON public.estudiantes FOR ALL 
    TO authenticated 
    USING (
      public.get_my_role() IN ('directivo', 'docente', 'docente_tutor', 'prefectura', 'orientacion')
    )
    WITH CHECK (
      public.get_my_role() IN ('directivo', 'docente', 'docente_tutor', 'prefectura', 'orientacion')
    );
  END IF;
END $$;

-- 2. REFINAMIENTO DE TABLA 'colectivo_alumnos'
-- Ajuste de política 'ALL' para evitar 'USING (true)'.

DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'colectivo_alumnos') THEN
    -- Eliminar políticas anteriores
    DROP POLICY IF EXISTS "Staff view colectivo alumnos" ON public.colectivo_alumnos;
    DROP POLICY IF EXISTS "Manage colectivo alumnos" ON public.colectivo_alumnos;
    
    -- Política de LECTURA AUTH
    CREATE POLICY "Staff view colectivo alumnos" 
    ON public.colectivo_alumnos FOR SELECT 
    TO authenticated 
    USING (true);
    
    -- Política de GESTIÓN AUTH (Restringiendo visibilidad para UPDATE/DELETE)
    CREATE POLICY "Manage colectivo alumnos" 
    ON public.colectivo_alumnos FOR ALL
    TO authenticated
    USING (
      public.get_my_role() IN ('directivo', 'subdireccion', 'orientacion', 'trabajo_social', 'prefectura')
    )
    WITH CHECK (
      public.get_my_role() IN ('directivo', 'subdireccion', 'orientacion', 'trabajo_social', 'prefectura')
    );
  END IF;
END $$;

-- 3. REGISTRO DE AUDITORÍA
INSERT INTO public.auditoria (tipo_accion, descripcion_accion, tabla_objetivo)
VALUES (
    'SECURITY_FINAL_REFINE', 
    'Fase 5: Corrección de políticas ALL con USING restringido para cumplimiento total del linter.', 
    'database_security'
);

-- ✅ Blindaje de base de datos SASE-310 completado y validado contra linter.
