-- ============================================
-- SASE-310: Security Hardening for Audit Log
-- Migration: 20251231_secure_audit_log
-- ============================================

-- Drop the overly permissive policy that allowed direct inserts
DROP POLICY IF EXISTS "Usuarios autenticados pueden registrar acciones" ON public.audit_log;

-- Add a restrictive policy that prevents direct inserts from client
-- Users must now use the 'log_audit' function which is SECURITY DEFINER
CREATE POLICY "No direct inserts"
ON public.audit_log
FOR INSERT
TO authenticated
WITH CHECK (false);
