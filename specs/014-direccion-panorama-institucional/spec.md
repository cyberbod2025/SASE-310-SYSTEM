# Especificación 014 — Panorama institucional de Dirección

Estado: Implementada y validada en frontend; aplicación SQL local pendiente

## Problema

El dashboard activo de Dirección deriva un supuesto expediente directivo desde
el estado semáforo del alumno y el número de incidencias:

- inventa cuatro seguimientos y sus fechas;
- considera vencido un seguimiento sin una fecha persistida;
- interpreta un dato BAP o una incidencia como diagnóstico docente;
- presenta una línea de tiempo que no proviene de eventos reales;
- ofrece cierre, reapertura, evidencia y reagendamiento sobre un caso directivo
  que no existe;
- muestra datos sensibles desde memoria local y sin propósito específico.

Esto puede aparentar trazabilidad donde solo existe una inferencia de interfaz.

## Objetivo

Dar a Dirección y Subdirección un panorama agregado, verificable y mínimo de:

- riesgo institucional persistido;
- incidencias abiertas;
- casos y seguimiento de Orientación;
- acompañamientos abiertos de Trabajo Social;
- apoyos BAP pendientes de revisión;
- atenciones de Salud con seguimiento pendiente;
- próxima fecha de acción registrada;
- carga abierta por área y grupos con mayor concentración.

## Reglas

- El cliente no recalcula el semáforo.
- Ninguna fecha, seguimiento, diagnóstico o evidencia se inventa.
- Salud solo aporta conteos y fechas de seguimiento; no contenido clínico.
- Trabajo Social no expone motivos ni notas sensibles en este panorama.
- El RPC solo puede invocarse por `directivo`, `subdireccion` y
  `system_admin` activos.
- La pantalla debe distinguir dato no documentado de dato inexistente.
- Las recomendaciones de Sasito son resúmenes deterministas de los conteos
  confirmados, no análisis IA ni predicciones.
- No habrá cierre ni reapertura de “caso directivo” hasta contar con un dominio
  persistente específico.

## Criterios de aceptación

- Existe un RPC agregado con autorización fail-closed.
- La respuesta no incluye texto clínico, BAP privado ni seguimiento social.
- Dirección carga el RPC después de confirmar sesión.
- Un fallo de RLS no conserva datos anteriores ni muestra datos ficticios.
- KPIs, carga por área, concentración por grupo y reporte usan la misma fuente.
- Se retira del dashboard activo la línea de tiempo y los seguimientos
  fabricados.
- Se retiran acciones de cierre, reapertura, evidencia y reagendamiento
  genéricas.
- Existen pruebas del servicio, dashboard e invariantes SQL.

## Fuera de alcance

- Crear el expediente transaccional propio de Dirección.
- Predicción automática de riesgo.
- Mostrar contenido clínico o diagnóstico BAP.
- Aplicar sanciones o cambiar el semáforo desde Dirección.

## Estado de validación

- `pnpm lint`: 0 errores; 5 advertencias preexistentes fuera del corte.
- `pnpm type-check`: aprobado.
- pruebas focales: 4 archivos, 13 pruebas aprobadas.
- suite completa: 33 archivos, 174 pruebas aprobadas.
- `pnpm build`: aprobado.
- `git diff --check`: aprobado; solo avisos de normalización LF/CRLF.
- `scripts/audit-migrations.sh`: sin errores críticos.
- `pnpm exec supabase db start`: bloqueado porque Docker no está activo.
- `pnpm exec supabase db lint --local`: bloqueado porque Postgres local no
  está disponible.

La migración está implementada y cubierta por invariantes estáticas, pero no se
declara aplicada ni lintada contra una base real.
