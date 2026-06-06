-- Migration: Prevent Role, Permission, and Scope Self-Escalation
-- Date: 2026-06-06
-- Objective: Ensure users cannot update their own roles, permissions, or scopes via client updates.

-- 1. Hardening on public.perfiles_usuario
DROP POLICY IF EXISTS "Usuarios actualizan su propio perfil" ON public.perfiles_usuario;

CREATE POLICY "Usuarios actualizan su propio perfil" ON public.perfiles_usuario
  FOR UPDATE
  TO authenticated
  USING ( (SELECT auth.uid()) = id )
  WITH CHECK (
    (SELECT auth.uid()) = id
    AND (
      rol IS NOT DISTINCT FROM (SELECT rol FROM public.perfiles_usuario WHERE id = (SELECT auth.uid()))
      AND role IS NOT DISTINCT FROM (SELECT role FROM public.perfiles_usuario WHERE id = (SELECT auth.uid()))
      AND email IS NOT DISTINCT FROM (SELECT email FROM public.perfiles_usuario WHERE id = (SELECT auth.uid()))
      AND matricula_sase IS NOT DISTINCT FROM (SELECT matricula_sase FROM public.perfiles_usuario WHERE id = (SELECT auth.uid()))
      AND permisos IS NOT DISTINCT FROM (SELECT permisos FROM public.perfiles_usuario WHERE id = (SELECT auth.uid()))
      AND alcances IS NOT DISTINCT FROM (SELECT alcances FROM public.perfiles_usuario WHERE id = (SELECT auth.uid()))
    )
  );

-- 2. Hardening on public.profiles
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ( (SELECT auth.uid()) = id )
  WITH CHECK (
    (SELECT auth.uid()) = id
    AND role IS NOT DISTINCT FROM (SELECT role FROM public.profiles WHERE id = (SELECT auth.uid()))
  );
