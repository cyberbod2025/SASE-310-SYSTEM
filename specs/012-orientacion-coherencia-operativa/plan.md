# Plan

## Fase 1 — Integridad de consulta

- Sustituir la fuente colectiva incorrecta.
- Seleccionar columnas explícitas.
- Propagar errores de lectura.
- Conservar ausencias de fecha sin fabricar valores.

## Fase 2 — Confirmación de escritura

- Añadir servicio tipado para seguimiento.
- Exigir sesión institucional.
- Confirmar la fila insertada.

## Fase 3 — Coherencia de interfaz

- Forzar recarga de historial tras mutaciones.
- Esperar guardados desde formularios.
- Limpiar campos solo en éxito.
- Corregir copias de derivación y escalamiento.
- Eliminar el vaciado por `demo=1`.

## Fase 4 — Verificación

- Añadir pruebas de API y dashboard.
- Ejecutar lint, type-check, pruebas, build y diff check.

## Estado

- Integridad de consulta: completada.
- Confirmación de escritura: completada.
- Coherencia de interfaz: completada.
- Verificación frontend: completada.
