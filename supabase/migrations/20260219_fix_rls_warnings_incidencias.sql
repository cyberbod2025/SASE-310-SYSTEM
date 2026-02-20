-- Fix Security Advisor Warnings for Incidencias and Sandbox tables

-- 1. Incidencias: Remove overly permissive policies
-- 'Ver Incidencias' allowed any authenticated user to see ALL incidents. Dropping it enforces 'Acceso restringido incidencias'.
DROP POLICY IF EXISTS "Ver Incidencias" ON public.incidencias;

-- 'Crear Incidencia Staff' allowed any authenticated user to create. Dropping it enforces role-based 'Docentes/Prefect create incidencias'.
DROP POLICY IF EXISTS "Crear Incidencia Staff" ON public.incidencias;

-- 2. Sandbox Alertas: Remove duplicate/permissive policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.sandbox_alertas;
DROP POLICY IF EXISTS "Sandbox full access" ON public.sandbox_alertas;

-- Create a single, clean policy for sandbox alerts (authenticated only)
CREATE POLICY "Authenticated users sandbox access" ON public.sandbox_alertas
FOR ALL
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 3. Sandbox Incidencias: Fix public access vulnerability
-- 'Sandbox Incidencias All' targeted 'public' role (including anon).
DROP POLICY IF EXISTS "Sandbox Incidencias All" ON public.sandbox_incidencias;

-- Create restricted policy (authenticated only)
CREATE POLICY "Authenticated users sandbox incidents access" ON public.sandbox_incidencias
FOR ALL
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
