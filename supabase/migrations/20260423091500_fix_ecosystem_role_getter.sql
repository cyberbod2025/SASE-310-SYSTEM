-- Corrige get_my_role_text para no depender de la columna legacy `role`
-- en public.perfiles_usuario cuando el esquema hospedado solo conserva `rol`.

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
$$;
