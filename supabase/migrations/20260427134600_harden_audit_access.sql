-- Migration: Harden Audit Access
-- OBJETIVO: Restringir el acceso a tablas de auditoría solo a roles de alto nivel (Director, Admin, Dev).

-- 1. Asegurar tabla audit_logs (nueva)
DROP POLICY IF EXISTS "Audit logs are viewable by directivos" ON public.audit_logs;

CREATE POLICY "Audit logs restricted view" ON public.audit_logs
FOR SELECT TO authenticated USING (
    (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() ->> 'role'))::text 
    IN ('directivo', 'system_admin', 'developer')
);

-- 2. Asegurar tabla auditoria (unificada)
DROP POLICY IF EXISTS "Users view own logs, Admins view all" ON public.auditoria;
DROP POLICY IF EXISTS "Admins view all" ON public.auditoria;

CREATE POLICY "Auditoria restricted view" ON public.auditoria
FOR SELECT TO authenticated USING (
    (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() ->> 'role'))::text 
    IN ('directivo', 'system_admin', 'developer')
);

-- 3. Asegurar sase_alerts (Alertas de seguridad)
DROP POLICY IF EXISTS "Alerts are viewable by all staff" ON public.sase_alerts;

CREATE POLICY "Security alerts restricted view" ON public.sase_alerts
FOR SELECT TO authenticated USING (
    (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() ->> 'role'))::text 
    IN ('directivo', 'system_admin', 'developer')
);

COMMENT ON TABLE public.audit_logs IS 'Bitácora de auditoría restringida a Directivos, Administradores y Desarrolladores.';
COMMENT ON TABLE public.auditoria IS 'Histórico unificado de auditoría restringido a roles institucionales de alto nivel.';
