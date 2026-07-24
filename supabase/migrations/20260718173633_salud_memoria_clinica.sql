-- Memoria clínica escolar protegida.
-- Separa atenciones y alertas clínicas de las incidencias institucionales.

alter table public.atenciones_medicas
  add column if not exists estado_atencion text,
  add column if not exists nivel_urgencia text,
  add column if not exists fecha_seguimiento date,
  add column if not exists tipo_salida text,
  add column if not exists updated_at timestamptz;

update public.atenciones_medicas
set
  estado_atencion = case
    when lower(trim(coalesce(estado_atencion, ''))) in (
      'abierta',
      'observacion',
      'referida',
      'cerrada'
    ) then lower(trim(estado_atencion))
    else 'cerrada'
  end,
  nivel_urgencia = case
    when lower(trim(coalesce(nivel_urgencia, ''))) in (
      'baja',
      'media',
      'alta',
      'emergencia'
    ) then lower(trim(nivel_urgencia))
    else 'media'
  end,
  tipo_salida = case
    when tipo_salida is null or nullif(trim(tipo_salida), '') is null then null
    when lower(trim(tipo_salida)) in (
      'regreso_clase',
      'entrega_familiar',
      'referencia_medica',
      'emergencia'
    ) then lower(trim(tipo_salida))
    else null
  end,
  updated_at = coalesce(updated_at, hora, now())
where
  estado_atencion is null
  or lower(trim(estado_atencion)) not in (
    'abierta',
    'observacion',
    'referida',
    'cerrada'
  )
  or nivel_urgencia is null
  or lower(trim(nivel_urgencia)) not in (
    'baja',
    'media',
    'alta',
    'emergencia'
  )
  or (
    tipo_salida is not null
    and nullif(trim(tipo_salida), '') is not null
    and lower(trim(tipo_salida)) not in (
      'regreso_clase',
      'entrega_familiar',
      'referencia_medica',
      'emergencia'
    )
  )
  or updated_at is null;

alter table public.atenciones_medicas
  alter column estado_atencion set default 'abierta',
  alter column estado_atencion set not null,
  alter column nivel_urgencia set default 'media',
  alter column nivel_urgencia set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

alter table public.atenciones_medicas
  drop constraint if exists atenciones_medicas_estado_atencion_check;

alter table public.atenciones_medicas
  add constraint atenciones_medicas_estado_atencion_check
  check (
    estado_atencion in (
      'abierta',
      'observacion',
      'referida',
      'cerrada'
    )
  );

alter table public.atenciones_medicas
  drop constraint if exists atenciones_medicas_nivel_urgencia_check;

alter table public.atenciones_medicas
  add constraint atenciones_medicas_nivel_urgencia_check
  check (
    nivel_urgencia in (
      'baja',
      'media',
      'alta',
      'emergencia'
    )
  );

alter table public.atenciones_medicas
  drop constraint if exists atenciones_medicas_tipo_salida_check;

alter table public.atenciones_medicas
  add constraint atenciones_medicas_tipo_salida_check
  check (
    tipo_salida is null
    or tipo_salida in (
      'regreso_clase',
      'entrega_familiar',
      'referencia_medica',
      'emergencia'
    )
  );

create index if not exists idx_atenciones_medicas_alumno_hora
  on public.atenciones_medicas (alumno_id, hora desc);

create index if not exists idx_atenciones_medicas_estado_seguimiento
  on public.atenciones_medicas (estado_atencion, fecha_seguimiento);

create index if not exists idx_atenciones_medicas_generado_por
  on public.atenciones_medicas (generado_por);

create or replace function private.set_atencion_medica_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_atencion_medica_updated_at
  on public.atenciones_medicas;

create trigger set_atencion_medica_updated_at
before update on public.atenciones_medicas
for each row
execute function private.set_atencion_medica_updated_at();

revoke all on function private.set_atencion_medica_updated_at()
from public, anon, authenticated;

alter table public.atenciones_medicas enable row level security;

revoke all on table public.atenciones_medicas
from public, anon, authenticated;

grant select on table public.atenciones_medicas
to authenticated;

grant insert (
  alumno_id,
  nombre_alumno,
  grupo,
  motivo,
  sintomas,
  diagnostico,
  signos_vitales,
  atencion_brindada,
  tratamiento,
  medicamento,
  notificacion_padres,
  acudieron_por_el,
  condiciones_entrega,
  observaciones,
  estado_atencion,
  nivel_urgencia,
  fecha_seguimiento,
  tipo_salida,
  generado_por,
  atendido_por,
  hora
) on table public.atenciones_medicas
to authenticated;

grant update (
  estado_atencion,
  fecha_seguimiento,
  condiciones_entrega,
  observaciones,
  tipo_salida
) on table public.atenciones_medicas
to authenticated;

drop policy if exists "Personal de salud puede insertar atenciones"
  on public.atenciones_medicas;
drop policy if exists "Personal puede ver sus propios registros de salud"
  on public.atenciones_medicas;
drop policy if exists "atenciones_medicas_select_clinico"
  on public.atenciones_medicas;
drop policy if exists "atenciones_medicas_insert_clinico"
  on public.atenciones_medicas;
drop policy if exists "atenciones_medicas_update_seguimiento"
  on public.atenciones_medicas;

create policy "atenciones_medicas_select_clinico"
on public.atenciones_medicas
for select
to authenticated
using (
  (select private.is_institutional_actor(array[
    'medico_escolar',
    'directivo',
    'subdireccion',
    'system_admin'
  ]::text[]))
);

create policy "atenciones_medicas_insert_clinico"
on public.atenciones_medicas
for insert
to authenticated
with check (
  generado_por = (select auth.uid())
  and atendido_por = (select auth.uid())
  and (select private.is_institutional_actor(array[
    'medico_escolar',
    'system_admin'
  ]::text[]))
);

create policy "atenciones_medicas_update_seguimiento"
on public.atenciones_medicas
for update
to authenticated
using (
  (
    generado_por = (select auth.uid())
    and (select private.is_institutional_actor(array[
      'medico_escolar',
      'system_admin'
    ]::text[]))
  )
  or (select private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'system_admin'
  ]::text[]))
)
with check (
  (
    generado_por = (select auth.uid())
    and (select private.is_institutional_actor(array[
      'medico_escolar',
      'system_admin'
    ]::text[]))
  )
  or (select private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'system_admin'
  ]::text[]))
);

-- Alertas clínicas vigentes.

alter table public.salud
  add column if not exists tipo_alerta text,
  add column if not exists indicaciones text,
  add column if not exists activa boolean not null default true,
  add column if not exists actualizado_por uuid,
  add column if not exists created_at timestamptz;

update public.salud
set
  tipo_alerta = case
    when nullif(trim(coalesce(padecimiento, '')), '') is not null
      then 'padecimiento'
    when nullif(trim(coalesce(alergias, '')), '') is not null
      then 'alergia'
    when nullif(trim(coalesce(medicamentos, '')), '') is not null
      then 'medicamento'
    else 'otra'
  end,
  created_at = coalesce(created_at, ultima_actualizacion, now())
where
  tipo_alerta is null
  or lower(trim(tipo_alerta)) not in (
    'padecimiento',
    'alergia',
    'medicamento',
    'otra'
  )
  or created_at is null;

alter table public.salud
  alter column tipo_alerta set default 'padecimiento',
  alter column tipo_alerta set not null,
  alter column created_at set default now(),
  alter column created_at set not null;

alter table public.salud
  drop constraint if exists salud_tipo_alerta_check;

alter table public.salud
  add constraint salud_tipo_alerta_check
  check (
    tipo_alerta in (
      'padecimiento',
      'alergia',
      'medicamento',
      'otra'
    )
  );

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'salud_actualizado_por_fkey'
      and conrelid = 'public.salud'::regclass
  ) then
    alter table public.salud
      add constraint salud_actualizado_por_fkey
      foreign key (actualizado_por)
      references public.perfiles_usuario(id)
      on delete set null;
  end if;
end;
$$;

create index if not exists idx_salud_alumno_activa
  on public.salud (alumno_id, activa);

create index if not exists idx_salud_actualizado_por
  on public.salud (actualizado_por);

create or replace function private.set_salud_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.ultima_actualizacion := now();
  new.actualizado_por := (select auth.uid());
  return new;
end;
$$;

drop trigger if exists set_salud_updated_at
  on public.salud;

create trigger set_salud_updated_at
before update on public.salud
for each row
execute function private.set_salud_updated_at();

revoke all on function private.set_salud_updated_at()
from public, anon, authenticated;

drop trigger if exists tr_audit_salud_alerta
  on public.salud;

create trigger tr_audit_salud_alerta
after insert or update on public.salud
for each row
execute function public.fn_automatic_audit_trigger();

alter table public.salud enable row level security;

revoke all on table public.salud
from public, anon, authenticated;

grant select on table public.salud
to authenticated;

grant insert (
  alumno_id,
  tipo_alerta,
  padecimiento,
  alergias,
  medicamentos,
  indicaciones,
  activa,
  actualizado_por
) on table public.salud
to authenticated;

grant update (
  activa
) on table public.salud
to authenticated;

drop policy if exists "Personal de salud y directivos pueden ver salud"
  on public.salud;
drop policy if exists "Usuarios pueden ver su propio registro de salud"
  on public.salud;
drop policy if exists "Solo personal de salud puede editar"
  on public.salud;
drop policy if exists "salud_select_clinico"
  on public.salud;
drop policy if exists "salud_insert_clinico"
  on public.salud;
drop policy if exists "salud_update_estado"
  on public.salud;

create policy "salud_select_clinico"
on public.salud
for select
to authenticated
using (
  (select private.is_institutional_actor(array[
    'medico_escolar',
    'directivo',
    'subdireccion',
    'system_admin'
  ]::text[]))
);

create policy "salud_insert_clinico"
on public.salud
for insert
to authenticated
with check (
  actualizado_por = (select auth.uid())
  and (select private.is_institutional_actor(array[
    'medico_escolar',
    'system_admin'
  ]::text[]))
);

create policy "salud_update_estado"
on public.salud
for update
to authenticated
using (
  (select private.is_institutional_actor(array[
    'medico_escolar',
    'system_admin'
  ]::text[]))
)
with check (
  (select private.is_institutional_actor(array[
    'medico_escolar',
    'system_admin'
  ]::text[]))
);

-- Servicio Médico necesita leer el padrón para seleccionar alumnos.
drop policy if exists "Staff Institucional ve todo"
  on public.alumnos;

create policy "Staff Institucional ve todo"
on public.alumnos
for select
to authenticated
using (
  (select private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'secretaria',
    'prefectura',
    'orientacion',
    'trabajo_social',
    'medico_escolar',
    'udeii',
    'developer',
    'system_admin'
  ]::text[]))
);

comment on table public.atenciones_medicas is
  'Memoria clínica escolar de atenciones, entrega, referencia y seguimiento.';

comment on table public.salud is
  'Alertas clínicas vigentes y protegidas por rol institucional.';
