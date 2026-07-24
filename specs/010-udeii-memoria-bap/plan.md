# Plan

## Fase 1 — Contrato de datos

- Ampliar `seguimiento_bap` con tipo de evento, observaciones, responsable y fecha de revisión.
- Añadir constraints e índice compuesto por alumno y fecha.
- Definir RLS de lectura institucional.
- Crear RPC transaccional para inserción y actualización del resumen.
- Incluir a UDEII en la lectura de alumnos.

## Fase 2 — Servicio de aplicación

- Crear tipos de evento y registro BAP.
- Implementar carga filtrada por alumnos visibles.
- Implementar registro por RPC con comprobación de sesión y respuesta.
- Mapear el resultado persistido al dominio de la interfaz.

## Fase 3 — Tablero UDEII

- Permitir seleccionar cualquier alumno.
- Sustituir la actualización destructiva por registro histórico.
- Mostrar historial del alumno seleccionado.
- Mostrar indicadores calculados desde el historial.
- Eliminar acciones simuladas y afirmaciones no sustentadas.

## Fase 4 — Pruebas y validación

- Pruebas unitarias del servicio.
- Pruebas de interacción del tablero.
- Validación focalizada y cadena completa.
- Auditoría de migraciones.
- `supabase db start` y `supabase db lint --local` cuando Docker esté disponible.

## Estado

- Investigación: completada.
- Diseño: completado.
- Implementación: completada.
- Validación frontend y auditoría estática: completadas.
- Validación Supabase local: pendiente; Docker no está disponible en el entorno.
