-- 2024-10-02: RLS para notificaciones
alter table public.notificaciones enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notificaciones'
      and policyname = 'notificaciones_read_rol_destino'
  ) then
    create policy "notificaciones_read_rol_destino"
      on public.notificaciones
      for select
      using (rol_destino = (auth.jwt() ->> 'role'));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notificaciones'
      and policyname = 'notificaciones_insert_service_role'
  ) then
    create policy "notificaciones_insert_service_role"
      on public.notificaciones
      for insert
      with check (auth.role() = 'service_role');
  end if;
end
$$;
