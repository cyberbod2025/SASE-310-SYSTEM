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
-- 1. perfiles_usuario: Recrear policy de UPDATE con protección real
-- ─────────────────────────────────────────────────────────────
-- La policy anterior tenía WITH CHECK con autorreferencias a NEW
-- (rol IS NOT DISTINCT FROM rol → siempre true). Esta nueva policy
-- compara cada campo sensible contra su valor almacenado.

drop policy if exists "Usuarios actualizan su propio perfil" on public.perfiles_usuario;

create policy "Usuarios actualizan su propio perfil"
on public.perfiles_usuario
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and (rol, permisos, alcances, matricula_sase, email, role)
      is not distinct from (
        select p.rol, p.permisos, p.alcances, p.matricula_sase, p.email, p.role
        from public.perfiles_usuario p
        where p.id = auth.uid()
      )
);

-- ─────────────────────────────────────────────────────────────
-- 2. profiles: Recrear policy de UPDATE con protección de role
-- ─────────────────────────────────────────────────────────────
-- La policy anterior no tenía WITH CHECK, permitiendo cambiar role.

drop policy if exists "Users can update their own profile." on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;

create policy "Users can update their own profile."
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role is not distinct from (
    select p.role from public.profiles p where p.id = auth.uid()
  )
);

-- ─────────────────────────────────────────────────────────────
-- 3. Verificación
-- ─────────────────────────────────────────────────────────────
-- Intentos bloqueados por RLS no generan filas. Si se requiere
-- auditoría de intentos denegados, debe hacerse desde frontend.
