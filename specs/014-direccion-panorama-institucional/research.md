# Investigación

## Evidencia

- `buildDirectionCase` fabrica fechas con `formatDateOffset`.
- Los seguimientos completados se calculan como `incidencias / 2`.
- `hasTeacherDiagnosis` considera `diagnosisPrivate` de BAP o tipos de
  incidencia como diagnóstico docente.
- `evidence_log` no tiene `student_id`; la acción de evidencia no queda unida
  al alumno.
- `closeCase` y `reopenCase` actualizan directamente `estado_semaforo`, aunque
  el semáforo pertenece al motor persistido de riesgo.
- Ya existen fuentes persistentes por área con RLS: `orientacion_casos`,
  `seguimiento_orientacion`, `seguimiento_social`, `seguimiento_bap`,
  `atenciones_medicas` e `incidencias`.

## Decisiones

- Crear un RPC de solo lectura y salida tabular.
- Agregar por alumno dentro de Postgres para evitar descargar contenido
  sensible o historiales completos.
- Retornar solo conteos, estados, prioridades y fechas operativas.
- Conservar el puntaje y estado semáforo ya persistidos.
- Definir urgencia visible mediante reglas transparentes sobre prioridad,
  riesgo, escalamiento y fechas vencidas.
- Mantener el reporte ejecutivo sobre la misma respuesta confirmada.

## Riesgo

La migración no puede probarse contra Postgres local mientras Docker no esté
activo. La validación estática no equivale a aplicación SQL.
