# Research - Orientacion v2

## Diagnostico de tablas existentes

- `alumnos`: fuente institucional de alumno, grupo, matricula, semaforo y riesgo persistido.
- `incidencias`: historial de eventos reportados; se consulta para contexto, no se crea desde Orientacion.
- `expediente_integral_alumno`: vista `security_invoker` que consolida trayectoria institucional.
- `alumnos_en_riesgo`: vista de deteccion temprana, util para priorizar bandeja.
- `citas_padres`: citatorios legacy; se conserva como apoyo, no como caso de Orientacion.
- `contacts_log`: contactos familiares legacy; se conserva como evidencia auxiliar.
- `interventions_log`: bitacora legacy de intervenciones; insuficiente para plan, estado y RLS de caso.
- `seguimiento_social`: dominio de Trabajo Social; no se mezcla con Orientacion.
- `respuestas_docentes`: respuestas colectivas/legacy; no modela solicitud individual asignada por caso.
- `solicitudes`: solicitudes genericas; carece de `caso_id` y contrato de diagnostico docente.

## Gap real

No existe equivalente a caso de Orientacion, solicitud docente asignada, diagnostico individual por caso, plan de intervencion ni seguimiento propio con evidencia.

## Decision

Crear solo cinco tablas nuevas: `orientacion_casos`, `solicitudes_diagnostico`, `diagnosticos_docentes`, `planes_intervencion` y `seguimiento_orientacion`.

## Seguridad

- RLS activado en todas las tablas nuevas.
- RPCs `security invoker`; no se introduce `service_role` en frontend.
- Auditoria mediante `public.auditoria` con rol obtenido desde `perfiles_usuario`.
- Direccion/Subdireccion leen, Orientacion muta sus casos, docentes responden asignaciones, Trabajo Social lee derivados.
