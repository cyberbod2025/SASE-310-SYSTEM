-- Migration: SASE-310 Institutional Simulation Mode
-- OBJETIVO: Refinamiento del aislamiento con simulation_mode flag.

-- 1. Actualizar políticas restrictivas para usar app_metadata y simulation_mode
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
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
            -- Borrar políticas previas del sistema base (user_metadata)
            EXECUTE format('DROP POLICY IF EXISTS "Blindaje Smoke Test Write - %I" ON public.%I;', t, t);
            EXECUTE format('DROP POLICY IF EXISTS "Blindaje Smoke Test Delete - %I" ON public.%I;', t, t);
            
            -- Crear nueva política restrictiva basada en app_metadata.simulation_mode (MÁS ROBUSTA)
            EXECUTE format('
                CREATE POLICY "Simulation Mode Block Write - %I" ON public.%I 
                AS RESTRICTIVE 
                FOR ALL 
                TO authenticated 
                USING ( true ) 
                WITH CHECK ( COALESCE((auth.jwt() -> ''app_metadata'' ->> ''simulation_mode'')::boolean, false) IS NOT TRUE );
            ', t, t);

            EXECUTE format('
                CREATE POLICY "Simulation Mode Block Delete - %I" ON public.%I 
                AS RESTRICTIVE 
                FOR DELETE 
                TO authenticated 
                USING ( COALESCE((auth.jwt() -> ''app_metadata'' ->> ''simulation_mode'')::boolean, false) IS NOT TRUE );
            ', t, t);
        END IF;
    END LOOP;
END $$;

-- 2. Asegurar que los logs de smoke tests sí permitan simulación
DROP POLICY IF EXISTS "Smoke users can insert logs" ON public.smoke_test_logs;
DROP POLICY IF EXISTS "Simulation users can insert logs" ON public.smoke_test_logs;

CREATE POLICY "Simulation users can insert logs" ON public.smoke_test_logs 
FOR INSERT TO authenticated 
WITH CHECK (true);
