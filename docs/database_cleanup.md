# SASE-310: Auditoría y Limpieza de Esquema (Database Cleanup)

Este documento registra las acciones tomadas para eliminar ambigüedad en la base de datos de SASE-310, moviendo tablas obsoletas (legacy) a un esquema de archivo y unificando la identidad del estudiante.

---

## Tablas Archivadas

Las siguientes tablas han sido movidas al esquema `archive` para asegurar que NO sean utilizadas por nuevas consultas y evitar confusión con las tablas operativas:

| Tabla Legacy                 | Motivo de Archivado                                                 | Fecha de Archivado | Sustituto Operativo  |
| :--------------------------- | :------------------------------------------------------------------ | :----------------- | :------------------- |
| `public.students`            | Duplicidad con `public.alumnos`. Tabla redundante de prototipo.     | 2026-03-05         | `public.alumnos`     |
| `public.incidents`           | Duplicidad con `public.incidencias`. Tabla redundante de prototipo. | 2026-03-05         | `public.incidencias` |
| `public.sandbox_personas`    | Tabla de pruebas (Sandbox) no utilizada en producción.              | 2026-03-05         | `public.alumnos`     |
| `public.sandbox_incidencias` | Tabla de pruebas (Sandbox) no utilizada en producción.              | 2026-03-05         | `public.incidencias` |

---

## Integración de Gamificación (Islas del Saber)

Se ha unificado el sistema de gamificación con el sistema escolar central:

1. **Relación Directa**: Se añadió la columna `alumno_id` a la tabla `estudiantes`.
2. **Integridad Referencial**: Se estableció una `FOREIGN KEY` hacia `public.alumnos(id)` con `ON DELETE CASCADE`.
3. **Migración de Identidad**: Los registros existentes en `estudiantes` fueron vinculados automáticamente a `alumnos` mediante coincidencia de `nickname` y `nombre_completo`.

---

## Nueva Vista de Consulta Integral: `expediente_integral_alumno`

Se implementó una vista agregada para facilitar reportes a Dirección y Orientación sin modificar la estructura de las tablas fuente.

**Estructura de la Vista:**

- `alumno_id`: Identificador único (UUID).
- `nombre`: Nombre completo del alumno.
- `total_incidencias`: Conteo histórico de registros en el módulo de incidencias.
- `total_atenciones_medicas`: Registros en el módulo de salud/enfermería.
- `puntos_gamificacion`: Progreso actual en "Islas del Saber".
- `tiene_ficha_social`: Indicador binario de existencia de datos socioeconómicos.

---

## Validación de Estabilidad

- [x] **App Compila**: Confirmado que no hay referencias rotas a tablas archivadas en el código frontend.
- [x] **Supabase Client**: Actualización de consultas en `useStudentsSlice.ts` para usar la nueva relación con gamificación.
- [x] **Auditoría**: Acciones registradas en la tabla `public.auditoria`.

---

**Autor**: Antigravity (AI Coding Assistant)  
**Proyecto**: SASE-310 (Sistema de Acompañamiento y Seguimiento Escolar)  
**Estado**: Estable y Limpio.
