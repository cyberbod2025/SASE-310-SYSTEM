-- Persistencia institucional de Trabajo Social.
-- Amplia la tabla legado sin duplicar contactos, citas ni intervenciones.

alter table public.seguimiento_social
  add column if not exists tipo_evento text not null default 'seguimiento',
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

alter table public.seguimiento_social
  drop constraint if exists seguimiento_social_tipo_evento_check;

alter table public.seguimiento_social
  add constraint seguimiento_social_tipo_evento_check
  check (
    tipo_evento in (
      'seguimiento',
      'visita_domiciliaria',
      'acuerdo',
      'canalizacion',
      'cierre'
    )
  );

create index if not exists idx_seguimiento_social_alumno_fecha
  on public.seguimiento_social (alumno_id, fecha desc);

create index if not exists idx_seguimiento_social_creado_por
  on public.seguimiento_social (creado_por);

create or replace function private.set_seguimiento_social_updated_at()
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

drop trigger if exists set_seguimiento_social_updated_at
  on public.seguimiento_social;

create trigger set_seguimiento_social_updated_at
before update on public.seguimiento_social
for each row
execute function private.set_seguimiento_social_updated_at();

alter table public.seguimiento_social enable row level security;

revoke all on table public.seguimiento_social from public, anon, authenticated;
grant select, insert on table public.seguimiento_social to authenticated;
grant update (estatus) on table public.seguimiento_social to authenticated;

drop policy if exists "seguimiento_social_select_institucional" on public.seguimiento_social;
drop policy if exists "seguimiento_social_insert_trabajo_social" on public.seguimiento_social;
drop policy if exists "seguimiento_social_update_estado" on public.seguimiento_social;

create policy "seguimiento_social_select_institucional"
on public.seguimiento_social
for select
to authenticated
using (
  (select private.is_institutional_actor(array[
    'trabajo_social',
    'orientacion',
    'directivo',
    'subdireccion',
    'system_admin'
  ]::text[]))
);

create policy "seguimiento_social_insert_trabajo_social"
on public.seguimiento_social
for insert
to authenticated
with check (
  creado_por = (select auth.uid())
  and (select private.is_institutional_actor(array[
    'trabajo_social',
    'system_admin'
  ]::text[]))
);

create policy "seguimiento_social_update_estado"
on public.seguimiento_social
for update
to authenticated
using (
  (
    creado_por = (select auth.uid())
    and (select private.is_institutional_actor(array[
      'trabajo_social',
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
    creado_por = (select auth.uid())
    and (select private.is_institutional_actor(array[
      'trabajo_social',
      'system_admin'
    ]::text[]))
  )
  or (select private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'system_admin'
  ]::text[]))
);

-- Trabajo Social necesita memoria compartida del área para contactos y citatorios.
-- Se conserva autoría obligatoria y se evita acceso a otros roles operativos.

create index if not exists idx_contacts_log_student_created
  on public.contacts_log (student_id, created_at desc);

create index if not exists idx_citas_padres_alumno_fecha
  on public.citas_padres (alumno_id, fecha_cita desc);

create index if not exists idx_interventions_log_student_created
  on public.interventions_log (student_id, created_at desc);

alter table public.contacts_log enable row level security;
alter table public.citas_padres enable row level security;
alter table public.interventions_log enable row level security;

drop policy if exists "contacts_log_select" on public.contacts_log;

create policy "contacts_log_select"
on public.contacts_log
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_institutional_actor(array[
    'trabajo_social',
    'orientacion',
    'directivo',
    'subdireccion',
    'system_admin'
  ]::text[]))
);

drop policy if exists "citas_padres_select" on public.citas_padres;
drop policy if exists "citas_padres_update" on public.citas_padres;

create policy "citas_padres_select"
on public.citas_padres
for select
to authenticated
using (
  creado_por = (select auth.uid())
  or (select private.is_institutional_actor(array[
    'trabajo_social',
    'orientacion',
    'directivo',
    'subdireccion',
    'system_admin'
  ]::text[]))
);

create policy "citas_padres_update"
on public.citas_padres
for update
to authenticated
using (
  (
    creado_por = (select auth.uid())
    and (select private.is_institutional_actor(array[
      'trabajo_social',
      'orientacion',
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
    creado_por = (select auth.uid())
    and (select private.is_institutional_actor(array[
      'trabajo_social',
      'orientacion',
      'system_admin'
    ]::text[]))
  )
  or (select private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'system_admin'
  ]::text[]))
);

drop policy if exists "interventions_log_select" on public.interventions_log;

create policy "interventions_log_select"
on public.interventions_log
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_institutional_actor(array[
    'trabajo_social',
    'orientacion',
    'directivo',
    'subdireccion',
    'system_admin'
  ]::text[]))
);
