-- Panorama agregado para Dirección y Subdirección.
-- Devuelve señales operativas verificables sin contenido clínico, BAP privado
-- ni notas sensibles de Trabajo Social.

create index if not exists idx_incidencias_alumno_estado_fecha
  on public.incidencias (alumno_id, estado, fecha desc);

create index if not exists idx_atenciones_medicas_alumno_estado_seguimiento
  on public.atenciones_medicas (
    alumno_id,
    estado_atencion,
    fecha_seguimiento
  );

create or replace function public.obtener_panorama_direccion()
returns table (
  alumno_id uuid,
  matricula text,
  nombre_alumno text,
  grupo text,
  puntaje_riesgo numeric,
  estado_semaforo text,
  incidencias_abiertas bigint,
  ultima_incidencia timestamptz,
  caso_orientacion_id uuid,
  estado_orientacion text,
  prioridad_orientacion text,
  actualizacion_orientacion timestamptz,
  seguimientos_orientacion bigint,
  diagnosticos_docentes bigint,
  planes_orientacion_activos bigint,
  proxima_revision_orientacion date,
  trabajo_social_abiertos bigint,
  ultima_actualizacion_social timestamptz,
  bap_pendientes bigint,
  proxima_revision_bap date,
  salud_seguimientos_pendientes bigint,
  proxima_revision_salud date,
  total_pendientes bigint,
  proxima_accion date,
  actualizacion_reciente timestamptz,
  requiere_atencion boolean,
  razones_atencion text[],
  fuentes_activas text[]
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null
    or not (select private.is_institutional_actor(array[
      'directivo',
      'subdireccion',
      'system_admin'
    ]::text[]))
  then
    raise exception 'El rol institucional no puede consultar el panorama de Dirección.'
      using errcode = '42501';
  end if;

  insert into public.auditoria (
    usuario_id,
    email_usuario,
    rol_usuario,
    tipo_accion,
    descripcion_accion,
    tabla_objetivo,
    id_registro_objetivo,
    new_values
  ) values (
    (select auth.uid()),
    (select auth.jwt() ->> 'email'),
    (
      select lower(trim(p.rol))
      from public.perfiles_usuario as p
      where p.id = (select auth.uid())
    ),
    'PANORAMA_DIRECCION_CONSULTA',
    'Consulta del panorama institucional agregado de Dirección.',
    'panorama_direccion',
    (select auth.uid())::text,
    jsonb_build_object('contenido_sensible', false)
  );

  return query
  with incident_summary as (
    select
      i.alumno_id,
      count(*) filter (
        where lower(trim(coalesce(i.estado, 'abierto'))) not in (
          'cerrado',
          'cerrada',
          'cerrado_por_direccion'
        )
      )::bigint as open_count,
      max(coalesce(i.fecha, i.created_at, i.creado_en)) as last_at
    from public.incidencias as i
    group by i.alumno_id
  ),
  orientation_current as (
    select distinct on (c.alumno_id)
      c.alumno_id,
      c.id,
      c.estado,
      c.prioridad,
      c.fecha_actualizacion
    from public.orientacion_casos as c
    where c.estado <> 'cerrado'
    order by c.alumno_id, c.fecha_actualizacion desc, c.id
  ),
  orientation_followups as (
    select
      s.caso_id,
      count(*)::bigint as total,
      max(s.created_at) as last_at
    from public.seguimiento_orientacion as s
    group by s.caso_id
  ),
  orientation_diagnoses as (
    select
      d.caso_id,
      count(*)::bigint as total,
      max(d.created_at) as last_at
    from public.diagnosticos_docentes as d
    group by d.caso_id
  ),
  orientation_plans as (
    select
      p.caso_id,
      count(*) filter (
        where p.estado not in ('concluido')
      )::bigint as active_count,
      min(p.fecha_revision) filter (
        where p.estado not in ('concluido')
          and p.fecha_revision is not null
      ) as next_review
    from public.planes_intervencion as p
    group by p.caso_id
  ),
  social_summary as (
    select
      s.alumno_id,
      count(*) filter (
        where lower(trim(coalesce(s.estatus, 'pendiente'))) not in (
          'cerrado',
          'cerrada',
          'completado',
          'cumplido',
          'cancelado'
        )
      )::bigint as open_count,
      max(coalesce(s.updated_at, s.fecha)) as last_at
    from public.seguimiento_social as s
    group by s.alumno_id
  ),
  bap_summary as (
    select
      b.alumno_id,
      count(*) filter (
        where b.estatus in ('activo', 'en_seguimiento')
      )::bigint as pending_count,
      min(b.fecha_revision) filter (
        where b.estatus in ('activo', 'en_seguimiento')
          and b.fecha_revision is not null
      ) as next_review,
      max(b.creado_en) as last_at
    from public.seguimiento_bap as b
    group by b.alumno_id
  ),
  health_summary as (
    select
      h.alumno_id,
      count(*) filter (
        where h.estado_atencion in (
          'abierta',
          'observacion',
          'seguimiento'
        )
      )::bigint as pending_count,
      min(h.fecha_seguimiento) filter (
        where h.estado_atencion in (
          'abierta',
          'observacion',
          'seguimiento'
        )
          and h.fecha_seguimiento is not null
      ) as next_review,
      max(coalesce(h.updated_at, h.hora)) as last_at
    from public.atenciones_medicas as h
    group by h.alumno_id
  )
  select
    a.id,
    a.matricula,
    a.nombre_completo,
    a.grupo,
    coalesce(a.puntaje_riesgo, 0)::numeric,
    coalesce(nullif(trim(a.estado_semaforo), ''), 'NO_DOCUMENTADO'),
    coalesce(inc.open_count, 0),
    inc.last_at,
    ori.id,
    ori.estado,
    ori.prioridad,
    ori.fecha_actualizacion,
    coalesce(ofu.total, 0),
    coalesce(odi.total, 0),
    coalesce(opl.active_count, 0),
    opl.next_review,
    coalesce(soc.open_count, 0),
    soc.last_at,
    coalesce(bap.pending_count, 0),
    bap.next_review,
    coalesce(hea.pending_count, 0),
    hea.next_review,
    (
      coalesce(inc.open_count, 0)
      + case when ori.id is null then 0 else 1 end
      + coalesce(soc.open_count, 0)
      + coalesce(bap.pending_count, 0)
      + coalesce(hea.pending_count, 0)
    )::bigint,
    least(opl.next_review, bap.next_review, hea.next_review),
    greatest(
      inc.last_at,
      ori.fecha_actualizacion,
      ofu.last_at,
      odi.last_at,
      soc.last_at,
      bap.last_at,
      hea.last_at
    ),
    (
      coalesce(a.puntaje_riesgo, 0) >= 70
      or ori.prioridad in ('alta', 'critica')
      or ori.estado = 'escalado_direccion'
      or coalesce(inc.open_count, 0) >= 3
      or least(opl.next_review, bap.next_review, hea.next_review)
        < current_date
    ),
    array_remove(array[
      case
        when coalesce(a.puntaje_riesgo, 0) >= 70
          then 'Puntaje institucional igual o mayor a 70'
      end,
      case
        when ori.prioridad in ('alta', 'critica')
          then 'Caso de Orientación con prioridad alta o crítica'
      end,
      case
        when ori.estado = 'escalado_direccion'
          then 'Orientación solicitó decisión directiva'
      end,
      case
        when coalesce(inc.open_count, 0) >= 3
          then 'Tres o más incidencias abiertas'
      end,
      case
        when least(opl.next_review, bap.next_review, hea.next_review)
          < current_date
          then 'Existe una fecha de seguimiento vencida'
      end
    ]::text[], null),
    array_remove(array[
      case when coalesce(inc.open_count, 0) > 0 then 'Incidencias' end,
      case when ori.id is not null then 'Orientación' end,
      case when coalesce(soc.open_count, 0) > 0 then 'Trabajo Social' end,
      case when coalesce(bap.pending_count, 0) > 0 then 'UDEII' end,
      case when coalesce(hea.pending_count, 0) > 0 then 'Salud' end
    ]::text[], null)
  from public.alumnos as a
  left join incident_summary as inc on inc.alumno_id = a.id
  left join orientation_current as ori on ori.alumno_id = a.id
  left join orientation_followups as ofu on ofu.caso_id = ori.id
  left join orientation_diagnoses as odi on odi.caso_id = ori.id
  left join orientation_plans as opl on opl.caso_id = ori.id
  left join social_summary as soc on soc.alumno_id = a.id
  left join bap_summary as bap on bap.alumno_id = a.id
  left join health_summary as hea on hea.alumno_id = a.id
  order by
    (
      coalesce(a.puntaje_riesgo, 0) >= 70
      or ori.prioridad in ('alta', 'critica')
      or ori.estado = 'escalado_direccion'
      or coalesce(inc.open_count, 0) >= 3
      or least(opl.next_review, bap.next_review, hea.next_review)
        < current_date
    ) desc,
    coalesce(a.puntaje_riesgo, 0) desc,
    a.nombre_completo;
end;
$$;

revoke all on function public.obtener_panorama_direccion()
from public, anon, authenticated;

grant execute on function public.obtener_panorama_direccion()
to authenticated;

comment on function public.obtener_panorama_direccion() is
  'Panorama operativo agregado para Dirección, sin contenido sensible de las áreas.';
