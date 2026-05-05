-- Orientacion v2: backend institucional minimo.
-- Diagnostico previo: no existen tablas de caso/plan/diagnostico de Orientacion.
-- Se reutilizan alumnos, incidencias, expediente_integral_alumno, citas_padres,
-- contacts_log, interventions_log y seguimiento_social sin duplicar su dominio.

create table if not exists public.orientacion_casos (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid not null references public.alumnos(id) on delete cascade,
  creado_por uuid references public.perfiles_usuario(id) on delete set null,
  responsable_id uuid references public.perfiles_usuario(id) on delete set null,
  estado text not null default 'recibido',
  prioridad text not null default 'media',
  motivo text not null,
  resumen text,
  fecha_apertura timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now(),
  constraint orientacion_casos_estado_check check (estado in (
    'recibido',
    'en_analisis',
    'diagnostico_solicitado',
    'plan_definido',
    'derivado_trabajo_social',
    'escalado_direccion',
    'cerrado'
  )),
  constraint orientacion_casos_prioridad_check check (prioridad in ('baja', 'media', 'alta', 'critica'))
);

create table if not exists public.solicitudes_diagnostico (
  id uuid primary key default gen_random_uuid(),
  caso_id uuid not null references public.orientacion_casos(id) on delete cascade,
  docente_id uuid not null references public.perfiles_usuario(id) on delete cascade,
  alumno_id uuid not null references public.alumnos(id) on delete cascade,
  estado text not null default 'pendiente',
  fecha_solicitud timestamptz not null default now(),
  fecha_respuesta timestamptz,
  observaciones text,
  constraint solicitudes_diagnostico_estado_check check (estado in ('pendiente', 'respondido', 'vencido'))
);

create table if not exists public.diagnosticos_docentes (
  id uuid primary key default gen_random_uuid(),
  solicitud_id uuid not null references public.solicitudes_diagnostico(id) on delete cascade,
  caso_id uuid not null references public.orientacion_casos(id) on delete cascade,
  docente_id uuid not null references public.perfiles_usuario(id) on delete cascade,
  conducta text,
  aprovechamiento text,
  asistencia text,
  observaciones text,
  recomendaciones text,
  created_at timestamptz not null default now(),
  constraint diagnosticos_docentes_solicitud_unique unique (solicitud_id)
);

create table if not exists public.planes_intervencion (
  id uuid primary key default gen_random_uuid(),
  caso_id uuid not null references public.orientacion_casos(id) on delete cascade,
  objetivo text not null,
  acciones text not null,
  responsable text not null,
  fecha_inicio date not null default current_date,
  fecha_revision date,
  estado text not null default 'activo',
  constraint planes_intervencion_estado_check check (estado in ('borrador', 'activo', 'en_revision', 'ajustado', 'concluido'))
);

create table if not exists public.seguimiento_orientacion (
  id uuid primary key default gen_random_uuid(),
  caso_id uuid not null references public.orientacion_casos(id) on delete cascade,
  tipo text not null,
  descripcion text not null,
  evidencia_url text,
  created_by uuid references public.perfiles_usuario(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint seguimiento_orientacion_tipo_check check (tipo in (
    'nota',
    'entrevista',
    'diagnostico',
    'plan',
    'derivacion',
    'escalamiento',
    'evidencia'
  ))
);

create index if not exists idx_orientacion_casos_alumno on public.orientacion_casos(alumno_id);
create index if not exists idx_orientacion_casos_responsable on public.orientacion_casos(responsable_id);
create index if not exists idx_orientacion_casos_estado on public.orientacion_casos(estado);
create index if not exists idx_solicitudes_diagnostico_caso on public.solicitudes_diagnostico(caso_id);
create index if not exists idx_solicitudes_diagnostico_docente on public.solicitudes_diagnostico(docente_id);
create index if not exists idx_solicitudes_diagnostico_alumno on public.solicitudes_diagnostico(alumno_id);
create index if not exists idx_diagnosticos_docentes_caso on public.diagnosticos_docentes(caso_id);
create index if not exists idx_diagnosticos_docentes_docente on public.diagnosticos_docentes(docente_id);
create index if not exists idx_planes_intervencion_caso on public.planes_intervencion(caso_id);
create index if not exists idx_seguimiento_orientacion_caso on public.seguimiento_orientacion(caso_id);
create index if not exists idx_seguimiento_orientacion_created_by on public.seguimiento_orientacion(created_by);

create or replace function public.set_orientacion_fecha_actualizacion()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.fecha_actualizacion = now();
  return new;
end;
$$;

drop trigger if exists tr_orientacion_casos_fecha_actualizacion on public.orientacion_casos;
create trigger tr_orientacion_casos_fecha_actualizacion
before update on public.orientacion_casos
for each row execute function public.set_orientacion_fecha_actualizacion();

alter table public.orientacion_casos enable row level security;
alter table public.solicitudes_diagnostico enable row level security;
alter table public.diagnosticos_docentes enable row level security;
alter table public.planes_intervencion enable row level security;
alter table public.seguimiento_orientacion enable row level security;

grant select, insert, update on public.orientacion_casos to authenticated;
grant select, insert, update on public.solicitudes_diagnostico to authenticated;
grant select, insert on public.diagnosticos_docentes to authenticated;
grant select, insert, update on public.planes_intervencion to authenticated;
grant select, insert on public.seguimiento_orientacion to authenticated;
grant all on public.orientacion_casos to service_role;
grant all on public.solicitudes_diagnostico to service_role;
grant all on public.diagnosticos_docentes to service_role;
grant all on public.planes_intervencion to service_role;
grant all on public.seguimiento_orientacion to service_role;

drop policy if exists "Admin total orientacion casos" on public.orientacion_casos;
create policy "Admin total orientacion casos"
on public.orientacion_casos
for all
to authenticated
using (public.get_my_role_text() in ('developer', 'system_admin'))
with check (public.get_my_role_text() in ('developer', 'system_admin'));

drop policy if exists "Orientacion ve sus casos" on public.orientacion_casos;
create policy "Orientacion ve sus casos"
on public.orientacion_casos
for select
to authenticated
using (
  public.get_my_role_text() = 'orientacion'
  and (creado_por = auth.uid() or responsable_id = auth.uid())
);

drop policy if exists "Direccion subdireccion ven casos orientacion" on public.orientacion_casos;
create policy "Direccion subdireccion ven casos orientacion"
on public.orientacion_casos
for select
to authenticated
using (public.get_my_role_text() in ('directivo', 'subdireccion'));

drop policy if exists "Trabajo social ve derivados orientacion" on public.orientacion_casos;
create policy "Trabajo social ve derivados orientacion"
on public.orientacion_casos
for select
to authenticated
using (
  public.get_my_role_text() = 'trabajo_social'
  and estado = 'derivado_trabajo_social'
);

drop policy if exists "Orientacion crea sus casos" on public.orientacion_casos;
create policy "Orientacion crea sus casos"
on public.orientacion_casos
for insert
to authenticated
with check (
  public.get_my_role_text() = 'orientacion'
  and creado_por = auth.uid()
  and (responsable_id is null or responsable_id = auth.uid())
  and estado <> 'cerrado'
);

drop policy if exists "Orientacion edita sus casos sin cierre" on public.orientacion_casos;
create policy "Orientacion edita sus casos sin cierre"
on public.orientacion_casos
for update
to authenticated
using (
  public.get_my_role_text() = 'orientacion'
  and (creado_por = auth.uid() or responsable_id = auth.uid())
)
with check (
  public.get_my_role_text() = 'orientacion'
  and (creado_por = auth.uid() or responsable_id = auth.uid())
  and estado <> 'cerrado'
);

drop policy if exists "Admin total solicitudes diagnostico" on public.solicitudes_diagnostico;
create policy "Admin total solicitudes diagnostico"
on public.solicitudes_diagnostico
for all
to authenticated
using (public.get_my_role_text() in ('developer', 'system_admin'))
with check (public.get_my_role_text() in ('developer', 'system_admin'));

drop policy if exists "Orientacion gestiona solicitudes diagnostico" on public.solicitudes_diagnostico;
create policy "Orientacion gestiona solicitudes diagnostico"
on public.solicitudes_diagnostico
for all
to authenticated
using (
  public.get_my_role_text() = 'orientacion'
  and exists (
    select 1
    from public.orientacion_casos c
    where c.id = caso_id
      and (c.creado_por = auth.uid() or c.responsable_id = auth.uid())
  )
)
with check (
  public.get_my_role_text() = 'orientacion'
  and exists (
    select 1
    from public.orientacion_casos c
    where c.id = caso_id
      and (c.creado_por = auth.uid() or c.responsable_id = auth.uid())
  )
);

drop policy if exists "Direccion subdireccion ven solicitudes diagnostico" on public.solicitudes_diagnostico;
create policy "Direccion subdireccion ven solicitudes diagnostico"
on public.solicitudes_diagnostico
for select
to authenticated
using (public.get_my_role_text() in ('directivo', 'subdireccion'));

drop policy if exists "Docente responde solicitudes asignadas" on public.solicitudes_diagnostico;
create policy "Docente responde solicitudes asignadas"
on public.solicitudes_diagnostico
for select
to authenticated
using (
  public.get_my_role_text() in ('docente', 'docente_tutor')
  and docente_id = auth.uid()
);

drop policy if exists "Docente actualiza solicitudes asignadas" on public.solicitudes_diagnostico;
create policy "Docente actualiza solicitudes asignadas"
on public.solicitudes_diagnostico
for update
to authenticated
using (
  public.get_my_role_text() in ('docente', 'docente_tutor')
  and docente_id = auth.uid()
)
with check (
  public.get_my_role_text() in ('docente', 'docente_tutor')
  and docente_id = auth.uid()
);

drop policy if exists "Admin total diagnosticos docentes" on public.diagnosticos_docentes;
create policy "Admin total diagnosticos docentes"
on public.diagnosticos_docentes
for all
to authenticated
using (public.get_my_role_text() in ('developer', 'system_admin'))
with check (public.get_my_role_text() in ('developer', 'system_admin'));

drop policy if exists "Orientacion ve diagnosticos de sus casos" on public.diagnosticos_docentes;
create policy "Orientacion ve diagnosticos de sus casos"
on public.diagnosticos_docentes
for select
to authenticated
using (
  public.get_my_role_text() = 'orientacion'
  and exists (
    select 1
    from public.orientacion_casos c
    where c.id = caso_id
      and (c.creado_por = auth.uid() or c.responsable_id = auth.uid())
  )
);

drop policy if exists "Direccion subdireccion ven diagnosticos" on public.diagnosticos_docentes;
create policy "Direccion subdireccion ven diagnosticos"
on public.diagnosticos_docentes
for select
to authenticated
using (public.get_my_role_text() in ('directivo', 'subdireccion'));

drop policy if exists "Docente inserta diagnostico asignado" on public.diagnosticos_docentes;
create policy "Docente inserta diagnostico asignado"
on public.diagnosticos_docentes
for insert
to authenticated
with check (
  public.get_my_role_text() in ('docente', 'docente_tutor')
  and docente_id = auth.uid()
  and exists (
    select 1
    from public.solicitudes_diagnostico s
    where s.id = solicitud_id
      and s.caso_id = caso_id
      and s.docente_id = auth.uid()
      and s.estado = 'pendiente'
  )
);

drop policy if exists "Docente ve diagnostico propio" on public.diagnosticos_docentes;
create policy "Docente ve diagnostico propio"
on public.diagnosticos_docentes
for select
to authenticated
using (
  public.get_my_role_text() in ('docente', 'docente_tutor')
  and docente_id = auth.uid()
);

drop policy if exists "Admin total planes intervencion" on public.planes_intervencion;
create policy "Admin total planes intervencion"
on public.planes_intervencion
for all
to authenticated
using (public.get_my_role_text() in ('developer', 'system_admin'))
with check (public.get_my_role_text() in ('developer', 'system_admin'));

drop policy if exists "Orientacion gestiona planes propios" on public.planes_intervencion;
create policy "Orientacion gestiona planes propios"
on public.planes_intervencion
for all
to authenticated
using (
  public.get_my_role_text() = 'orientacion'
  and exists (
    select 1
    from public.orientacion_casos c
    where c.id = caso_id
      and (c.creado_por = auth.uid() or c.responsable_id = auth.uid())
      and c.estado <> 'cerrado'
  )
)
with check (
  public.get_my_role_text() = 'orientacion'
  and exists (
    select 1
    from public.orientacion_casos c
    where c.id = caso_id
      and (c.creado_por = auth.uid() or c.responsable_id = auth.uid())
      and c.estado <> 'cerrado'
  )
);

drop policy if exists "Direccion subdireccion ven planes" on public.planes_intervencion;
create policy "Direccion subdireccion ven planes"
on public.planes_intervencion
for select
to authenticated
using (public.get_my_role_text() in ('directivo', 'subdireccion'));

drop policy if exists "Trabajo social ve planes derivados" on public.planes_intervencion;
create policy "Trabajo social ve planes derivados"
on public.planes_intervencion
for select
to authenticated
using (
  public.get_my_role_text() = 'trabajo_social'
  and exists (
    select 1
    from public.orientacion_casos c
    where c.id = caso_id
      and c.estado = 'derivado_trabajo_social'
  )
);

drop policy if exists "Admin total seguimiento orientacion" on public.seguimiento_orientacion;
create policy "Admin total seguimiento orientacion"
on public.seguimiento_orientacion
for all
to authenticated
using (public.get_my_role_text() in ('developer', 'system_admin'))
with check (public.get_my_role_text() in ('developer', 'system_admin'));

drop policy if exists "Orientacion gestiona seguimiento propio" on public.seguimiento_orientacion;
create policy "Orientacion gestiona seguimiento propio"
on public.seguimiento_orientacion
for all
to authenticated
using (
  public.get_my_role_text() = 'orientacion'
  and exists (
    select 1
    from public.orientacion_casos c
    where c.id = caso_id
      and (c.creado_por = auth.uid() or c.responsable_id = auth.uid())
      and c.estado <> 'cerrado'
  )
)
with check (
  public.get_my_role_text() = 'orientacion'
  and created_by = auth.uid()
  and exists (
    select 1
    from public.orientacion_casos c
    where c.id = caso_id
      and (c.creado_por = auth.uid() or c.responsable_id = auth.uid())
      and c.estado <> 'cerrado'
  )
);

drop policy if exists "Direccion subdireccion ven seguimiento orientacion" on public.seguimiento_orientacion;
create policy "Direccion subdireccion ven seguimiento orientacion"
on public.seguimiento_orientacion
for select
to authenticated
using (public.get_my_role_text() in ('directivo', 'subdireccion'));

drop policy if exists "Trabajo social ve seguimiento derivado" on public.seguimiento_orientacion;
create policy "Trabajo social ve seguimiento derivado"
on public.seguimiento_orientacion
for select
to authenticated
using (
  public.get_my_role_text() = 'trabajo_social'
  and exists (
    select 1
    from public.orientacion_casos c
    where c.id = caso_id
      and c.estado = 'derivado_trabajo_social'
  )
);

create or replace function public.audit_orientacion_action(
  p_tipo_accion text,
  p_descripcion text,
  p_tabla text,
  p_id_registro text,
  p_new_values jsonb default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_audit_id uuid;
begin
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
    auth.uid(),
    auth.jwt() ->> 'email',
    public.get_my_role_text(),
    p_tipo_accion,
    p_descripcion,
    p_tabla,
    p_id_registro,
    p_new_values
  )
  returning id into v_audit_id;

  return v_audit_id;
end;
$$;

create or replace function public.abrir_caso_orientacion(
  p_alumno_id uuid,
  p_motivo text,
  p_resumen text default null,
  p_prioridad text default 'media',
  p_responsable_id uuid default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_role text := public.get_my_role_text();
  v_case_id uuid;
  v_responsable uuid := coalesce(p_responsable_id, auth.uid());
begin
  if auth.uid() is null or v_role not in ('orientacion', 'developer', 'system_admin') then
    raise exception 'No autorizado para abrir casos de Orientacion' using errcode = '42501';
  end if;

  insert into public.orientacion_casos (
    alumno_id,
    creado_por,
    responsable_id,
    estado,
    prioridad,
    motivo,
    resumen
  ) values (
    p_alumno_id,
    auth.uid(),
    v_responsable,
    'recibido',
    coalesce(nullif(p_prioridad, ''), 'media'),
    p_motivo,
    p_resumen
  )
  returning id into v_case_id;

  perform public.audit_orientacion_action(
    'ORIENTACION_CASO_ABIERTO',
    'Caso de Orientacion abierto',
    'orientacion_casos',
    v_case_id::text,
    jsonb_build_object('alumno_id', p_alumno_id, 'prioridad', p_prioridad, 'motivo', p_motivo)
  );

  return v_case_id;
end;
$$;

create or replace function public.solicitar_diagnostico(
  p_docente_id uuid,
  p_caso_id uuid,
  p_observaciones text default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_role text := public.get_my_role_text();
  v_alumno_id uuid;
  v_request_id uuid;
begin
  if auth.uid() is null or v_role not in ('orientacion', 'developer', 'system_admin') then
    raise exception 'No autorizado para solicitar diagnosticos docentes' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.perfiles_usuario p
    where p.id = p_docente_id
      and p.rol in ('docente', 'docente_tutor')
  ) then
    raise exception 'El destinatario no es docente institucional' using errcode = '23514';
  end if;

  select alumno_id into v_alumno_id
  from public.orientacion_casos
  where id = p_caso_id;

  if v_alumno_id is null then
    raise exception 'Caso de Orientacion no encontrado o no visible' using errcode = '42501';
  end if;

  insert into public.solicitudes_diagnostico (
    caso_id,
    docente_id,
    alumno_id,
    estado,
    observaciones
  ) values (
    p_caso_id,
    p_docente_id,
    v_alumno_id,
    'pendiente',
    p_observaciones
  )
  returning id into v_request_id;

  update public.orientacion_casos
  set estado = 'diagnostico_solicitado'
  where id = p_caso_id;

  perform public.audit_orientacion_action(
    'ORIENTACION_DIAGNOSTICO_SOLICITADO',
    'Diagnostico docente solicitado por Orientacion',
    'solicitudes_diagnostico',
    v_request_id::text,
    jsonb_build_object('caso_id', p_caso_id, 'docente_id', p_docente_id)
  );

  return v_request_id;
end;
$$;

create or replace function public.registrar_diagnostico(
  p_solicitud_id uuid,
  p_conducta text,
  p_aprovechamiento text,
  p_asistencia text,
  p_observaciones text,
  p_recomendaciones text
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_role text := public.get_my_role_text();
  v_request public.solicitudes_diagnostico%rowtype;
  v_diagnostico_id uuid;
begin
  if auth.uid() is null or v_role not in ('docente', 'docente_tutor', 'developer', 'system_admin') then
    raise exception 'No autorizado para registrar diagnostico docente' using errcode = '42501';
  end if;

  select * into v_request
  from public.solicitudes_diagnostico
  where id = p_solicitud_id
    and (docente_id = auth.uid() or v_role in ('developer', 'system_admin'));

  if v_request.id is null then
    raise exception 'Solicitud de diagnostico no encontrada o no asignada' using errcode = '42501';
  end if;

  if v_request.estado <> 'pendiente' then
    raise exception 'La solicitud de diagnostico ya no esta pendiente' using errcode = '23514';
  end if;

  insert into public.diagnosticos_docentes (
    solicitud_id,
    caso_id,
    docente_id,
    conducta,
    aprovechamiento,
    asistencia,
    observaciones,
    recomendaciones
  ) values (
    v_request.id,
    v_request.caso_id,
    v_request.docente_id,
    p_conducta,
    p_aprovechamiento,
    p_asistencia,
    p_observaciones,
    p_recomendaciones
  )
  returning id into v_diagnostico_id;

  update public.solicitudes_diagnostico
  set estado = 'respondido', fecha_respuesta = now()
  where id = p_solicitud_id;

  perform public.audit_orientacion_action(
    'ORIENTACION_DIAGNOSTICO_REGISTRADO',
    'Diagnostico docente respondido',
    'diagnosticos_docentes',
    v_diagnostico_id::text,
    jsonb_build_object('caso_id', v_request.caso_id, 'solicitud_id', p_solicitud_id)
  );

  return v_diagnostico_id;
end;
$$;

create or replace function public.crear_plan_intervencion(
  p_caso_id uuid,
  p_objetivo text,
  p_acciones text,
  p_responsable text,
  p_fecha_inicio date default current_date,
  p_fecha_revision date default null,
  p_estado text default 'activo'
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_role text := public.get_my_role_text();
  v_plan_id uuid;
begin
  if auth.uid() is null or v_role not in ('orientacion', 'developer', 'system_admin') then
    raise exception 'No autorizado para crear planes de intervencion' using errcode = '42501';
  end if;

  if not exists (select 1 from public.orientacion_casos where id = p_caso_id) then
    raise exception 'Caso de Orientacion no encontrado o no visible' using errcode = '42501';
  end if;

  insert into public.planes_intervencion (
    caso_id,
    objetivo,
    acciones,
    responsable,
    fecha_inicio,
    fecha_revision,
    estado
  ) values (
    p_caso_id,
    p_objetivo,
    p_acciones,
    p_responsable,
    coalesce(p_fecha_inicio, current_date),
    p_fecha_revision,
    coalesce(nullif(p_estado, ''), 'activo')
  )
  returning id into v_plan_id;

  update public.orientacion_casos
  set estado = 'plan_definido'
  where id = p_caso_id;

  insert into public.seguimiento_orientacion (caso_id, tipo, descripcion, created_by)
  values (p_caso_id, 'plan', 'Plan de intervencion definido por Orientacion.', auth.uid());

  perform public.audit_orientacion_action(
    'ORIENTACION_PLAN_CREADO',
    'Plan de intervencion creado',
    'planes_intervencion',
    v_plan_id::text,
    jsonb_build_object('caso_id', p_caso_id, 'estado', p_estado)
  );

  return v_plan_id;
end;
$$;

create or replace function public.derivar_trabajo_social(
  p_caso_id uuid,
  p_descripcion text default 'Caso derivado a Trabajo Social por Orientacion.'
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_role text := public.get_my_role_text();
begin
  if auth.uid() is null or v_role not in ('orientacion', 'developer', 'system_admin') then
    raise exception 'No autorizado para derivar a Trabajo Social' using errcode = '42501';
  end if;

  update public.orientacion_casos
  set estado = 'derivado_trabajo_social'
  where id = p_caso_id;

  if not found then
    raise exception 'Caso de Orientacion no encontrado o no visible' using errcode = '42501';
  end if;

  insert into public.seguimiento_orientacion (caso_id, tipo, descripcion, created_by)
  values (p_caso_id, 'derivacion', p_descripcion, auth.uid());

  perform public.audit_orientacion_action(
    'ORIENTACION_DERIVADO_TRABAJO_SOCIAL',
    'Caso derivado a Trabajo Social',
    'orientacion_casos',
    p_caso_id::text,
    jsonb_build_object('estado', 'derivado_trabajo_social')
  );
end;
$$;

create or replace function public.escalar_direccion(
  p_caso_id uuid,
  p_descripcion text default 'Caso escalado a Direccion para decision institucional.'
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_role text := public.get_my_role_text();
begin
  if auth.uid() is null or v_role not in ('orientacion', 'developer', 'system_admin') then
    raise exception 'No autorizado para escalar a Direccion' using errcode = '42501';
  end if;

  update public.orientacion_casos
  set estado = 'escalado_direccion'
  where id = p_caso_id;

  if not found then
    raise exception 'Caso de Orientacion no encontrado o no visible' using errcode = '42501';
  end if;

  insert into public.seguimiento_orientacion (caso_id, tipo, descripcion, created_by)
  values (p_caso_id, 'escalamiento', p_descripcion, auth.uid());

  perform public.audit_orientacion_action(
    'ORIENTACION_ESCALADO_DIRECCION',
    'Caso escalado a Direccion',
    'orientacion_casos',
    p_caso_id::text,
    jsonb_build_object('estado', 'escalado_direccion')
  );
end;
$$;

revoke all on function public.audit_orientacion_action(text, text, text, text, jsonb) from public, anon;
revoke all on function public.abrir_caso_orientacion(uuid, text, text, text, uuid) from public, anon;
revoke all on function public.solicitar_diagnostico(uuid, uuid, text) from public, anon;
revoke all on function public.registrar_diagnostico(uuid, text, text, text, text, text) from public, anon;
revoke all on function public.crear_plan_intervencion(uuid, text, text, text, date, date, text) from public, anon;
revoke all on function public.derivar_trabajo_social(uuid, text) from public, anon;
revoke all on function public.escalar_direccion(uuid, text) from public, anon;

grant execute on function public.abrir_caso_orientacion(uuid, text, text, text, uuid) to authenticated, service_role;
grant execute on function public.audit_orientacion_action(text, text, text, text, jsonb) to authenticated, service_role;
grant execute on function public.solicitar_diagnostico(uuid, uuid, text) to authenticated, service_role;
grant execute on function public.registrar_diagnostico(uuid, text, text, text, text, text) to authenticated, service_role;
grant execute on function public.crear_plan_intervencion(uuid, text, text, text, date, date, text) to authenticated, service_role;
grant execute on function public.derivar_trabajo_social(uuid, text) to authenticated, service_role;
grant execute on function public.escalar_direccion(uuid, text) to authenticated, service_role;

comment on table public.orientacion_casos is 'Casos institucionales gestionados por Orientacion. No reemplaza incidencias ni seguimiento social.';
comment on table public.solicitudes_diagnostico is 'Solicitudes de diagnostico docente asignadas desde casos de Orientacion.';
comment on table public.diagnosticos_docentes is 'Respuestas docentes a solicitudes formales de Orientacion.';
comment on table public.planes_intervencion is 'Planes de intervencion definidos por Orientacion para casos activos.';
comment on table public.seguimiento_orientacion is 'Bitacora y evidencia de seguimiento propio de Orientacion.';

insert into public.auditoria (tipo_accion, descripcion_accion, tabla_objetivo)
values (
  'ORIENTACION_V2_BACKEND',
  'Backend base de Orientacion v2: casos, diagnosticos docentes, planes, seguimiento y RLS minimo.',
  'orientacion_casos'
);
