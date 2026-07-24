# Plan

## Fase 1 — Datos y seguridad

- Crear migración con Supabase CLI.
- Ampliar `atenciones_medicas` con estado, urgencia, seguimiento, salida y
  actualización.
- Ampliar `salud` con tipo de alerta, indicaciones, vigencia y autor.
- Normalizar datos legados sin inventar autoría.
- Aplicar índices, privilegios mínimos, RLS y auditoría.

## Fase 2 — Servicio de aplicación

- Definir tipos de atención y alerta.
- Cargar memoria clínica filtrada por alumnos visibles.
- Registrar atenciones y alertas con confirmación de fila.
- Actualizar seguimiento/cierre con confirmación de fila.

## Fase 3 — Interfaz y RBAC

- Reemplazar incidencias por atenciones reales.
- Añadir formularios de atención y alerta.
- Mostrar historial, urgencias y pendientes.
- Eliminar difusión de padecimientos a incidencias.
- Alinear `ModuleRouter` y `usePermissions`.

## Fase 4 — Verificación

- Pruebas unitarias de servicio.
- Pruebas de interacción del tablero.
- Pruebas de enrutamiento no autorizado.
- Pruebas de invariantes de migración.
- Lint, type-check, suite completa, build y auditoría SQL.
- Supabase local cuando Docker esté disponible.

## Estado

- Investigación: completada.
- Diseño: completado.
- Implementación: completada.
- Verificación frontend y auditoría estática SQL: completadas.
- Aplicación y lint en Postgres local: pendientes por ausencia de Docker.
