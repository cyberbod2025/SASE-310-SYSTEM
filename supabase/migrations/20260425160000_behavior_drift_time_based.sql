-- Behavior Drift Engine v2: detección basada en tiempo progresivo.
-- El sistema no solo debe funcionar,
-- debe mantenerse alineado en el tiempo.
--
-- Cambios:
--   1. Nuevo campo: estado_datos ('insuficiente','activo')
--   2. nivel_deriva ahora acepta 'sin datos suficientes'
--   3. calcular_deriva usa promedio últimos 3, promedio histórico y pendiente simple
--   4. Fórmula: deriva = (ultimos3 - historico) + (tendencia * 0.5)
--   5. Mínimo 3 registros para activar cálculo real de deriva

-- ────────────────────────────────────────────────────────
-- 1. Agregar campo estado_datos
-- ────────────────────────────────────────────────────────

alter table public.behavior_metrics
  add column if not exists estado_datos text not null default 'activo';

-- Reemplazar CHECK de nivel_deriva para incluir 'sin datos suficientes'
alter table public.behavior_metrics
  drop constraint if exists behavior_metrics_nivel_deriva_check;

alter table public.behavior_metrics
  add constraint behavior_metrics_nivel_deriva_check
    check (nivel_deriva in ('estable', 'leve', 'media', 'critica', 'sin datos suficientes'));

-- CHECK para estado_datos
alter table public.behavior_metrics
  add constraint behavior_metrics_estado_datos_check
    check (estado_datos in ('insuficiente', 'activo'));

-- ────────────────────────────────────────────────────────
-- 2. Reemplazar función calcular_deriva con lógica temporal
-- ────────────────────────────────────────────────────────

create or replace function public.calcular_deriva(alumno uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ultimo_id uuid;
  v_total_registros integer;
  v_promedio_ultimos3 double precision;
  v_promedio_historico double precision;
  v_first_score double precision;
  v_last_score double precision;
  v_pendiente double precision;
  v_deriva double precision;
  v_nivel text;
  v_estado text;
begin
  -- Obtener el registro más reciente (el que acabamos de insertar)
  select bm.id
  into v_ultimo_id
  from public.behavior_metrics bm
  where bm.alumno_id = alumno
  order by bm.fecha desc, bm.created_at desc
  limit 1;

  if v_ultimo_id is null then
    return;
  end if;

  -- Contar total de registros para este alumno
  select count(*)
  into v_total_registros
  from public.behavior_metrics bm
  where bm.alumno_id = alumno;

  -- Si no hay mínimo 3 registros: datos insuficientes
  if v_total_registros < 3 then
    update public.behavior_metrics
    set deriva_score = 0,
        nivel_deriva = 'sin datos suficientes',
        estado_datos = 'insuficiente'
    where id = v_ultimo_id;
    return;
  end if;

  -- Promedio de (calidad + consistencia) de los últimos 3 registros
  select avg(sub.score)
  into v_promedio_ultimos3
  from (
    select (bm.calidad + bm.consistencia) as score
    from public.behavior_metrics bm
    where bm.alumno_id = alumno
    order by bm.fecha desc, bm.created_at desc
    limit 3
  ) sub;

  -- Promedio histórico total (todos los registros)
  select avg(bm.calidad + bm.consistencia)
  into v_promedio_historico
  from public.behavior_metrics bm
  where bm.alumno_id = alumno;

  -- Pendiente simple: score más reciente vs más antiguo / número de intervalos
  select (bm.calidad + bm.consistencia)
  into v_first_score
  from public.behavior_metrics bm
  where bm.alumno_id = alumno
  order by bm.fecha asc, bm.created_at asc
  limit 1;

  select (bm.calidad + bm.consistencia)
  into v_last_score
  from public.behavior_metrics bm
  where bm.alumno_id = alumno
  order by bm.fecha desc, bm.created_at desc
  limit 1;

  v_pendiente := case
    when v_total_registros <= 1 then 0
    else (v_last_score - v_first_score) / greatest(v_total_registros - 1, 1)
  end;

  -- Fórmula: deriva = (ultimos3 - historico) + (tendencia * 0.5)
  v_deriva := (v_promedio_ultimos3 - coalesce(v_promedio_historico, v_promedio_ultimos3))
              + (coalesce(v_pendiente, 0) * 0.5);

  -- Clasificación
  v_nivel := case
    when v_deriva > -0.5 then 'estable'
    when v_deriva > -1.5 then 'leve'
    when v_deriva > -3   then 'media'
    else 'critica'
  end;

  v_estado := 'activo';

  update public.behavior_metrics
  set deriva_score = round(v_deriva::numeric, 4)::double precision,
      nivel_deriva = v_nivel,
      estado_datos = v_estado
  where id = v_ultimo_id;
end;
$$;

-- ────────────────────────────────────────────────────────
-- 3. Retroalimentar registros existentes con estado_datos
-- ────────────────────────────────────────────────────────

-- Marcar registros de alumnos con menos de 3 métricas como insuficientes
update public.behavior_metrics bm
set estado_datos = 'insuficiente',
    nivel_deriva = 'sin datos suficientes'
where (
  select count(*)
  from public.behavior_metrics bm2
  where bm2.alumno_id = bm.alumno_id
) < 3;

-- ────────────────────────────────────────────────────────
-- 4. Auditoría institucional
-- ────────────────────────────────────────────────────────

insert into public.auditoria (
  tipo_accion,
  descripcion_accion,
  tabla_objetivo
) values (
  'MIGRACION_SISTEMA',
  'Behavior Drift Engine v2: lógica basada en tiempo con promedio últimos 3, pendiente simple y requisito de datos mínimos.',
  'behavior_metrics'
);

-- ────────────────────────────────────────────────────────
-- 5. Comentarios actualizados
-- ────────────────────────────────────────────────────────

comment on function public.calcular_deriva(uuid) is
  'Behavior Drift Engine v2: clasifica deriva usando promedio de últimos 3 registros vs histórico total más pendiente temporal. Requiere mínimo 3 registros.';
