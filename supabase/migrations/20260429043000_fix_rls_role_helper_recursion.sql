-- Corrige recursion RLS al resolver rol/perfil del usuario actual.
-- La carga inicial de perfiles, alumnos y modulos fallaba con stack depth limit exceeded.

create or replace function public.get_my_role_text()
returns text
language plpgsql
stable
security definer
set search_path to 'public', 'auth'
as $function$
declare
  v_role text;
begin
  select nullif(lower(trim(rol)), '')
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
$function$;

create or replace function public.get_my_role()
returns public.app_role
language plpgsql
stable
security definer
set search_path to 'public', 'auth'
as $function$
declare
  _role_text text;
  _role public.app_role;
begin
  select rol
  into _role_text
  from public.perfiles_usuario
  where id = auth.uid()
  limit 1;

  if _role_text is null then
    select role::text
    into _role_text
    from public.profiles
    where id = auth.uid()
    limit 1;
  end if;

  begin
    _role := _role_text::public.app_role;
  exception when others then
    _role := null;
  end;

  return _role;
end;
$function$;

create or replace function public.get_user_role()
returns text
language sql
stable
security definer
set search_path to 'public', 'auth'
as $function$
  select rol from public.perfiles_usuario where id = auth.uid();
$function$;

create or replace function public.get_my_normalized_email()
returns text
language plpgsql
stable
security definer
set search_path to 'public', 'auth'
as $function$
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
$function$;

create or replace function public.is_staff()
returns boolean
language plpgsql
stable
security definer
set search_path to 'public', 'auth'
as $function$
declare
  v_role text;
begin
  select coalesce(rol::text, role::text)
  into v_role
  from public.perfiles_usuario
  where id = auth.uid();

  return v_role in (
    'directivo', 'docente', 'docente_tutor', 'prefectura',
    'orientacion', 'trabajo_social', 'enfermeria', 'secretaria',
    'medico_escolar', 'udeii', 'promotora_lectura', 'subdireccion',
    'admin', 'system_admin'
  );
end;
$function$;

create or replace function public.is_current_user_smoke_test()
returns boolean
language sql
stable
security definer
set search_path to 'public', 'auth'
as $function$
  select coalesce((
    select es_test
    from public.perfiles_usuario
    where id = auth.uid()
    limit 1
  ), false);
$function$;

drop policy if exists "Blindaje Smoke Test Delete - perfiles_usuario" on public.perfiles_usuario;
create policy "Blindaje Smoke Test Delete - perfiles_usuario"
on public.perfiles_usuario
as restrictive
for delete
to authenticated
using (not public.is_current_user_smoke_test());

drop policy if exists "Blindaje Smoke Test Write - perfiles_usuario" on public.perfiles_usuario;
create policy "Blindaje Smoke Test Write - perfiles_usuario"
on public.perfiles_usuario
as restrictive
for all
to authenticated
using (true)
with check (not public.is_current_user_smoke_test());
