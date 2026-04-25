-- Behavior Drift Engine: deteccion de desviaciones silenciosas en el tiempo.
-- El sistema no solo debe funcionar,
-- debe mantenerse alineado en el tiempo.

create table if not exists public.behavior_metrics (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid not null references public.alumnos(id) on delete cascade,
  fecha timestamptz not null default now(),
  calidad double precision not null default 0,
  consistencia double precision not null default 0,
  frecuencia double precision not null default 0,
  tendencia double precision not null default 0,
  deriva_score double precision not null default 0,
  nivel_deriva text not null default 'estable'
    check (nivel_deriva in ('estable', 'leve', 'media', 'critica')),
  created_at timestamptz not null default now()
);

create index if not exists idx_behavior_metrics_alumno_fecha
  on public.behavior_metrics (alumno_id, fecha desc);

create index if not exists idx_behavior_metrics_nivel_deriva
  on public.behavior_metrics (nivel_deriva);

alter table public.behavior_metrics enable row level security;

drop policy if exists "Docentes leen deriva de comportamiento" on public.behavior_metrics;
create policy "Docentes leen deriva de comportamiento"
  on public.behavior_metrics
  for select
  to authenticated
  using (lower(trim(public.get_my_role_text())) in ('docente', 'docente_tutor'));

drop policy if exists "Docentes registran deriva de comportamiento" on public.behavior_metrics;
create policy "Docentes registran deriva de comportamiento"
  on public.behavior_metrics
  for insert
  to authenticated
  with check (lower(trim(public.get_my_role_text())) in ('docente', 'docente_tutor'));

drop policy if exists "Docentes actualizan deriva de comportamiento" on public.behavior_metrics;
create policy "Docentes actualizan deriva de comportamiento"
  on public.behavior_metrics
  for update
  to authenticated
  using (lower(trim(public.get_my_role_text())) in ('docente', 'docente_tutor'))
  with check (lower(trim(public.get_my_role_text())) in ('docente', 'docente_tutor'));

drop policy if exists "Orientacion direccion gestionan deriva" on public.behavior_metrics;
create policy "Orientacion direccion gestionan deriva"
  on public.behavior_metrics
  for all
  to authenticated
  using (lower(trim(public.get_my_role_text())) in ('orientacion', 'directivo', 'subdireccion', 'system_admin', 'developer'))
  with check (lower(trim(public.get_my_role_text())) in ('orientacion', 'directivo', 'subdireccion', 'system_admin', 'developer'));

create or replace function public.calcular_deriva(alumno uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ultimo_id uuid;
  promedio_historico double precision;
  comportamiento_actual double precision;
  deriva double precision;
begin
  select bm.id, (bm.calidad + bm.consistencia)
  into v_ultimo_id, comportamiento_actual
  from public.behavior_metrics bm
  where bm.alumno_id = alumno
  order by bm.fecha desc, bm.created_at desc
  limit 1;

  if v_ultimo_id is null then
    return;
  end if;

  select avg(bm.calidad + bm.consistencia)
  into promedio_historico
  from public.behavior_metrics bm
  where bm.alumno_id = alumno
    and bm.id <> v_ultimo_id;

  deriva := comportamiento_actual - coalesce(promedio_historico, comportamiento_actual);

  update public.behavior_metrics
  set deriva_score = deriva,
      nivel_deriva = case
        when deriva > -0.5 then 'estable'
        when deriva > -1.5 then 'leve'
        when deriva > -3 then 'media'
        else 'critica'
      end
  where id = v_ultimo_id;
end;
$$;

create or replace function public.registrar_behavior_metric(p_alumno_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recent_count integer := 0;
  v_history_count integer := 0;
  v_recent_points double precision := 0;
  v_history_points double precision := 0;
  v_avg_recent double precision := 0;
  v_avg_history double precision := 0;
  v_calidad double precision := 0;
  v_consistencia double precision := 0;
  v_frecuencia double precision := 0;
  v_tendencia double precision := 0;
begin
  if p_alumno_id is null then
    return;
  end if;

  select
    count(*) filter (where coalesce(i.fecha, i.creado_en, now()) >= now() - interval '30 days'),
    count(*) filter (
      where coalesce(i.fecha, i.creado_en, now()) < now() - interval '30 days'
        and coalesce(i.fecha, i.creado_en, now()) >= now() - interval '120 days'
    ),
    coalesce(sum(case i.gravedad
      when 'leve' then 1.0
      when 'media' then 3.0
      when 'grave' then 5.0
      when 'critica' then 8.0
      else coalesce(i.nivel_gravedad, 1)::double precision
    end) filter (where coalesce(i.fecha, i.creado_en, now()) >= now() - interval '30 days'), 0),
    coalesce(sum(case i.gravedad
      when 'leve' then 1.0
      when 'media' then 3.0
      when 'grave' then 5.0
      when 'critica' then 8.0
      else coalesce(i.nivel_gravedad, 1)::double precision
    end) filter (
      where coalesce(i.fecha, i.creado_en, now()) < now() - interval '30 days'
        and coalesce(i.fecha, i.creado_en, now()) >= now() - interval '120 days'
    ), 0)
  into v_recent_count, v_history_count, v_recent_points, v_history_points
  from public.incidencias i
  where i.alumno_id = p_alumno_id;

  v_avg_recent := case when v_recent_count > 0 then v_recent_points / v_recent_count else 0 end;
  v_avg_history := case when v_history_count > 0 then v_history_points / v_history_count else v_avg_recent end;

  v_calidad := greatest(0, 5 - v_avg_recent);
  v_consistencia := greatest(0, 5 - abs(v_avg_recent - v_avg_history) - least(v_recent_count, 5) * 0.2);
  v_frecuencia := least(v_recent_count, 10)::double precision;
  v_tendencia := v_avg_history - v_avg_recent;

  insert into public.behavior_metrics (
    alumno_id,
    fecha,
    calidad,
    consistencia,
    frecuencia,
    tendencia
  ) values (
    p_alumno_id,
    now(),
    round(v_calidad::numeric, 2)::double precision,
    round(v_consistencia::numeric, 2)::double precision,
    round(v_frecuencia::numeric, 2)::double precision,
    round(v_tendencia::numeric, 2)::double precision
  );

  perform public.calcular_deriva(p_alumno_id);
end;
$$;

create or replace function public.trigger_update_behavior_drift_from_incidencia()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op in ('INSERT', 'UPDATE') then
    perform public.registrar_behavior_metric(new.alumno_id);
  elsif tg_op = 'DELETE' then
    perform public.registrar_behavior_metric(old.alumno_id);
  end if;

  return null;
end;
$$;

drop trigger if exists trigger_behavior_drift_on_incidencia on public.incidencias;
create trigger trigger_behavior_drift_on_incidencia
after insert or update or delete on public.incidencias
for each row execute function public.trigger_update_behavior_drift_from_incidencia();

create or replace function public.trigger_update_behavior_drift_from_expediente()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_alumno_id uuid;
begin
  if tg_op = 'DELETE' then
    v_alumno_id := old.alumno_id;
  else
    v_alumno_id := new.alumno_id;
  end if;

  perform public.registrar_behavior_metric(v_alumno_id);
  return null;
end;
$$;

drop trigger if exists trigger_behavior_drift_on_documentos on public.documentos_institucionales;
create trigger trigger_behavior_drift_on_documentos
after insert or update or delete on public.documentos_institucionales
for each row execute function public.trigger_update_behavior_drift_from_expediente();

drop trigger if exists trigger_behavior_drift_on_seguimiento_bap on public.seguimiento_bap;
create trigger trigger_behavior_drift_on_seguimiento_bap
after insert or update or delete on public.seguimiento_bap
for each row execute function public.trigger_update_behavior_drift_from_expediente();

comment on table public.behavior_metrics is 'Motor Behavior Drift Engine: métricas persistidas de desviación silenciosa por alumno.';
comment on function public.calcular_deriva(uuid) is 'Clasifica la deriva de comportamiento con base en la diferencia entre comportamiento actual e historico persistido.';
comment on function public.registrar_behavior_metric(uuid) is 'Genera métricas de comportamiento desde incidencias reales y delega la clasificación de deriva a calcular_deriva.';
