-- Memoria institucional UDEII / BAP.
-- Conserva el resumen vigente en alumnos.datos_bap y el historial append-only
-- en seguimiento_bap.

alter table public.seguimiento_bap
  add column if not exists tipo_evento text not null default 'ajuste',
  add column if not exists observaciones text,
  add column if not exists responsable text,
  add column if not exists fecha_revision date;

update public.seguimiento_bap
set
  tipo_bap = coalesce(nullif(trim(tipo_bap), ''), 'Registro BAP legado'),
  ajuste_razonable = coalesce(
    nullif(trim(ajuste_razonable), ''),
    'Seguimiento migrado sin detalle'
  ),
  estatus = case
    when lower(trim(coalesce(estatus, ''))) in (
      'activo',
      'en_seguimiento',
      'cumplido',
      'cerrado',
      'cancelado'
    ) then lower(trim(estatus))
    else 'en_seguimiento'
  end,
  tipo_evento = case
    when lower(trim(coalesce(tipo_evento, ''))) in (
      'deteccion',
      'ajuste',
      'seguimiento',
      'revision',
      'cierre'
    ) then lower(trim(tipo_evento))
    else 'seguimiento'
  end
where
  tipo_bap is null
  or nullif(trim(tipo_bap), '') is null
  or ajuste_razonable is null
  or nullif(trim(ajuste_razonable), '') is null
  or estatus is null
  or nullif(trim(estatus), '') is null
  or lower(trim(estatus)) not in (
    'activo',
    'en_seguimiento',
    'cumplido',
    'cerrado',
    'cancelado'
  )
  or tipo_evento is null
  or nullif(trim(tipo_evento), '') is null
  or lower(trim(tipo_evento)) not in (
    'deteccion',
    'ajuste',
    'seguimiento',
    'revision',
    'cierre'
  );

alter table public.seguimiento_bap
  alter column tipo_bap set not null,
  alter column ajuste_razonable set not null,
  alter column estatus set default 'en_seguimiento',
  alter column estatus set not null;

alter table public.seguimiento_bap
  drop constraint if exists seguimiento_bap_tipo_evento_check;

alter table public.seguimiento_bap
  add constraint seguimiento_bap_tipo_evento_check
  check (
    tipo_evento in (
      'deteccion',
      'ajuste',
      'seguimiento',
      'revision',
      'cierre'
    )
  );

alter table public.seguimiento_bap
  drop constraint if exists seguimiento_bap_estatus_check;

alter table public.seguimiento_bap
  add constraint seguimiento_bap_estatus_check
  check (
    estatus in (
      'activo',
      'en_seguimiento',
      'cumplido',
      'cerrado',
      'cancelado'
    )
  );

create index if not exists idx_seguimiento_bap_alumno_fecha
  on public.seguimiento_bap (alumno_id, creado_en desc);

create index if not exists idx_seguimiento_bap_creado_por
  on public.seguimiento_bap (creado_por);

drop trigger if exists tr_audit_bap
  on public.seguimiento_bap;

create trigger tr_audit_bap
after insert on public.seguimiento_bap
for each row
execute function public.fn_automatic_audit_trigger();

alter table public.seguimiento_bap enable row level security;

revoke all on table public.seguimiento_bap
from public, anon, authenticated;

grant select on table public.seguimiento_bap
to authenticated;

drop policy if exists "seguimiento_bap_select_institucional"
  on public.seguimiento_bap;

create policy "seguimiento_bap_select_institucional"
on public.seguimiento_bap
for select
to authenticated
using (
  (select private.is_institutional_actor(array[
    'udeii',
    'orientacion',
    'directivo',
    'subdireccion',
    'system_admin'
  ]::text[]))
);

-- La política vigente de alumnos no incluía UDEII, aunque el rol ya cuenta con
-- permiso de lectura sensible en el contrato de aplicación.
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
    'udeii',
    'developer',
    'system_admin'
  ]::text[]))
);

create or replace function public.registrar_evento_bap(
  p_alumno_id uuid,
  p_tipo_evento text,
  p_tipo_bap text,
  p_ajuste_razonable text,
  p_estatus text default 'en_seguimiento',
  p_observaciones text default null,
  p_responsable text default null,
  p_fecha_revision date default null
)
returns table (
  id uuid,
  alumno_id uuid,
  tipo_evento text,
  tipo_bap text,
  ajuste_razonable text,
  estatus text,
  observaciones text,
  responsable text,
  fecha_revision date,
  creado_por uuid,
  creado_en timestamptz,
  datos_bap jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_current_snapshot jsonb;
  v_accommodations jsonb;
  v_snapshot jsonb;
  v_record public.seguimiento_bap%rowtype;
  v_tipo_evento text := lower(trim(coalesce(p_tipo_evento, '')));
  v_tipo_bap text := trim(coalesce(p_tipo_bap, ''));
  v_ajuste text := trim(coalesce(p_ajuste_razonable, ''));
  v_estatus text := lower(trim(coalesce(p_estatus, '')));
  v_observaciones text := nullif(trim(coalesce(p_observaciones, '')), '');
  v_responsable text := nullif(trim(coalesce(p_responsable, '')), '');
begin
  if v_actor is null then
    raise exception 'La sesión institucional no está disponible.'
      using errcode = '42501';
  end if;

  if not private.is_institutional_actor(array[
    'udeii',
    'system_admin'
  ]::text[]) then
    raise exception 'El rol institucional no puede registrar seguimiento BAP.'
      using errcode = '42501';
  end if;

  if p_alumno_id is null then
    raise exception 'El alumno es obligatorio.'
      using errcode = '22023';
  end if;

  if v_tipo_evento not in (
    'deteccion',
    'ajuste',
    'seguimiento',
    'revision',
    'cierre'
  ) then
    raise exception 'El tipo de evento BAP no es válido.'
      using errcode = '22023';
  end if;

  if v_estatus not in (
    'activo',
    'en_seguimiento',
    'cumplido',
    'cerrado',
    'cancelado'
  ) then
    raise exception 'El estatus BAP no es válido.'
      using errcode = '22023';
  end if;

  if v_tipo_bap = '' or char_length(v_tipo_bap) > 300 then
    raise exception 'La barrera debe contener entre 1 y 300 caracteres.'
      using errcode = '22023';
  end if;

  if v_ajuste = '' or char_length(v_ajuste) > 2000 then
    raise exception 'El ajuste o acción debe contener entre 1 y 2000 caracteres.'
      using errcode = '22023';
  end if;

  if v_responsable is null or char_length(v_responsable) > 200 then
    raise exception 'El responsable es obligatorio y no puede exceder 200 caracteres.'
      using errcode = '22023';
  end if;

  if v_observaciones is not null and char_length(v_observaciones) > 4000 then
    raise exception 'Las observaciones no pueden exceder 4000 caracteres.'
      using errcode = '22023';
  end if;

  select
    case
      when jsonb_typeof(a.datos_bap) = 'object' then a.datos_bap
      else '{}'::jsonb
    end
  into v_current_snapshot
  from public.alumnos as a
  where a.id = p_alumno_id
  for update;

  if not found then
    raise exception 'El alumno indicado no existe.'
      using errcode = 'P0002';
  end if;

  v_accommodations := case
    when jsonb_typeof(v_current_snapshot -> 'accommodations') = 'array'
      then v_current_snapshot -> 'accommodations'
    else '[]'::jsonb
  end;

  if v_tipo_evento <> 'cierre'
    and not exists (
      select 1
      from jsonb_array_elements_text(v_accommodations) as item(value)
      where item.value = v_ajuste
    ) then
    v_accommodations := v_accommodations || jsonb_build_array(v_ajuste);
  end if;

  v_snapshot := v_current_snapshot || jsonb_build_object(
    'hasBAP', v_estatus not in ('cerrado', 'cancelado'),
    'diagnosisPrivate', v_tipo_bap,
    'accommodations', v_accommodations,
    'lastUpdated', now()
  );

  update public.alumnos as a
  set datos_bap = v_snapshot
  where a.id = p_alumno_id;

  insert into public.seguimiento_bap (
    alumno_id,
    tipo_evento,
    tipo_bap,
    ajuste_razonable,
    estatus,
    observaciones,
    responsable,
    fecha_revision,
    creado_por
  )
  values (
    p_alumno_id,
    v_tipo_evento,
    v_tipo_bap,
    v_ajuste,
    v_estatus,
    v_observaciones,
    v_responsable,
    p_fecha_revision,
    v_actor
  )
  returning * into v_record;

  return query
  select
    v_record.id,
    v_record.alumno_id,
    v_record.tipo_evento,
    v_record.tipo_bap,
    v_record.ajuste_razonable,
    v_record.estatus,
    v_record.observaciones,
    v_record.responsable,
    v_record.fecha_revision,
    v_record.creado_por,
    v_record.creado_en,
    v_snapshot;
end;
$$;

revoke all on function public.registrar_evento_bap(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  date
) from public, anon, authenticated;

grant execute on function public.registrar_evento_bap(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  date
) to authenticated;

comment on table public.seguimiento_bap is
  'Memoria histórica append-only de detecciones, ajustes y seguimientos BAP de UDEII.';

comment on function public.registrar_evento_bap(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  date
) is
  'Registra un evento BAP y actualiza el resumen vigente del alumno en una sola transacción autorizada.';
