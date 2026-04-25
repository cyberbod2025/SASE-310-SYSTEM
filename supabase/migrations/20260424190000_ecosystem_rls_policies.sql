-- Restituye políticas RLS del catálogo del ecosistema sin duplicarlas.

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'modulos_ecosistema'
      and policyname = 'Modulos visibles para usuarios autenticados'
  ) then
    create policy "Modulos visibles para usuarios autenticados"
      on public.modulos_ecosistema
      for select
      using (auth.role() = 'authenticated');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'modulos_ecosistema_roles'
      and policyname = 'Reglas de roles visibles para usuarios autenticados'
  ) then
    create policy "Reglas de roles visibles para usuarios autenticados"
      on public.modulos_ecosistema_roles
      for select
      using (auth.role() = 'authenticated');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'modulos_ecosistema_usuarios'
      and policyname = 'Usuarios ven sus propias reglas de ecosistema'
  ) then
    create policy "Usuarios ven sus propias reglas de ecosistema"
      on public.modulos_ecosistema_usuarios
      for select
      using (
        auth.uid() = user_id
        or lower(trim(email)) = public.get_my_normalized_email()
      );
  end if;
end $$;
