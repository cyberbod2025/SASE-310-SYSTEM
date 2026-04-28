-- Modo Emergencia SASE-310.
-- Sistema institucional de alerta inmediata con RLS basado en perfiles_usuario.

create table if not exists public.alertas_emergencia (
  id uuid primary key default gen_random_uuid(),
  tipo_alerta text not null check (tipo_alerta in ('medica', 'seguridad', 'violencia', 'emocional', 'otros')),
  descripcion_opcional text,
  grupo text,
  aula text,
  docente_id uuid not null references auth.users(id),
  docente_nombre text not null,
  estado text not null default 'activa' check (estado in ('activa', 'atendida', 'cancelada')),
  prioridad text not null default 'alta' check (prioridad in ('media', 'alta', 'critica')),
  protocolo_activado text,
  metadata jsonb not null default '{}'::jsonb,
  escalado_nivel int not null default 0 check (escalado_nivel in (0, 1, 2)),
  ultima_notificacion_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  atendida_at timestamptz,
  cerrada_at timestamptz,
  atendida_por uuid references auth.users(id),
  tiempo_respuesta_seg int check (tiempo_respuesta_seg is null or tiempo_respuesta_seg >= 0)
);

create table if not exists public.respuestas_alerta_emergencia (
  id uuid primary key default gen_random_uuid(),
  alerta_id uuid not null references public.alertas_emergencia(id) on delete cascade,
  usuario_id uuid not null references auth.users(id),
  usuario_nombre text not null,
  rol text not null,
  respuesta text not null check (respuesta in ('enterado', 'voy_en_camino', 'no_disponible', 'atendida')),
  created_at timestamptz not null default now(),
  unique (alerta_id, usuario_id, respuesta)
);

create index if not exists idx_alertas_emergencia_estado_created
  on public.alertas_emergencia (estado, created_at desc);

create index if not exists idx_alertas_emergencia_docente_estado
  on public.alertas_emergencia (docente_id, estado);

create index if not exists idx_respuestas_alerta_emergencia_alerta
  on public.respuestas_alerta_emergencia (alerta_id, created_at desc);

create index if not exists idx_alertas_emergencia_atendida_por
  on public.alertas_emergencia (atendida_por);

create index if not exists idx_respuestas_alerta_emergencia_usuario
  on public.respuestas_alerta_emergencia (usuario_id);

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

alter table public.alertas_emergencia enable row level security;
alter table public.respuestas_alerta_emergencia enable row level security;

create or replace function private.is_emergency_staff(p_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.perfiles_usuario p
    where p.id = p_user_id
      and lower(trim(p.rol)) in (
        'directivo',
        'subdireccion',
        'prefectura',
        'medico_escolar',
        'orientacion',
        'trabajo_social',
        'system_admin',
        'developer',
        'admin'
      )
      and coalesce(p.estado_cuenta, 'activo') = 'activo'
      and coalesce(p.seguridad_status, 'active') = 'active'
  );
$$;

create or replace function private.is_emergency_requester(p_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.perfiles_usuario p
    where p.id = p_user_id
      and lower(trim(p.rol)) in (
        'docente',
        'docente_tutor',
        'directivo',
        'subdireccion',
        'prefectura',
        'medico_escolar',
        'orientacion',
        'trabajo_social',
        'system_admin',
        'developer',
        'admin'
      )
      and coalesce(p.estado_cuenta, 'activo') = 'activo'
      and coalesce(p.seguridad_status, 'active') = 'active'
  );
$$;

drop policy if exists "Docentes pueden crear alertas de emergencia" on public.alertas_emergencia;
drop policy if exists "Docentes ven sus propias alertas" on public.alertas_emergencia;
drop policy if exists "Staff autorizado ve todas las alertas" on public.alertas_emergencia;
drop policy if exists "Actualizacion de alertas" on public.alertas_emergencia;
drop policy if exists "Staff responde alertas" on public.respuestas_alerta_emergencia;
drop policy if exists "Ver respuestas de alertas" on public.respuestas_alerta_emergencia;

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

create or replace function private.fn_audit_emergency_alert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_role text;
begin
  select p.email, p.rol
  into v_email, v_role
  from public.perfiles_usuario p
  where p.id = coalesce(auth.uid(), new.docente_id)
  limit 1;

  insert into public.auditoria (
    usuario_id,
    email_usuario,
    rol_usuario,
    tipo_accion,
    descripcion_accion,
    tabla_objetivo,
    id_registro_objetivo,
    nuevos_valores
  ) values (
    coalesce(auth.uid(), new.docente_id),
    v_email,
    v_role,
    case when tg_op = 'INSERT' then 'EMERGENCIA_CREADA' else 'EMERGENCIA_ACTUALIZADA' end,
    'Alerta de emergencia ' || new.tipo_alerta || ' en estado ' || new.estado,
    'alertas_emergencia',
    new.id::text,
    to_jsonb(new)
  );

  return new;
end;
$$;

drop trigger if exists tr_audit_emergency_alert on public.alertas_emergencia;
create trigger tr_audit_emergency_alert
after insert or update on public.alertas_emergencia
for each row execute function private.fn_audit_emergency_alert();

revoke all on function private.is_emergency_staff(uuid) from public;
revoke all on function private.is_emergency_requester(uuid) from public;
grant execute on function private.is_emergency_staff(uuid) to authenticated;
grant execute on function private.is_emergency_requester(uuid) to authenticated;

comment on table public.alertas_emergencia is 'Tabla central de alertas de crisis SASE-310.';
comment on table public.respuestas_alerta_emergencia is 'Respuestas institucionales a alertas de emergencia.';
comment on column public.alertas_emergencia.escalado_nivel is '0 normal, 1 direccion/subdireccion, 2 global institucional.';
