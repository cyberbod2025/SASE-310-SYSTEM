-- Fix Security Advisor Warnings
-- 1. Function Search Path Mutable
DO $$
BEGIN
  -- Algunas funciones no existen en entornos limpios; se ajusta de forma condicional
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'checar_patron_incidencias' AND n.nspname = 'public'
  ) THEN
    ALTER FUNCTION public.checar_patron_incidencias() SET search_path = public;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'sandbox_detectar_patron' AND n.nspname = 'public'
  ) THEN
    ALTER FUNCTION public.sandbox_detectar_patron() SET search_path = public;
  END IF;
END $$;

-- 2. Audit Log Policies
-- Drop insecure/redundant policies
DROP POLICY IF EXISTS "Auth users view audit" ON public.audit_log;
DROP POLICY IF EXISTS "Auth users insert audit" ON public.audit_log;
-- Note: "Staff can create audit logs" and "Admins can view audit logs" might exist. I'll consolidate.
DROP POLICY IF EXISTS "Staff can create audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_log;

-- Re-create stricter policies
-- Allow any authenticated user to insert logs (needed for app activity tracking)
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_log
FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

  -- Allow users to see their own logs, o roles directivos ver todo
  CREATE POLICY "Users view own logs, Admins view all" ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('directivo', 'secretaria', 'prefectura')
  );

-- 3. Alertas Patron Policies
-- Drop insecure policy
DROP POLICY IF EXISTS "Authenticated users full access" ON public.alertas_patron;

-- Create role-based access policy
CREATE POLICY "Role-based access to alerts" ON public.alertas_patron
FOR ALL
TO authenticated
USING (
  -- User matches assigned role (case insensitive)
  LOWER(asignado_a_rol) = LOWER((SELECT role FROM public.profiles WHERE id = auth.uid()))
  OR
  -- Director sees everything
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'direccion'
)
WITH CHECK (
  -- Same condition for updates/inserts by users (if any)
  LOWER(asignado_a_rol) = LOWER((SELECT role FROM public.profiles WHERE id = auth.uid()))
  OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'direccion'
);
