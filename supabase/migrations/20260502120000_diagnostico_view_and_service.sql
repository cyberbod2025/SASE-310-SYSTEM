-- Vista para diagnósticos docentes (lectura agregada, no expone RPCs)
-- Usa diagnosticos_docentes (Orientación v2) que tiene conducta, aprovechamiento, asistencia.
-- Esta vista se usa desde diagnosticoService.ts, no desde el browser directo.

create or replace view public.v_diagnosticos_docentes as
select
  dd.id,
  oc.alumno_id,
  a.grupo,
  p.nombre_completo as docente_nombre,
  dd.conducta,
  dd.aprovechamiento,
  dd.asistencia,
  dd.observaciones,
  dd.recomendaciones,
  dd.created_at
from public.diagnosticos_docentes dd
join public.orientacion_casos oc on oc.id = dd.caso_id
left join public.alumnos a on a.id = oc.alumno_id
left join public.perfiles_usuario p on p.id = dd.docente_id
where dd.conducta is not null
   or dd.aprovechamiento is not null
   or dd.asistencia is not null;

comment on view public.v_diagnosticos_docentes is
  'Vista de solo lectura para diagnósticos docentes (Orientación v2). Acceso vía RLS heredado de diagnosticos_docentes.';

-- RLS: hereda de diagnosticos_docentes (tiene políticas en migración de Orientación v2)
-- No grant adicional necesario; el acceso se controla por RLS en la tabla base.
