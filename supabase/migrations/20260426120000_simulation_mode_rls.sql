-- Migration: SASE-310 Institutional Simulation Mode
-- OBJETIVO: Aislamiento total de pruebas smoke y QA.

-- 1. Reforzar tabla de logs para smoke tests
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'smoke_test_logs' AND column_name = 'email') THEN
        ALTER TABLE public.smoke_test_logs RENAME COLUMN email TO actor_email;
    END IF;
END $$;

ALTER TABLE public.smoke_test_logs ADD COLUMN IF NOT EXISTS module TEXT;
ALTER TABLE public.smoke_test_logs ADD COLUMN IF NOT EXISTS result TEXT;
ALTER TABLE public.smoke_test_logs ADD COLUMN IF NOT EXISTS details JSONB;

-- 2. Actualizar políticas restrictivas para usar app_metadata y simulation_mode
-- Esto garantiza que CUALQUIER usuario con simulation_mode = true sea bloqueado en escrituras críticas.

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
        'asistencias',
        'comunicados',
        'expedientes'
    ];
BEGIN 
    FOREACH t IN ARRAY tables_to_harden LOOP
        -- Borrar políticas previas (basadas en user_metadata)
        EXECUTE format('DROP POLICY IF EXISTS "Blindaje Smoke Test Write - %I" ON public.%I;', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Blindaje Smoke Test Delete - %I" ON public.%I;', t, t);
        
        -- Crear nueva política restrictiva basada en app_metadata.simulation_mode
        EXECUTE format('
            CREATE POLICY "Simulation Mode Block Write - %I" ON public.%I 
            AS RESTRICTIVE 
            FOR ALL 
            TO authenticated 
            USING ( true ) 
            WITH CHECK ( (auth.jwt() -> ''app_metadata'' ->> ''simulation_mode'')::boolean IS NOT TRUE );
        ', t, t);

        EXECUTE format('
            CREATE POLICY "Simulation Mode Block Delete - %I" ON public.%I 
            AS RESTRICTIVE 
            FOR DELETE 
            TO authenticated 
            USING ( (auth.jwt() -> ''app_metadata'' ->> ''simulation_mode'')::boolean IS NOT TRUE );
        ', t, t);
    END LOOP;
END $$;

-- 3. Asegurar que los logs de smoke tests sí permitan simulación
DROP POLICY IF EXISTS "Smoke users can insert logs" ON public.smoke_test_logs;
CREATE POLICY "Simulation users can insert logs" ON public.smoke_test_logs 
FOR INSERT TO authenticated 
WITH CHECK ( (auth.jwt() -> 'app_metadata' ->> 'simulation_mode')::boolean IS TRUE );
