# Especificación 013 — Prefectura con registro y canalización segura

Estado: Implementada y validada en frontend; aplicación SQL local pendiente

## Problema

El dashboard activo de Prefectura mezcla acciones reales con simulaciones:

- no espera la confirmación de `addIncident`;
- presenta éxito aunque la incidencia haya sido rechazada;
- conserva un ID local aleatorio en vez del UUID de Postgres;
- el registro de asistencia absorbe errores;
- “Notificar Tutor” solo muestra un mensaje local;
- “Escalar a Orientación” crea una incidencia de conducta, pero no abre ni
  asigna un caso visible en la bandeja de Orientación;
- varias etiquetas describen control y vigilancia en vez de acompañamiento.

## Objetivo

- Confirmar incidencias y asistencia antes de mostrar éxito.
- Conservar en estado local el UUID y fecha reales de la incidencia.
- Canalizar a Orientación mediante una operación transaccional y auditada.
- Asignar el caso a una cuenta activa de Orientación.
- Reutilizar un caso abierto del alumno y añadir seguimiento en vez de duplicar.
- Eliminar acciones simuladas y lenguaje punitivo o de vigilancia.

## Reglas

- Prefectura no crea una incidencia para representar una canalización.
- La canalización requiere motivo escrito y alumno válido.
- Solo `prefectura` y `system_admin` pueden invocar el RPC.
- La persona responsable debe tener rol `orientacion`, cuenta activa y estado
  de seguridad activo.
- La asignación prioriza a quien tenga menos casos abiertos.
- Si ya existe un caso abierto, se conserva y se agrega una entrada trazable.
- No se envían mensajes a familias en este corte.
- Una observación general debe abrir el formulario descriptivo; no se guarda
  una frase genérica como hecho.

## Criterios de aceptación

- `addIncident` usa `INSERT ... RETURNING` y no genera IDs locales.
- `registerAttendance` devuelve `boolean`.
- Prefectura no audita ni anuncia éxito si una escritura falla.
- Existe `referir_caso_orientacion` con validación de actor y asignación activa.
- El dashboard confirma la asignación real devuelta por el RPC.
- No queda un botón que simule notificación familiar.
- No se copia la canalización a `incidencias`.
- Existen pruebas de servicio, UI, store e invariantes SQL.

## Fuera de alcance

- WhatsApp, SMS o correo a familias.
- Cierre de incidencias.
- Sanciones automáticas.
- Cambiar el motor institucional de riesgo.

## Estado de validación

- `pnpm lint`: 0 errores; 5 advertencias preexistentes fuera del corte.
- `pnpm type-check`: aprobado.
- pruebas focales: 5 archivos, 19 pruebas aprobadas.
- suite completa: 31 archivos, 166 pruebas aprobadas.
- `pnpm build`: aprobado.
- `git diff --check`: aprobado; solo avisos de normalización LF/CRLF.
- `scripts/audit-migrations.sh`: sin errores críticos.
- `pnpm exec supabase db start`: bloqueado porque Docker no está activo.
- `pnpm exec supabase db lint --local`: bloqueado porque Postgres local no
  está disponible.

La migración está implementada y cubierta por invariantes estáticas, pero no se
declara aplicada ni lintada contra una base real.
