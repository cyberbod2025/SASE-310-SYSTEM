-- 2026-07-01: RLS minima y re-ejecutable para tablas institucionales.
-- Usa auth.uid() + perfiles_usuario.rol como fuente de autorizacion.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_institutional_actor(allowed_roles text[])
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.perfiles_usuario as p
    where p.id = (select auth.uid())
      and p.estado_cuenta = 'activo'
      and p.seguridad_status = 'active'
      and nullif(lower(trim(p.rol)), '') = any (array[
        'directivo',
        'subdireccion',
        'docente',
        'docente_tutor',
        'prefectura',
        'orientacion',
        'trabajo_social',
        'medico_escolar',
        'udeii',
        'promotora_lectura',
        'secretaria',
        'developer',
        'system_admin'
      ]::text[])
      and nullif(lower(trim(p.rol)), '') = any (allowed_roles)
  );
$$;

revoke all on function private.is_institutional_actor(text[]) from public;
grant execute on function private.is_institutional_actor(text[]) to authenticated;

alter table public.interventions_log enable row level security;
alter table public.evidence_log enable row level security;
alter table public.citas_padres enable row level security;
alter table public.contacts_log enable row level security;
alter table public.activities_log enable row level security;

-- El cliente solo puede actualizar campos de presentacion de su propio perfil.
revoke update on table public.perfiles_usuario from public, anon, authenticated;
grant update (nombre_completo, telefono, preferencias_dashboard)
on table public.perfiles_usuario
to authenticated;

-- UPDATE institucional se limita a las tablas y columnas exigidas por la spec.
revoke update on table public.interventions_log from public, anon, authenticated;
grant update (reason, result, notes)
on table public.interventions_log
to authenticated;

revoke update on table public.citas_padres from public, anon, authenticated;
grant update (estado, fecha_cita, motivo, observaciones)
on table public.citas_padres
to authenticated;

revoke update on table public.evidence_log from public, anon, authenticated;
revoke update on table public.contacts_log from public, anon, authenticated;
revoke update on table public.activities_log from public, anon, authenticated;

drop policy if exists "interventions_log_select" on public.interventions_log;
drop policy if exists "interventions_log_insert" on public.interventions_log;
drop policy if exists "interventions_log_update" on public.interventions_log;

create policy "interventions_log_select"
on public.interventions_log
for select
to authenticated
using (
  (select private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'docente',
    'docente_tutor',
    'prefectura',
    'orientacion',
    'trabajo_social',
    'medico_escolar',
    'udeii',
    'promotora_lectura',
    'secretaria',
    'developer',
    'system_admin'
  ]::text[]))
  and (
    user_id = (select auth.uid())
    or (select private.is_institutional_actor(array[
      'directivo',
      'subdireccion',
      'developer',
      'system_admin'
    ]::text[]))
  )
);

create policy "interventions_log_insert"
on public.interventions_log
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (select private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'docente',
    'docente_tutor',
    'prefectura',
    'orientacion',
    'trabajo_social',
    'medico_escolar',
    'udeii',
    'promotora_lectura',
    'secretaria',
    'developer',
    'system_admin'
  ]::text[]))
);

create policy "interventions_log_update"
on public.interventions_log
for update
to authenticated
using (
  (select private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'developer',
    'system_admin'
  ]::text[]))
)
with check (
  (select private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'developer',
    'system_admin'
  ]::text[]))
);

drop policy if exists "evidence_log_select" on public.evidence_log;
drop policy if exists "evidence_log_insert" on public.evidence_log;
drop policy if exists "evidence_log_update" on public.evidence_log;

create policy "evidence_log_select"
on public.evidence_log
for select
to authenticated
using (
  (select private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'docente',
    'docente_tutor',
    'prefectura',
    'orientacion',
    'trabajo_social',
    'medico_escolar',
    'udeii',
    'promotora_lectura',
    'secretaria',
    'developer',
    'system_admin'
  ]::text[]))
  and (
    user_id = (select auth.uid())
    or (select private.is_institutional_actor(array[
      'directivo',
      'subdireccion',
      'developer',
      'system_admin'
    ]::text[]))
  )
);

create policy "evidence_log_insert"
on public.evidence_log
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (select private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'docente',
    'docente_tutor',
    'prefectura',
    'orientacion',
    'trabajo_social',
    'medico_escolar',
    'udeii',
    'promotora_lectura',
    'secretaria',
    'developer',
    'system_admin'
  ]::text[]))
);

drop policy if exists "citas_padres_select" on public.citas_padres;
drop policy if exists "citas_padres_insert" on public.citas_padres;
drop policy if exists "citas_padres_update" on public.citas_padres;

create policy "citas_padres_select"
on public.citas_padres
for select
to authenticated
using (
  (select private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'docente',
    'docente_tutor',
    'prefectura',
    'orientacion',
    'trabajo_social',
    'medico_escolar',
    'udeii',
    'promotora_lectura',
    'secretaria',
    'developer',
    'system_admin'
  ]::text[]))
  and (
    creado_por = (select auth.uid())
    or (select private.is_institutional_actor(array[
      'orientacion',
      'directivo',
      'subdireccion',
      'developer',
      'system_admin'
    ]::text[]))
  )
);

create policy "citas_padres_insert"
on public.citas_padres
for insert
to authenticated
with check (
  creado_por = (select auth.uid())
  and (select private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'docente',
    'docente_tutor',
    'prefectura',
    'orientacion',
    'trabajo_social',
    'medico_escolar',
    'udeii',
    'promotora_lectura',
    'secretaria',
    'developer',
    'system_admin'
  ]::text[]))
);

create policy "citas_padres_update"
on public.citas_padres
for update
to authenticated
using (
  (select private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'orientacion',
    'developer',
    'system_admin'
  ]::text[]))
)
with check (
  (select private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'orientacion',
    'developer',
    'system_admin'
  ]::text[]))
);

drop policy if exists "contacts_log_select" on public.contacts_log;
drop policy if exists "contacts_log_insert" on public.contacts_log;
drop policy if exists "contacts_log_update" on public.contacts_log;

create policy "contacts_log_select"
on public.contacts_log
for select
to authenticated
using (
  (select private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'docente',
    'docente_tutor',
    'prefectura',
    'orientacion',
    'trabajo_social',
    'medico_escolar',
    'udeii',
    'promotora_lectura',
    'secretaria',
    'developer',
    'system_admin'
  ]::text[]))
  and (
    user_id = (select auth.uid())
    or (select private.is_institutional_actor(array[
      'directivo',
      'subdireccion',
      'developer',
      'system_admin'
    ]::text[]))
  )
);

create policy "contacts_log_insert"
on public.contacts_log
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (select private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'docente',
    'docente_tutor',
    'prefectura',
    'orientacion',
    'trabajo_social',
    'medico_escolar',
    'udeii',
    'promotora_lectura',
    'secretaria',
    'developer',
    'system_admin'
  ]::text[]))
);

drop policy if exists "activities_log_select" on public.activities_log;
drop policy if exists "activities_log_insert" on public.activities_log;
drop policy if exists "activities_log_update" on public.activities_log;

create policy "activities_log_select"
on public.activities_log
for select
to authenticated
using (
  (select private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'docente',
    'docente_tutor',
    'prefectura',
    'orientacion',
    'trabajo_social',
    'medico_escolar',
    'udeii',
    'promotora_lectura',
    'secretaria',
    'developer',
    'system_admin'
  ]::text[]))
  and (
    user_id = (select auth.uid())
    or (select private.is_institutional_actor(array[
      'directivo',
      'subdireccion',
      'developer',
      'system_admin'
    ]::text[]))
  )
);

create policy "activities_log_insert"
on public.activities_log
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (select private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'docente',
    'docente_tutor',
    'prefectura',
    'orientacion',
    'trabajo_social',
    'medico_escolar',
    'udeii',
    'promotora_lectura',
    'secretaria',
    'developer',
    'system_admin'
  ]::text[]))
);
