# Especificación 018 — Notificaciones a tutores confiables

Estado: Implementada y validada estáticamente; aplicación SQL, proveedor real y
despliegue pendientes

## Problema

El flujo actual de WhatsApp no representa con fidelidad una comunicación
institucional:

- el cliente envía teléfono, mensaje, alumno y tipo de incidencia;
- el servidor no deriva esos datos desde la incidencia persistida;
- el perfil usa `perfiles_usuario` sin exigir cuenta activa y segura, y todavía
  conserva un fallback a `profiles`;
- si faltan credenciales de Meta responde `success: true` en modo simulado;
- la interfaz puede marcar una incidencia como notificada aunque no hubo
  entrega;
- una escalada crítica puede disparar el intento externo automáticamente;
- no existe un registro durable de intentos, fallos, simulaciones y entregas;
- el log y la auditoría pueden conservar el teléfono completo y texto sensible;
- los fallos del proveedor no dejan una resolución institucional trazable.

## Objetivo

Convertir la notificación a tutores en una acción humana, explícita, derivada de
datos institucionales y con estado durable:

- el cliente solo solicita notificar una incidencia por su identificador;
- el servidor deriva alumno, tipo, teléfono y plantilla desde base;
- una RPC inicia el intento y otra lo resuelve;
- solo una entrega confirmada cambia `incidencias.notificado_whatsapp`;
- simulación y fallo nunca se presentan como envío;
- cada intento conserva actor, rol, propósito, estado y referencia institucional
  sin guardar el teléfono completo;
- una alerta crítica crea una tarea interna, no un envío externo automático.

## Reglas

- Solo perfiles en `perfiles_usuario` con `estado_cuenta = 'activo'` y
  `seguridad_status = 'active'` pueden solicitar el envío.
- No existe fallback de autorización a `profiles`.
- Los roles técnicos pueden operar el sistema, pero no se aceptan alias ambiguos
  como `admin`.
- El payload público contiene únicamente `incidentId`.
- La incidencia y el tutor se consultan en servidor.
- El teléfono se usa transitoriamente y solo se persisten sus últimos cuatro
  dígitos.
- La tabla de intentos tiene RLS y no permite escrituras directas del cliente.
- Las RPC de inicio y resolución son exclusivas de `service_role`.
- El modo sin credenciales registra `SIMULADO`, devuelve `delivered: false` y
  no modifica la incidencia.
- Un error del proveedor registra `FALLIDO`, devuelve un error seguro y no
  modifica la incidencia.
- `ENVIADO` exige un identificador del proveedor y marca la incidencia dentro de
  la misma transacción de resolución.
- La auditoría deriva el actor institucional y registra propósito, origen,
  incidencia y alumno sin teléfono completo.
- No se envían mensajes externos automáticamente por una regla de riesgo.

## Criterios de aceptación

- `sendWhatsAppNotification` recibe solo `incidentId`.
- `whatsapp.ts` no acepta `to`, `message`, `studentName` ni `incidentType`.
- El endpoint falla cerrado con perfil inactivo, inseguro o rol no permitido.
- Existen `iniciar_notificacion_whatsapp` y
  `resolver_notificacion_whatsapp`, solo para `service_role`.
- Existe `notificaciones_whatsapp` con estados
  `PENDIENTE`, `ENVIADO`, `SIMULADO` y `FALLIDO`.
- El endpoint no registra teléfono ni mensaje en consola.
- El resultado de simulación no se interpreta como éxito.
- `StudentAdvancedPanel` actualiza el estado local solo tras entrega confirmada.
- `useStudentsSlice` no ejecuta WhatsApp automáticamente.
- Existen pruebas de servicio, interfaz, endpoint e invariantes SQL.

## Fuera de alcance

- Configurar credenciales reales de Meta.
- Aprobar o crear plantillas en WhatsApp Business.
- Implementar una cola externa de reintentos.
- Confirmar lectura por el tutor.
- Aplicar migraciones o desplegar en un proyecto hospedado.

## Estado de validación

- Pruebas focales: 5 archivos y 19 casos aprobados.
- Suite completa: 50 archivos y 232 casos aprobados.
- `type-check`: aprobado.
- `lint`: 0 errores y 4 advertencias preexistentes.
- Build de producción: aprobado, con dos advertencias históricas de chunks.
- Handler de WhatsApp: empaquetado con esbuild.
- Auditoría de migraciones: aprobada; conserva advertencias históricas ajenas a
  este cambio.
- `git diff --check`: aprobado.
- PostgreSQL local: no validado porque Docker Desktop no está disponible y no
  existe una base escuchando en `127.0.0.1:54322`.
- No se aplicó la migración ni se probó una entrega real de Meta.
