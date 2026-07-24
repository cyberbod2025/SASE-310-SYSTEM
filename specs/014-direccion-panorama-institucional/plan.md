# Plan

## Fase 1 — Fuente institucional

- Crear RPC agregado con rol activo obligatorio.
- Incluir todas las áreas sin texto sensible.
- Añadir índices solo si la consulta los necesita y no existen.

## Fase 2 — Servicio

- Confirmar sesión.
- Mapear nulos y tipos sin inventar valores.
- Fallar cerrado ante RLS o respuesta inválida.

## Fase 3 — Dashboard

- Sustituir casos y seguimientos sintéticos.
- Mostrar carga por área y concentración por grupo.
- Mostrar fuentes y próxima acción real por alumno.
- Generar el reporte desde la misma memoria.
- Retirar mutaciones que no tienen dominio persistente.

## Fase 4 — Verificación

- Pruebas de servicio, UI e invariantes SQL.
- Lint, type-check, suite, build, diff y auditoría de migraciones.
- Postgres local cuando Docker esté disponible.
