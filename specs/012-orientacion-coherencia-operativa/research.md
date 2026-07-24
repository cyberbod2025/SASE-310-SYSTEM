# Investigación

## Evidencia del flujo activo

- `ModuleRouter` carga `DashboardOrientacion` para el rol `orientacion`.
- El backend v2 existe en
  `20260501084547_orientacion_v2_backend.sql` y fue reforzado por migraciones
  posteriores.
- `DashboardOrientacion` usa RPC para casos, solicitudes, planes, derivaciones
  y escalamientos.
- El seguimiento era la excepción: hacía un `INSERT` directo con
  `user?.id ?? null` y sin fila devuelta.
- `loadStudentHistory` consultaba en `respuestas_docentes` las columnas
  `fecha`, `docente`, `comentarios`, `impacto`, `periodo` y `grupo`; ninguna
  forma parte del tipo generado actual de esa tabla.
- La fuente correcta de respuestas asignadas al caso es
  `diagnosticos_docentes`.
- `refreshCases` no cambiaba las dependencias primitivas del efecto de
  historial cuando seguían siendo el mismo `alumnoId` y `caseId`.
- `demo=1` sustituía los datos reales por una bandeja vacía.

## Decisiones

- No se crea migración: las tablas y RLS necesarias ya existen.
- El servicio de seguimiento confirma una fila completa y falla cerrado.
- Se añade una revisión explícita del historial después de mutaciones.
- Los componentes esperan un resultado booleano para limpiar solo en éxito.
- Se corrige el lenguaje institucional sin atribuir acciones no ejecutadas.

## Riesgo pendiente

La aplicación y el lint de las migraciones históricas de Orientación no pueden
repetirse en este entorno mientras Docker/Postgres local no estén disponibles.
