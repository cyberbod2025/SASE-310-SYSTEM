-- Migración de Endurecimiento y Consistencia: Ecosistema SASE-Feria
-- Fecha: 2026-04-22
-- Objetivo: Reparar inconsistencias en perfiles, habilitar RLS faltante y asegurar acceso de Alumnos.

-- 1. Reparar la tabla public.profiles y su restricción de roles
alter table public.profiles 
  drop constraint if exists profiles_role_check;

do $$
begin
  -- Solo agregar CHECK si la columna es de tipo text, no enum
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'role'
      and data_type = 'text'
  ) then
    execute 'alter table public.profiles add constraint profiles_role_check check (role in (
      ''directivo'', ''subdireccion'', ''docente'', ''docente_tutor'',
      ''prefectura'', ''orientacion'', ''trabajo_social'', ''medico_escolar'',
      ''enfermeria'', ''secretaria'', ''alumno'', ''udeii'', ''promotora_lectura'',
      ''guest'', ''developer'', ''system_admin''
    ))';
  end if;
end $$;

-- Asegurar columna full_name en profiles para compatibilidad con el trigger original
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='full_name') then
    alter table public.profiles add column full_name text;
  end if;
end $$;

-- 2. Habilitar RLS en perfiles_usuario (Seguridad Crítica)
alter table public.perfiles_usuario enable row level security;

create policy "Los usuarios pueden ver su propio perfil completo"
  on public.perfiles_usuario for select
  using ( auth.uid() = id );

create policy "Personal institucional puede ver nombres y roles de otros"
  on public.perfiles_usuario for select
  using ( 
    auth.role() = 'authenticated' 
    and (public.get_my_role_text() in ('directivo', 'subdireccion', 'prefectura', 'orientacion', 'trabajo_social', 'developer', 'system_admin'))
  );

-- 3. Políticas de RLS para el Ecosistema de Módulos (Tabla modulos_ecosistema)
create policy "Modulos visibles para todos los autenticados"
  on public.modulos_ecosistema for select
  using ( auth.role() = 'authenticated' );

create policy "Solo admins pueden modificar el catalogo de modulos"
  on public.modulos_ecosistema for all
  using ( public.get_my_role_text() in ('developer', 'system_admin') );

-- 4. Políticas para modulos_ecosistema_roles y modulos_ecosistema_usuarios
create policy "Usuarios pueden ver sus propios permisos de modulos"
  on public.modulos_ecosistema_usuarios for select
  using ( auth.uid() = user_id or lower(trim(email)) = public.get_my_normalized_email() );

create policy "Todos los autenticados pueden ver las reglas de roles"
  on public.modulos_ecosistema_roles for select
  using ( auth.role() = 'authenticated' );

-- 5. Semilla de Acceso: Asegurar que Feria esté disponible para roles clave
insert into public.modulos_ecosistema_roles (module_id, role, is_active)
select m.id, seeded.role, true
from public.modulos_ecosistema m
join (
  values
    ('feria', 'docente'),
    ('feria', 'alumno'),
    ('feria', 'directivo'),
    ('feria', 'subdireccion'),
    ('feria', 'prefectura'),
    ('feria', 'orientacion'),
    ('feria', 'trabajo_social'),
    ('feria', 'developer'),
    ('feria', 'system_admin')
) as seeded(module_key, role)
  on seeded.module_key = m.key
on conflict (module_id, lower(trim(role))) do update
set is_active = true;

-- 6. Auditoría de la migración
insert into public.auditoria (
  tipo_accion,
  descripcion_accion,
  tabla_objetivo
) values (
  'MIGRACION_SISTEMA',
  'Hardening de RLS, corrección de perfiles y expansión de roles para el ecosistema SASE-Feria.',
  'profiles'
);
