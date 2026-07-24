# Especificación 012 — Coherencia operativa de Orientación

Estado: Implementación completa y validada en frontend

## Problema

Orientación ya dispone de backend persistente, pero el flujo activo conserva
cuatro brechas:

1. consulta columnas inexistentes de `respuestas_docentes` y las atribuye al
   historial individual usando solo el grupo;
2. registra seguimiento con un `INSERT` directo sin exigir confirmación de fila;
3. no vuelve a consultar el historial cuando una mutación conserva los mismos
   identificadores de caso y alumno;
4. describe derivaciones y escalamientos como visitas o sanciones automáticas
   que el backend no ejecuta.

## Objetivo

- Consultar únicamente diagnósticos docentes vinculados al caso.
- Registrar seguimientos con sesión, autoría y fila confirmada.
- Refrescar la memoria visible después de cada mutación persistida.
- Conservar formularios cuando una escritura falla y limpiarlos al confirmar.
- Eliminar fechas inventadas y afirmaciones operativas no sustentadas.

## Reglas

- Un reporte colectivo de grupo no se presenta como dato individual.
- Una mutación no se refleja en UI hasta que Supabase la confirma.
- Los vacíos históricos se muestran como no documentados.
- Derivar registra y comparte el caso con Trabajo Social; no programa visitas.
- Escalar solicita valoración directiva; no impone sanciones automáticas.
- El parámetro de URL `demo=1` no debe ocultar datos reales.

## Fuera de alcance

- Rediseñar las tablas del backend v2.
- Cambiar la matriz RLS histórica de Orientación.
- Cerrar casos desde Orientación.
- Automatizar visitas, sanciones o notificaciones.

## Criterios de aceptación

- `loadStudentHistory` no consulta `respuestas_docentes`.
- Los diagnósticos docentes se filtran por `caso_id`.
- Las fechas ausentes siguen siendo `null`.
- El alta de seguimiento usa `auth.getUser()` y `INSERT ... RETURNING`.
- Planes, solicitudes y seguimientos refrescan el historial.
- Los formularios conservan datos en error y se limpian en éxito.
- Las confirmaciones describen exactamente la acción persistida.

## Evidencia de validación — 2026-07-18

- Pruebas focales: 2 archivos y 8/8 casos aprobados.
- `pnpm type-check`: aprobado.
- `pnpm lint`: 0 errores y 5 advertencias preexistentes.
- Suite completa: 28 archivos y 153/153 pruebas aprobadas.
- `pnpm build`: aprobado.
- `git diff --check`: aprobado.

Este corte no añade ni modifica migraciones. La repetición del backend histórico
en Postgres local permanece condicionada a que Docker esté disponible.
