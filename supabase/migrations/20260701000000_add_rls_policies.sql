-- 2026-07-01: RLS minima y re-ejecutable para tablas institucionales.
-- Usa auth.uid() + perfiles_usuario como fuente de autorizacion.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_institutional_actor(allowed_roles text[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.perfiles_usuario p
    where p.id = auth.uid()
      and lower(trim(coalesce(p.rol, p.role, ''))) = any (allowed_roles)
  );
$$;

revoke all on function private.is_institutional_actor(text[]) from public;
grant execute on function private.is_institutional_actor(text[]) to authenticated;

ALTER TABLE public.interventions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas_padres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "interventions_log_select" ON public.interventions_log;
DROP POLICY IF EXISTS "interventions_log_insert" ON public.interventions_log;
CREATE POLICY "interventions_log_select" ON public.interventions_log
FOR SELECT
TO authenticated
USING (
  private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'orientacion',
    'trabajo_social',
    'prefectura',
    'docente',
    'secretaria',
    'udeii'
  ])
);
CREATE POLICY "interventions_log_insert" ON public.interventions_log
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  and private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'orientacion',
    'trabajo_social',
    'prefectura',
    'docente',
    'secretaria',
    'udeii'
  ])
);

DROP POLICY IF EXISTS "evidence_log_select" ON public.evidence_log;
DROP POLICY IF EXISTS "evidence_log_insert" ON public.evidence_log;
CREATE POLICY "evidence_log_select" ON public.evidence_log
FOR SELECT
TO authenticated
USING (
  private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'orientacion',
    'trabajo_social',
    'prefectura',
    'docente',
    'secretaria',
    'udeii'
  ])
);
CREATE POLICY "evidence_log_insert" ON public.evidence_log
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  and private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'orientacion',
    'trabajo_social',
    'prefectura',
    'docente',
    'secretaria',
    'udeii'
  ])
);

DROP POLICY IF EXISTS "citas_padres_select" ON public.citas_padres;
DROP POLICY IF EXISTS "citas_padres_insert" ON public.citas_padres;
CREATE POLICY "citas_padres_select" ON public.citas_padres
FOR SELECT
TO authenticated
USING (
  private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'orientacion',
    'trabajo_social',
    'prefectura',
    'docente',
    'secretaria',
    'udeii'
  ])
);
CREATE POLICY "citas_padres_insert" ON public.citas_padres
FOR INSERT
TO authenticated
WITH CHECK (
  creado_por = auth.uid()
  and private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'orientacion',
    'trabajo_social',
    'prefectura',
    'docente',
    'secretaria',
    'udeii'
  ])
);

DROP POLICY IF EXISTS "contacts_log_select" ON public.contacts_log;
DROP POLICY IF EXISTS "contacts_log_insert" ON public.contacts_log;
CREATE POLICY "contacts_log_select" ON public.contacts_log
FOR SELECT
TO authenticated
USING (
  private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'orientacion',
    'trabajo_social',
    'prefectura',
    'docente',
    'secretaria',
    'udeii'
  ])
);
CREATE POLICY "contacts_log_insert" ON public.contacts_log
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  and private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'orientacion',
    'trabajo_social',
    'prefectura',
    'docente',
    'secretaria',
    'udeii'
  ])
);

DROP POLICY IF EXISTS "activities_log_select" ON public.activities_log;
DROP POLICY IF EXISTS "activities_log_insert" ON public.activities_log;
CREATE POLICY "activities_log_select" ON public.activities_log
FOR SELECT
TO authenticated
USING (
  private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'orientacion',
    'trabajo_social',
    'prefectura',
    'docente',
    'secretaria',
    'udeii'
  ])
);
CREATE POLICY "activities_log_insert" ON public.activities_log
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  and private.is_institutional_actor(array[
    'directivo',
    'subdireccion',
    'orientacion',
    'trabajo_social',
    'prefectura',
    'docente',
    'secretaria',
    'udeii'
  ])
);
