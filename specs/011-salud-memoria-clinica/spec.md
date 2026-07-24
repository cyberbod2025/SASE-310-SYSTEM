# Especificación 011 — Memoria clínica escolar protegida

Estado: Implementación completa; validación local de Postgres pendiente

## Problema

El módulo activo `DashboardSalud` no consulta `atenciones_medicas`. Presenta
incidencias generales como si fueran atenciones clínicas y el botón de alerta
crea nuevas incidencias que incluyen padecimientos del alumno.

Esto produce cuatro riesgos:

1. mezcla hechos escolares con información clínica;
2. expone padecimientos en una tabla visible para docentes y otras áreas;
3. permite insertar atenciones a cualquier usuario autenticado;
4. permite leer y editar la tabla `salud` mediante una regla amplia de
   `is_staff()`.

El enrutador tampoco protege de forma explícita los módulos sensibles de Salud,
UDEII y Trabajo Social.

## Objetivo

Construir una memoria clínica escolar mínima que permita:

- registrar atenciones reales con autoría autenticada;
- consultar el historial por alumno;
- registrar alertas clínicas activas sin copiarlas a incidencias;
- dar seguimiento y cerrar atenciones;
- mostrar pendientes, urgencias y próximas revisiones desde datos persistidos;
- limitar lectura y escritura a roles institucionales autorizados;
- conservar auditoría automática de inserciones y actualizaciones;
- negar el módulo desde la interfaz a roles no autorizados.

## Límites institucionales

SASE no diagnostica ni prescribe. Este módulo registra observación, atención
brindada, signos relevantes, entrega o referencia y seguimiento escolar.

No debe:

- emitir diagnósticos automáticos;
- recomendar medicamentos;
- compartir padecimientos mediante incidencias;
- notificar familias automáticamente;
- exponer historiales a docentes, prefectura o secretaría;
- reemplazar un expediente clínico profesional.

## Fuente de verdad

- Atenciones y seguimiento: `public.atenciones_medicas`.
- Alertas clínicas vigentes: `public.salud`.
- Identidad y rol: `auth.uid()` + `public.perfiles_usuario`.
- Auditoría: triggers institucionales hacia `public.auditoria`.

## Matriz de acceso

| Acción | medico_escolar | directivo | subdireccion | system_admin |
|---|---:|---:|---:|---:|
| Consultar atenciones | Sí | Sí | Sí | Sí |
| Consultar alertas clínicas | Sí | Sí | Sí | Sí |
| Registrar atención | Sí | No | No | Sí |
| Registrar alerta clínica | Sí | No | No | Sí |
| Actualizar seguimiento propio | Sí | No | No | Sí |
| Cerrar cualquier atención | No | Sí | Sí | Sí |

`developer`, docentes, prefectura, orientación, trabajo social, UDEII y
secretaría no reciben acceso clínico por defecto.

## Reglas funcionales

- Una atención requiere alumno, motivo, síntomas u observación, atención
  brindada, responsable, urgencia y estado.
- `atendido_por` y `generado_por` deben coincidir con `auth.uid()` en altas.
- Una atención nueva solo aparece en UI después de que Supabase devuelve su ID.
- Una actualización solo se considera exitosa si devuelve la fila afectada.
- Las atenciones no se eliminan desde el cliente.
- Una alerta clínica requiere tipo, padecimiento o riesgo e indicaciones.
- Las alertas se consultan únicamente desde `salud`; no generan incidencias.
- Los datos legados sin autor o metadatos deben mostrarse como no documentados,
  sin inventar fechas ni responsables.

## Criterios de aceptación

- El tablero carga `atenciones_medicas` y `salud` con filtros por alumnos
  visibles.
- Se pueden registrar una atención y una alerta desde formularios protegidos.
- Se puede registrar seguimiento/cierre con actualización fail-closed.
- RLS y privilegios explícitos bloquean acceso no clínico.
- El router muestra `Unauthorized` para roles fuera de la matriz.
- No queda código que copie `medicalAlerts` a `incidencias`.
- Existen pruebas de éxito, lectura, error, compatibilidad legado y RBAC.

## Fuera de alcance

- Integración con expedientes externos, recetas o laboratorios.
- Envío de WhatsApp, correo o SMS.
- Adjuntos de documentos de salud.
- Firma clínica electrónica.

## Evidencia de validación — 2026-07-18

- `pnpm lint`: 0 errores y 5 advertencias preexistentes.
- `pnpm type-check`: aprobado.
- Pruebas focales de Salud: 16/16 aprobadas.
- Suite completa: 27 archivos y 147/147 pruebas aprobadas.
- `pnpm build`: aprobado.
- `git diff --check`: aprobado.
- `scripts/audit-migrations.sh`: código 0, sin errores críticos.
- `supabase db start`: ejecutado; falló antes de iniciar por ausencia del
  daemon de Docker.
- `supabase db lint --local`: ejecutado; falló al conectar porque no existe
  Postgres local.

La migración está implementada y revisada estáticamente, pero no se considera
aplicada ni validada contra Postgres hasta resolver el requisito local de
Docker.
