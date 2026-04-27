-- Migration: Hardening Smoke Tests System
-- OBJETIVO: Blindar el sistema real contra contaminación de datos de pruebas.

-- 1. Crear tabla de logs para smoke tests
CREATE TABLE IF NOT EXISTS public.smoke_test_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_email TEXT,
    action TEXT,
    module TEXT,
    result TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.smoke_test_logs ENABLE ROW LEVEL SECURITY;

-- Permitir que cualquier usuario autenticado (incluyendo smoke) pueda insertar sus propios logs
CREATE POLICY "Smoke users can insert logs" ON public.smoke_test_logs 
FOR INSERT TO authenticated 
WITH CHECK (true);

-- Solo admins pueden ver los logs
CREATE POLICY "Admins can view smoke logs" ON public.smoke_test_logs 
FOR SELECT TO authenticated 
USING ( (auth.jwt() -> 'user_metadata' ->> 'temporal')::boolean IS NOT TRUE OR public.is_staff() );

-- 2. Blindaje con Políticas RESTRICTIVE
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
            -- Primero borramos la anterior si existía
            EXECUTE format('DROP POLICY IF EXISTS "Blindaje Smoke Test - %I" ON public.%I;', t, t);
            EXECUTE format('DROP POLICY IF EXISTS "Blindaje Smoke Test Write - %I" ON public.%I;', t, t);
            EXECUTE format('DROP POLICY IF EXISTS "Blindaje Smoke Test Delete - %I" ON public.%I;', t, t);
            
            -- Creamos la restrictiva SOLO para escritura
            EXECUTE format('
                CREATE POLICY "Blindaje Smoke Test Write - %I" ON public.%I 
                AS RESTRICTIVE 
                FOR ALL -- Bloqueamos todo por defecto en la restrictiva
                TO authenticated 
                USING ( true ) -- Permitimos SELECT (USING siempre true para la restrictiva de lectura)
                WITH CHECK ( (auth.jwt() -> ''user_metadata'' ->> ''scope'') IS DISTINCT FROM ''smoke_test'' );
            ', t, t);
            
            -- Para DELETE, la restrictiva usa USING.
            EXECUTE format('
                CREATE POLICY "Blindaje Smoke Test Delete - %I" ON public.%I 
                AS RESTRICTIVE 
                FOR DELETE 
                TO authenticated 
                USING ( (auth.jwt() -> ''user_metadata'' ->> ''scope'') IS DISTINCT FROM ''smoke_test'' );
            ', t, t);
        END IF;
    END LOOP;
END $$;
