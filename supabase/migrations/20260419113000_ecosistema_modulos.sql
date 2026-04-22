-- SASE-310: Catalogo, acceso y visibilidad de modulos externos del ecosistema.

create table if not exists public.modulos_ecosistema (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  base_url text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.modulos_ecosistema_roles (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modulos_ecosistema(id) on delete cascade,
  role text not null,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.modulos_ecosistema_usuarios (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modulos_ecosistema(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  constraint modulos_ecosistema_usuarios_identity_check check (
    user_id is not null or nullif(trim(email), '') is not null
  )
);

create index if not exists idx_modulos_ecosistema_key on public.modulos_ecosistema(key);
create index if not exists idx_modulos_ecosistema_roles_module_id on public.modulos_ecosistema_roles(module_id);
create index if not exists idx_modulos_ecosistema_roles_role on public.modulos_ecosistema_roles(lower(trim(role)));
create index if not exists idx_modulos_ecosistema_usuarios_module_id on public.modulos_ecosistema_usuarios(module_id);
create index if not exists idx_modulos_ecosistema_usuarios_user_id on public.modulos_ecosistema_usuarios(user_id);
create index if not exists idx_modulos_ecosistema_usuarios_email on public.modulos_ecosistema_usuarios(lower(trim(email)));

create unique index if not exists idx_modulos_ecosistema_roles_unique
  on public.modulos_ecosistema_roles(module_id, lower(trim(role)));

create unique index if not exists idx_modulos_ecosistema_usuarios_unique_user
  on public.modulos_ecosistema_usuarios(module_id, user_id)
  where user_id is not null;

create unique index if not exists idx_modulos_ecosistema_usuarios_unique_email
  on public.modulos_ecosistema_usuarios(module_id, lower(trim(email)))
  where email is not null;

alter table public.modulos_ecosistema enable row level security;
alter table public.modulos_ecosistema_roles enable row level security;
alter table public.modulos_ecosistema_usuarios enable row level security;

comment on table public.modulos_ecosistema is 'Catalogo persistente de modulos externos del ecosistema SASE.';
comment on table public.modulos_ecosistema_roles is 'Reglas de acceso por rol para modulos externos.';
comment on table public.modulos_ecosistema_usuarios is 'Reglas de acceso por usuario o correo para modulos externos.';

create or replace function public.get_my_role_text()
returns text
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_role text;
begin
  select nullif(lower(trim(coalesce(rol, role))), '')
  into v_role
  from public.perfiles_usuario
  where id = auth.uid()
  limit 1;

  if v_role is not null then
    return v_role;
  end if;

  select nullif(lower(trim(role::text)), '')
  into v_role
  from public.profiles
  where id = auth.uid()
  limit 1;

  return v_role;
end;
$$;

create or replace function public.get_my_normalized_email()
returns text
language plpgsql
security definer
set search_path = public, auth
stable
as $$
declare
  v_email text;
begin
  v_email := nullif(lower(trim(coalesce(auth.jwt() ->> 'email', ''))), '');
  if v_email is not null then
    return v_email;
  end if;

  select nullif(lower(trim(email)), '')
  into v_email
  from public.perfiles_usuario
  where id = auth.uid()
  limit 1;

  if v_email is not null then
    return v_email;
  end if;

  select nullif(lower(trim(email::text)), '')
  into v_email
  from auth.users
  where id = auth.uid()
  limit 1;

  return v_email;
end;
$$;

create or replace function public.get_modulos_ecosistema_visibles()
returns table (
  id uuid,
  key text,
  name text,
  is_active boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
stable
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_email text;
begin
  if v_user_id is null then
    return;
  end if;

  v_role := public.get_my_role_text();
  v_email := public.get_my_normalized_email();

  return query
  with role_access as (
    select distinct mr.module_id
    from public.modulos_ecosistema_roles mr
    where mr.is_active = true
      and v_role is not null
      and lower(trim(mr.role)) = v_role
      and (mr.starts_at is null or mr.starts_at <= now())
      and (mr.ends_at is null or mr.ends_at >= now())
  ),
  user_access as (
    select distinct mu.module_id
    from public.modulos_ecosistema_usuarios mu
    where mu.is_active = true
      and (
        (mu.user_id is not null and mu.user_id = v_user_id)
        or (
          mu.email is not null
          and v_email is not null
          and lower(trim(mu.email)) = v_email
        )
      )
      and (mu.starts_at is null or mu.starts_at <= now())
      and (mu.ends_at is null or mu.ends_at >= now())
  )
  select m.id, m.key, m.name, m.is_active, m.created_at
  from public.modulos_ecosistema m
  where m.is_active = true
    and (
      exists (select 1 from role_access ra where ra.module_id = m.id)
      or exists (select 1 from user_access ua where ua.module_id = m.id)
    )
  order by m.created_at asc, m.name asc;
end;
$$;

revoke all on function public.get_my_role_text() from public;
revoke all on function public.get_my_normalized_email() from public;
revoke all on function public.get_modulos_ecosistema_visibles() from public;
grant execute on function public.get_my_role_text() to authenticated;
grant execute on function public.get_my_normalized_email() to authenticated;
grant execute on function public.get_modulos_ecosistema_visibles() to authenticated;

insert into public.modulos_ecosistema (key, name, base_url, is_active)
values
  ('feria', 'Feria de Ciencias', 'http://localhost:3000/#/docente', true),
  ('diagnostico', 'Diagnostico Colectivo', 'http://localhost:3001/', true),
  ('mate', 'Mate', 'http://localhost:3002/', true)
on conflict (key) do update
set
  name = excluded.name,
  base_url = excluded.base_url,
  is_active = excluded.is_active;

insert into public.modulos_ecosistema_roles (module_id, role, is_active)
select m.id, seeded.role, true
from public.modulos_ecosistema m
join (
  values
    ('diagnostico', 'docente'),
    ('diagnostico', 'docente_tutor'),
    ('diagnostico', 'directivo'),
    ('diagnostico', 'subdireccion'),
    ('diagnostico', 'orientacion'),
    ('diagnostico', 'trabajo_social'),
    ('diagnostico', 'developer'),
    ('diagnostico', 'system_admin'),
    ('diagnostico', 'admin'),
    ('mate', 'guest'),
    ('mate', 'docente'),
    ('mate', 'docente_tutor'),
    ('mate', 'prefectura'),
    ('mate', 'orientacion'),
    ('mate', 'trabajo_social'),
    ('mate', 'medico_escolar'),
    ('mate', 'udeii'),
    ('mate', 'promotora_lectura'),
    ('mate', 'secretaria'),
    ('mate', 'directivo'),
    ('mate', 'subdireccion'),
    ('mate', 'developer'),
    ('mate', 'system_admin'),
    ('mate', 'admin')
) as seeded(module_key, role)
  on seeded.module_key = m.key
on conflict do nothing;

do $$
declare
  v_feria_module_id uuid;
begin
  select id into v_feria_module_id
  from public.modulos_ecosistema
  where key = 'feria'
  limit 1;

  if v_feria_module_id is not null
     and exists (
       select 1
       from information_schema.tables
       where table_schema = 'public'
         and table_name = 'feria_pilotos'
     ) then
    insert into public.modulos_ecosistema_usuarios (
      module_id,
      email,
      is_active,
      created_by,
      created_at
    )
    select
      v_feria_module_id,
      nullif(lower(trim(fp.email)), ''),
      coalesce(fp.activo, true),
      fp.created_by,
      coalesce(fp.created_at, now())
    from public.feria_pilotos fp
    where nullif(trim(fp.email), '') is not null
    on conflict do nothing;
  end if;
end $$;

insert into public.auditoria (
  tipo_accion,
  descripcion_accion,
  tabla_objetivo
) values (
  'MIGRACION_SISTEMA',
  'Catalogo de modulos externos, reglas de acceso y RPC de visibilidad creados para el ecosistema SASE.',
  'modulos_ecosistema'
);
