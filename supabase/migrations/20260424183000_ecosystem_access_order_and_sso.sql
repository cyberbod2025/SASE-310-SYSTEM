-- Asegura acceso docente a Feria y orden estable del ecosistema SASE.

insert into public.modulos_ecosistema_roles (module_id, role, is_active)
select m.id, seeded.role, true
from public.modulos_ecosistema m
join (
  values
    ('feria', 'docente'),
    ('feria', 'docente_tutor'),
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
set is_active = true,
    starts_at = null,
    ends_at = null;

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

  v_role := lower(trim(public.get_my_role_text()));
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
  order by
    case m.key
      when 'feria' then 1
      when 'diagnostico' then 2
      when 'mate' then 3
      else 99
    end,
    m.name asc;
end;
$$;

grant execute on function public.get_modulos_ecosistema_visibles() to authenticated;
