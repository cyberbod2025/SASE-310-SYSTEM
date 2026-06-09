-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Harden RLS SECURITY DEFINER helpers
-- Date:      2026-06-08
-- PR:        #91 – fix/security-prevent-role-self-escalation
--
-- What this fixes (relative to 20260606150001):
--   1. Moves check_perfil_usuario_unmodified & check_profile_unmodified
--      from public → private schema so they are NOT exposed as Supabase
--      RPC endpoints.
--   2. Adds missing immutable-field checks:
--        • seguridad_status  (TEXT)    – security block flag
--        • blocked_until     (TIMESTAMPTZ) – temporal block
--        • grupo_tutor       (TEXT)    – tutor group scope
--        • grupos            (TEXT[])  – group array scope
--        • estado_cuenta     (TEXT)    – account status
--        • risk_score        (NUMERIC) – risk score
--   3. Adds SET search_path = '' to each SECURITY DEFINER function.
--   4. REVOKEs execution from PUBLIC / anon.
--   5. GRANTs execution to postgres and authenticated (RLS policies evaluate
--      as the calling user, so authenticated needs EXECUTE, but being in
--      private schema prevents RPC exposure).
--   6. Drops the old public-schema versions.
--   7. Recreates RLS policies referencing private.* helpers.
--
-- Recursion safety:
--   The helpers use SECURITY DEFINER to bypass RLS when reading
--   the "old" row, exactly like the 20260606150001 migration.
--   No SELECT subquery inside the WITH CHECK clause itself, so
--   no infinite recursion.
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 0. Ensure private schema exists (idempotent)
-- ───────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS private;

-- ───────────────────────────────────────────────────────────────
-- 1. Create hardened helper: private.check_perfil_usuario_unmodified
--
--    Protected fields (10 total):
--      rol, permisos, alcances, matricula_sase, email, role,
--      seguridad_status, blocked_until, grupo_tutor, grupos,
--      estado_cuenta, risk_score
-- ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION private.check_perfil_usuario_unmodified(
  p_id                uuid,
  p_new_rol           text,
  p_new_permisos      jsonb,
  p_new_alcances      jsonb,
  p_new_matricula     text,
  p_new_email         text,
  p_new_role          text,
  p_new_seguridad     text,
  p_new_blocked_until timestamptz,
  p_new_grupo_tutor   text,
  p_new_grupos        text[],
  p_new_estado_cuenta text,
  p_new_risk_score    numeric
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_old public.perfiles_usuario;
BEGIN
  SELECT * INTO v_old FROM public.perfiles_usuario WHERE id = p_id;
  IF NOT FOUND THEN
    RETURN true;                      -- new row → allow INSERT policies
  END IF;
  RETURN (
        p_new_rol           IS NOT DISTINCT FROM v_old.rol
    AND p_new_permisos      IS NOT DISTINCT FROM v_old.permisos
    AND p_new_alcances      IS NOT DISTINCT FROM v_old.alcances
    AND p_new_matricula     IS NOT DISTINCT FROM v_old.matricula_sase
    AND p_new_email         IS NOT DISTINCT FROM v_old.email
    AND p_new_role          IS NOT DISTINCT FROM v_old.role
    AND p_new_seguridad     IS NOT DISTINCT FROM v_old.seguridad_status
    AND p_new_blocked_until IS NOT DISTINCT FROM v_old.blocked_until
    AND p_new_grupo_tutor   IS NOT DISTINCT FROM v_old.grupo_tutor
    AND p_new_grupos        IS NOT DISTINCT FROM v_old.grupos
    AND p_new_estado_cuenta IS NOT DISTINCT FROM v_old.estado_cuenta
    AND p_new_risk_score    IS NOT DISTINCT FROM v_old.risk_score
  );
END;
$$;

-- ───────────────────────────────────────────────────────────────
-- 2. Create hardened helper: private.check_profile_unmodified
--
--    Protected fields: role (app_role enum)
-- ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION private.check_profile_unmodified(
  p_id       uuid,
  p_new_role public.app_role
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_old_role public.app_role;
BEGIN
  SELECT role INTO v_old_role FROM public.profiles WHERE id = p_id;
  IF NOT FOUND THEN
    RETURN true;
  END IF;
  RETURN p_new_role IS NOT DISTINCT FROM v_old_role;
END;
$$;

-- ───────────────────────────────────────────────────────────────
-- 3. Lock down execution on the new private functions
-- ───────────────────────────────────────────────────────────────
REVOKE ALL ON FUNCTION private.check_perfil_usuario_unmodified(
  uuid, text, jsonb, jsonb, text, text, text, text, timestamptz, text, text[], text, numeric
) FROM PUBLIC, anon;

REVOKE ALL ON FUNCTION private.check_profile_unmodified(
  uuid, public.app_role
) FROM PUBLIC, anon;

-- RLS policies evaluate as the calling user, so authenticated needs EXECUTE.
-- The private schema ensures PostgREST does not expose them as RPC.
GRANT EXECUTE ON FUNCTION private.check_perfil_usuario_unmodified(
  uuid, text, jsonb, jsonb, text, text, text, text, timestamptz, text, text[], text, numeric
) TO postgres, authenticated;

GRANT EXECUTE ON FUNCTION private.check_profile_unmodified(
  uuid, public.app_role
) TO postgres, authenticated;

-- ───────────────────────────────────────────────────────────────
-- 4. Recreate RLS policies using private.* helpers
-- ───────────────────────────────────────────────────────────────

-- 4a. perfiles_usuario UPDATE policy
DROP POLICY IF EXISTS "Usuarios actualizan su propio perfil" ON public.perfiles_usuario;

CREATE POLICY "Usuarios actualizan su propio perfil"
ON public.perfiles_usuario
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND private.check_perfil_usuario_unmodified(
    id,
    rol,
    permisos,
    alcances,
    matricula_sase,
    email,
    role,
    seguridad_status,
    blocked_until,
    grupo_tutor,
    grupos,
    estado_cuenta,
    risk_score
  )
);

-- 4b. profiles UPDATE policy
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile."
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND private.check_profile_unmodified(id, role)
);

-- ───────────────────────────────────────────────────────────────
-- 5. Drop the old public-schema helper functions
--    (They are no longer referenced by any policy.)
-- ───────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.check_perfil_usuario_unmodified(
  uuid, text, jsonb, jsonb, text, text, text
);

DROP FUNCTION IF EXISTS public.check_profile_unmodified(
  uuid, public.app_role
);

-- ───────────────────────────────────────────────────────────────
-- 6. Verification comments
-- ───────────────────────────────────────────────────────────────
-- ✅ Helpers are in the `private` schema (not RPC-accessible)
-- ✅ SECURITY DEFINER with SET search_path = '' on both functions
-- ✅ REVOKE ALL FROM PUBLIC, anon on both functions
-- ✅ GRANT EXECUTE to postgres and authenticated (for RLS policy evaluation)
-- ✅ 12 fields frozen on perfiles_usuario:
--      rol, permisos, alcances, matricula_sase, email, role,
--      seguridad_status, blocked_until, grupo_tutor, grupos,
--      estado_cuenta, risk_score
-- ✅ 1 field frozen on profiles: role
-- ✅ No recursion: helpers use SECURITY DEFINER to bypass RLS
-- ✅ Old public.check_* functions dropped
