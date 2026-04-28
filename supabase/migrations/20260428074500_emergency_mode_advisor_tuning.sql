-- Ajustes posteriores a advisors para Modo Emergencia.
-- Evita evaluaciones auth.* por fila y agrega indices a FKs.

create index if not exists idx_alertas_emergencia_atendida_por
  on public.alertas_emergencia (atendida_por);

create index if not exists idx_respuestas_alerta_emergencia_usuario
  on public.respuestas_alerta_emergencia (usuario_id);

drop policy if exists "Personal autorizado crea alertas de emergencia" on public.alertas_emergencia;
drop policy if exists "Docente y staff leen alertas de emergencia" on public.alertas_emergencia;
drop policy if exists "Docente y staff actualizan alertas de emergencia" on public.alertas_emergencia;
drop policy if exists "Staff responde alertas de emergencia" on public.respuestas_alerta_emergencia;
drop policy if exists "Usuarios autorizados leen respuestas de emergencia" on public.respuestas_alerta_emergencia;

create policy "Personal autorizado crea alertas de emergencia"
  on public.alertas_emergencia
  for insert
  to authenticated
  with check (
    (select auth.uid()) = docente_id
    and private.is_emergency_requester((select auth.uid()))
  );

create policy "Docente y staff leen alertas de emergencia"
  on public.alertas_emergencia
  for select
  to authenticated
  using (
    (select auth.uid()) = docente_id
    or private.is_emergency_staff((select auth.uid()))
  );

create policy "Docente y staff actualizan alertas de emergencia"
  on public.alertas_emergencia
  for update
  to authenticated
  using (
    (select auth.uid()) = docente_id
    or private.is_emergency_staff((select auth.uid()))
  )
  with check (
    (select auth.uid()) = docente_id
    or private.is_emergency_staff((select auth.uid()))
  );

create policy "Staff responde alertas de emergencia"
  on public.respuestas_alerta_emergencia
  for insert
  to authenticated
  with check (
    usuario_id = (select auth.uid())
    and private.is_emergency_staff((select auth.uid()))
  );

create policy "Usuarios autorizados leen respuestas de emergencia"
  on public.respuestas_alerta_emergencia
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.alertas_emergencia a
      where a.id = alerta_id
        and (
          a.docente_id = (select auth.uid())
          or private.is_emergency_staff((select auth.uid()))
        )
    )
  );
