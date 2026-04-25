# Expediente: Matrícula Inteligente + Cierre de Ciclo

**Fecha**: 2026-04-25
**Autor**: Antigravity
**Estado**: Planificación
**Impacto**: Schema (5 tablas nuevas, 2 funciones RPC, RLS), API (1 endpoint IA), Store (2 slices), UI (2 módulos), permisos

## Problema que resuelve

SASE-310 no tiene gestión de ciclo de vida del alumno. Actualmente:
- El campo `grupo` en `alumnos` es un string plano sin trazabilidad histórica
- No existe concepto de ciclo escolar como entidad, solo un campo texto en `grupos`
- No hay mecanismo de promoción/retención/egreso entre ciclos
- La distribución de alumnos entre grupos se hace manualmente sin criterios de equilibrio

Estos dos módulos forman una unidad funcional: primero se distribuyen alumnos en grupos (Matrícula Inteligente), luego al final del ciclo se procesan promociones (Cierre de Ciclo).

## Fuentes de verdad existentes

| Recurso | Estado |
|:---|:---|
| `alumnos` (grado int, grupo text) | Dato plano sin historial |
| `grupos` (nombre, ciclo_escolar text) | Sin FK a tabla de ciclos |
| `attendance_logs` (alumno_id, fecha, estado) | ✅ Funcional |
| `examenes_trimestre` (calificacion_final) | ✅ Funcional |
| `incidencias` (alumno_id) | ✅ Funcional |
| `behavior_metrics` (alumno_id, calidad, consistencia) | ✅ Drift Engine v2 activo |
| `auditoria` (tipo_accion, old_values, new_values jsonb) | ✅ Funcional |
| `seguimiento_bap` (alumno_id) | ✅ Funcional |

## Riesgos

| Riesgo | Mitigación |
|:---|:---|
| Romper la columna `grupo` en `alumnos` que usan todos los dashboards | `alumno_ciclo` es additive; `alumnos.grupo` se mantiene como snapshot y se sincroniza via trigger |
| Duplicados en drag & drop | Constraint UNIQUE (alumno_id, ciclo_id) + validación en store |
| Pérdida de historial en cierre de ciclo | INSERT-only: nunca UPDATE/DELETE en ciclos cerrados |
| Lógica IA expuesta en cliente | Endpoint serverless; frontend solo recibe sugerencias |
| Ejecución accidental de cierre | Requiere simulación previa + modal de confirmación + RLS a directivo |
| Inconsistencia entre `alumnos.grupo` y `alumno_ciclo` | Trigger SQL de sincronización automática |
