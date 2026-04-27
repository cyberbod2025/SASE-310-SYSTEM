-- Migration: Security Audit Fixes (RLS Hardening)
-- Fecha: 2026-04-27
-- Objetivo: Resolver rls_disabled_in_public y rls_references_user_metadata.

-- 1. Habilitar RLS en tablas faltantes (Error 1: rls_disabled_in_public)
ALTER TABLE IF EXISTS public.salud ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.alertas_salud ENABLE ROW LEVEL SECURITY; -- Por si existe en otros entornos
ALTER TABLE IF EXISTS public.examenes_trimestre ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.protocolos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.socioeconomico_privado ENABLE ROW LEVEL SECURITY;

-- 2. Definir políticas básicas para salud (Protección de datos médicos)
DO $$ 
BEGIN
    -- DROP if exists to be idempotent
    DROP POLICY IF EXISTS "Personal de salud y directivos pueden ver salud" ON public.salud;
    DROP POLICY IF EXISTS "Usuarios pueden ver su propio registro de salud" ON public.salud;
    DROP POLICY IF EXISTS "Solo personal de salud puede editar" ON public.salud;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'salud') THEN
        CREATE POLICY "Personal de salud y directivos pueden ver salud" ON public.salud
        FOR SELECT TO authenticated
        USING ( public.is_staff() );

        CREATE POLICY "Usuarios pueden ver su propio registro de salud" ON public.salud
        FOR SELECT TO authenticated
        USING ( auth.uid() = alumno_id );

        CREATE POLICY "Solo personal de salud puede editar" ON public.salud
        FOR ALL TO authenticated
        USING ( public.is_staff() )
        WITH CHECK ( public.is_staff() );
    END IF;
END $$;

-- 3. Definir políticas para alertas_salud (Si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'alertas_salud') THEN
        DROP POLICY IF EXISTS "Personal puede ver alertas de salud" ON public.alertas_salud;
        CREATE POLICY "Personal puede ver alertas de salud" ON public.alertas_salud
        FOR SELECT TO authenticated
        USING ( public.is_staff() );
    END IF;
END $$;

-- 4. Corregir is_staff() para eliminar dependencia de user_metadata (Error 2: rls_references_user_metadata)
CREATE OR REPLACE FUNCTION public.is_staff()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_role TEXT;
BEGIN
  -- Obtener el rol directamente de la tabla perfiles_usuario (Fuente de verdad SASE)
  SELECT COALESCE(rol::text, role::text) INTO v_role
  FROM public.perfiles_usuario
  WHERE id = auth.uid();

  RETURN v_role IN (
    'directivo', 'docente', 'docente_tutor', 'prefectura', 
    'orientacion', 'trabajo_social', 'enfermeria', 'secretaria', 
    'medico_escolar', 'udeii', 'promotora_lectura', 'subdireccion', 
    'admin', 'system_admin'
  );
END;
$function$;

-- 5. Corregir políticas de smoke_test_logs para evitar user_metadata
DROP POLICY IF EXISTS "Admins can view smoke logs" ON public.smoke_test_logs;
CREATE POLICY "Admins can view smoke logs" ON public.smoke_test_logs 
FOR SELECT TO authenticated 
USING ( public.is_staff() );

-- 6. Actualizar Blindaje de Smoke Tests para no usar user_metadata
-- Añadimos una columna de control en perfiles_usuario si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfiles_usuario' AND column_name = 'es_test') THEN
        ALTER TABLE public.perfiles_usuario ADD COLUMN es_test BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Re-aplicar blindaje restrictivo basado en la columna es_test
DO $$ 
DECLARE 
    t text;
    tables_to_harden text[] := ARRAY[
        'alumnos', 
        'incidencias', 
        'perfiles_usuario', 
        'auditoria', 
        'estudiantes', 
        'solicitudes_alta_personal',
        'objetos_retenidos',
        'justificantes',
        'profiles',
        'comunicados'
    ];
BEGIN 
    FOREACH t IN ARRAY tables_to_harden LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
            EXECUTE format('DROP POLICY IF EXISTS "Blindaje Smoke Test Write - %I" ON public.%I;', t, t);
            EXECUTE format('DROP POLICY IF EXISTS "Blindaje Smoke Test Delete - %I" ON public.%I;', t, t);
            
            EXECUTE format('
                CREATE POLICY "Blindaje Smoke Test Write - %I" ON public.%I 
                AS RESTRICTIVE 
                FOR ALL 
                TO authenticated 
                USING ( true ) 
                WITH CHECK ( NOT EXISTS (SELECT 1 FROM public.perfiles_usuario WHERE id = auth.uid() AND es_test = true) );
            ', t, t);
            
            EXECUTE format('
                CREATE POLICY "Blindaje Smoke Test Delete - %I" ON public.%I 
                AS RESTRICTIVE 
                FOR DELETE 
                TO authenticated 
                USING ( NOT EXISTS (SELECT 1 FROM public.perfiles_usuario WHERE id = auth.uid() AND es_test = true) );
            ', t, t);
        END IF;
    END LOOP;
END $$;
