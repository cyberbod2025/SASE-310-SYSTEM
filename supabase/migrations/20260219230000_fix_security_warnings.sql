-- Fix Security Advisor Warnings
-- 1. Function Search Path Mutable
ALTER FUNCTION public.checar_patron_incidencias() SET search_path = public;
ALTER FUNCTION public.sandbox_detectar_patron() SET search_path = public;

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

-- Allow users to see their own logs, or Directors/Admins to see all
CREATE POLICY "Users view own logs, Admins view all" ON public.audit_log
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR 
  (SELECT rol FROM public.profiles WHERE id = auth.uid()) IN ('direccion', 'secretaria', 'prefectura')
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
  LOWER(asignado_a_rol) = LOWER((SELECT rol FROM public.profiles WHERE id = auth.uid()))
  OR
  -- Director sees everything
  (SELECT rol FROM public.profiles WHERE id = auth.uid()) = 'direccion'
)
WITH CHECK (
  -- Same condition for updates/inserts by users (if any)
  LOWER(asignado_a_rol) = LOWER((SELECT rol FROM public.profiles WHERE id = auth.uid()))
  OR
  (SELECT rol FROM public.profiles WHERE id = auth.uid()) = 'direccion'
);
