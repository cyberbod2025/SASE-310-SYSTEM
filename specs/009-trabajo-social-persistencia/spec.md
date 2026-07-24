# Expediente 009: Persistencia institucional de Trabajo Social

## Problema

El panel de Trabajo Social presenta casos, citatorios, contactos familiares, visitas y acuerdos, pero los datos se construyen como fixtures y las acciones viven solo en estado React. Al recargar, la memoria institucional se pierde y la interfaz declara explícitamente que varias acciones son borradores locales.

## Resultado esperado

Las acciones operativas de Trabajo Social deben quedar registradas en Supabase, asociadas al alumno, al usuario autenticado, a la fecha y al tipo de intervención; deben poder consultarse al volver a abrir el caso y alimentar la trazabilidad institucional.

## Alcance de esta vertical

- Registrar contacto familiar, citatorio, visita domiciliaria, acuerdo y cambio de estado.
- Consultar los registros del caso seleccionado.
- Mantener separación entre datos sensibles y datos de presentación.
- Denegar por defecto a usuarios sin perfil institucional activo.
- Auditar inserciones y cambios mediante los mecanismos vigentes del repositorio.

## Fuentes de verdad actuales

- UI actual: `src/components/dashboards/DashboardTrabajoSocial.tsx`.
- Tipos y fixtures actuales: `src/components/trabajoSocial/trabajoSocialTypes.ts`.
- Tabla legado disponible: `public.seguimiento_social` en `supabase/migrations/20240101000000_core_sase_schema.sql`.
- Modelo institucional reciente de trazabilidad: `interventions_log`, `contacts_log`, `citas_padres` y `evidence_log`.
- Identidad y rol: `public.perfiles_usuario`, con `auth.uid()` como autoría.

## No objetivos

- No crear usuarios ni usar `service_role` desde el cliente.
- No convertir la plataforma en un sistema punitivo.
- No declarar persistencia hasta validar migración, RLS, consulta, UI y pruebas.

## Riesgos

- Exponer contexto familiar sensible a roles no autorizados.
- Duplicar el dominio ya representado por tablas de seguimiento recientes.
- Romper tipos generados o políticas existentes.
- Confundir fixtures de demo con registros reales.

## Criterios de aceptación

1. Una acción válida de Trabajo Social inserta un registro persistente con `alumno_id`, `created_by`/autor equivalente, tipo, fecha y contenido.
2. El caso se recarga desde la base de datos; no depende de fixtures para mostrar sus acciones registradas.
3. RLS exige usuario autenticado, perfil activo y rol autorizado; la autoría no puede falsificarse desde el cliente.
4. La UI deja de mostrar “borrador local” para acciones persistentes y muestra error verificable si la escritura falla.
5. Hay pruebas focalizadas para escritura, lectura, manejo de error y permisos.
