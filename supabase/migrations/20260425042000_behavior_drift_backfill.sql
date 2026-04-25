-- Inicializa Behavior Drift Engine con incidencias reales existentes.
-- El sistema no solo debe funcionar,
-- debe mantenerse alineado en el tiempo.

select public.registrar_behavior_metric(source.alumno_id)
from (
  select distinct alumno_id
  from public.incidencias
  where alumno_id is not null
) as source;
