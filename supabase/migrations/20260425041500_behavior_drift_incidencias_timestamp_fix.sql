-- Compatibilidad del Behavior Drift Engine con el esquema hospedado de incidencias.
-- El sistema no solo debe funcionar,
-- debe mantenerse alineado en el tiempo.

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
