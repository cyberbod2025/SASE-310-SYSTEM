-- Migration: Hardening Smoke Tests System
-- OBJETIVO: Blindar el sistema real contra contaminación de datos de pruebas.

-- 1. Crear tabla de logs para smoke tests
CREATE TABLE IF NOT EXISTS public.smoke_test_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT,
    action TEXT,
    metadata JSONB,
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
USING ( (auth.jwt() -> 'user_metadata' ->> 'temporal') IS NOT TRUE OR public.is_staff() );

-- 2. Blindaje con Políticas RESTRICTIVE
-- Las políticas RESTRICTIVE deben cumplirse ADEMÁS de las permisivas.
-- Si el scope es 'smoke_test', estas políticas fallarán para acciones de escritura (INSERT, UPDATE, DELETE).

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
        EXECUTE format('
            DROP POLICY IF EXISTS "Blindaje Smoke Test - %I" ON public.%I;
            CREATE POLICY "Blindaje Smoke Test - %I" ON public.%I 
            AS RESTRICTIVE 
            FOR ALL 
            TO authenticated 
            USING ( (auth.jwt() -> ''user_metadata'' ->> ''scope'') IS DISTINCT FROM ''smoke_test'' )
            WITH CHECK ( (auth.jwt() -> ''user_metadata'' ->> ''scope'') IS DISTINCT FROM ''smoke_test'' );
        ', t, t, t, t);
    END LOOP;
END $$;

-- 3. Caso especial: Permitir lectura para smoke tests en algunas tablas
-- Las políticas anteriores ya permiten lectura si la condición USING se cumple.
-- Pero si el usuario tiene scope 'smoke_test', IS DISTINCT FROM 'smoke_test' es FALSO.
-- ¡UN MOMENTO! Si es FALSO, entonces se BLOQUEA la lectura también.
-- El usuario quiere: "Permitir solo lectura o entorno aislado".

-- Corregimos: Solo bloquear INSERT, UPDATE, DELETE para smoke_test.
-- SELECT debe permitirse.

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
        -- Primero borramos la anterior si existía
        EXECUTE format('DROP POLICY IF EXISTS "Blindaje Smoke Test - %I" ON public.%I;', t, t);
        
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
    END LOOP;
END $$;
