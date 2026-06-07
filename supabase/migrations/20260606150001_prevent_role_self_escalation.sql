-- SASE-310 P0: Prevenir autoescalamiento de roles
--
-- Objetivo:
--   Impedir que un usuario autenticado modifique su propio rol,
--   permisos o alcances desde el cliente. Solo los flujos autorizados
--   (invite-staff, approve-staff, system_admin RPC) pueden mutar
--   campos sensibles.
--
-- Tablas afectadas:
--   public.perfiles_usuario  — corrige WITH CHECK (era tautológico)
--   public.profiles          — agrega WITH CHECK (no existía)
--
-- No rompe:
--   AuthProvider (solo SELECT)
--   PerfilUsuario.tsx (solo actualiza nombre_completo, telefono, preferencias_dashboard)
--   Edge Functions (invoke con service_role bypassa RLS)

-- ─────────────────────────────────────────────────────────────
-- 0. Funciones Auxiliares SECURITY DEFINER para evitar recursión
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.check_perfil_usuario_unmodified(
  p_id uuid,
  p_new_rol text,
  p_new_permisos jsonb,
  p_new_alcances jsonb,
  p_new_matricula text,
  p_new_email text,
  p_new_role text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
declare
  v_old public.perfiles_usuario;
begin
  select * into v_old from public.perfiles_usuario where id = p_id;
  if not found then
    return true;
  end if;
  return (
    p_new_rol is not distinct from v_old.rol
    and p_new_permisos is not distinct from v_old.permisos
    and p_new_alcances is not distinct from v_old.alcances
    and p_new_matricula is not distinct from v_old.matricula_sase
    and p_new_email is not distinct from v_old.email
    and p_new_role is not distinct from v_old.role
  );
end;
$$;

CREATE OR REPLACE FUNCTION public.check_profile_unmodified(
  p_id uuid,
  p_new_role public.app_role
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
declare
  v_old_role public.app_role;
begin
  select role into v_old_role from public.profiles where id = p_id;
  if not found then
    return true;
  end if;
  return p_new_role is not distinct from v_old_role;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- 1. perfiles_usuario: Recrear policy de UPDATE con protección real
-- ─────────────────────────────────────────────────────────────

drop policy if exists "Usuarios actualizan su propio perfil" on public.perfiles_usuario;

create policy "Usuarios actualizan su propio perfil"
on public.perfiles_usuario
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and public.check_perfil_usuario_unmodified(id, rol, permisos, alcances, matricula_sase, email, role)
);

-- ─────────────────────────────────────────────────────────────
-- 2. profiles: Recrear policy de UPDATE con protección de role
-- ─────────────────────────────────────────────────────────────

drop policy if exists "Users can update their own profile." on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;

create policy "Users can update their own profile."
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and public.check_profile_unmodified(id, role)
);

-- ─────────────────────────────────────────────────────────────
-- 3. Verificación
-- ─────────────────────────────────────────────────────────────
-- Intentos bloqueados por RLS no generan filas. Si se requiere
-- auditoría de intentos denegados, debe hacerse desde frontend.
