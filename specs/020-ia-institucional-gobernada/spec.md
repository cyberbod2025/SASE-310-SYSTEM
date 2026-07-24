# Especificación 020 — IA institucional gobernada

Estado: Implementada y validada estáticamente; validación real pendiente

## Problema

Los proxies `/api/ai/gemini` y `/api/ai/openrouter` validan el token de Auth, pero:

- no exigen un perfil canónico activo y seguro;
- aceptan cualquier usuario autenticado, incluidos roles no institucionales;
- reciben prompts arbitrarios sin propósito ni tipo de uso;
- no detectan identificadores personales escolares;
- limitan por IP, no por identidad;
- no registran solicitud, proveedor, resultado ni propósito en Caja Negra;
- devuelven mensajes internos de los proveedores;
- permiten que el cliente elija modelos dentro de listas antiguas;
- el guardrail de React contiene un placeholder declarado como simulación;
- `AIClient` serializa el contexto completo del sistema;
- el análisis de expedientes envía nombre, grupo, incidencias y folios a Gemini;
- un generador de documentos llama Gemini sin encabezado de autenticación.

## Objetivo

Convertir la IA en una herramienta auxiliar gobernada y no en un canal invisible de
salida de datos:

- autorizar por perfil canónico, estado, seguridad y rol;
- exigir `purpose` y `contextType`;
- limitar el cuerpo a campos conocidos;
- aplicar controles de privacidad también en servidor;
- auditar antes y después del proveedor sin guardar el prompt;
- ocultar fallos internos;
- eliminar guardrails simulados y contexto serializado;
- impedir el análisis externo de expedientes personales;
- mantener todo resultado como borrador sujeto a revisión humana.

## Contextos permitidos

- `asistente_institucional`
- `redaccion_institucional`
- `borrador_documento`

`analisis_expediente` no se permite en proveedores externos.

## Reglas

- Solo perfiles de personal en `perfiles_usuario` con cuenta y seguridad activas.
- No existe fallback a `profiles` ni alias ambiguo `admin`.
- Se rechazan campos distintos de `prompt`, `model`, `purpose` y `contextType`.
- El propósito debe tener entre 5 y 240 caracteres.
- El prompt debe tener entre 1 y 8000 caracteres.
- Se rechazan CURP, correos, teléfonos, matrículas, RFC, domicilio, datos de tutor,
  BAP y etiquetas directas de nombre de alumno.
- El rate limit combina usuario e IP.
- Antes de contactar al proveedor se registra `IA_SOLICITUD_AUTORIZADA`.
- Éxito y fallo generan una segunda entrada de auditoría.
- Auditoría y logs nunca incluyen prompt, respuesta ni identificadores detectados.
- Un fallo de auditoría inicial impide la salida externa.
- Un fallo de auditoría final impide presentar el texto como resultado institucional.
- Los errores de proveedor se traducen a mensajes seguros.
- El cliente no serializa objetos de contexto.
- Los expedientes producen una síntesis local basada en conteos, no una llamada
  externa.
- Los documentos generados por IA son borradores; nunca se guardan automáticamente.

## Criterios de aceptación

- Ambos endpoints comparten autorización y controles de privacidad.
- Perfil inactivo, inseguro o no autorizado recibe 403.
- Prompt con CURP, correo o teléfono se rechaza antes del proveedor.
- Cada llamada válida exige propósito y contexto.
- Caja Negra recibe solicitud y resolución sin prompt.
- `guards.ts` no contiene placeholders ni menciones de simulación.
- `AIClient` no usa `JSON.stringify(request.context)`.
- `generarAnalisisIA` no usa `fetch` ni envía datos del alumno.
- `GeneradorDocumentos` produce los documentos de caso localmente y no contacta
  proveedores externos.
- Existen pruebas de privacidad, endpoint, clientes y expediente.
- Type-check, lint, suite, build y empaquetado continúan aprobando.

## Fuera de alcance

- Consentimiento individual para transferencias a proveedores.
- Hospedar un modelo privado.
- Clasificación semántica completa de datos personales.
- Guardar conversaciones de Sasito.
- Aprobar automáticamente documentos o decisiones.
- Desplegar llaves o probar proveedores reales.

## Estado de validación

- Pruebas focales: 3 archivos, 12 pruebas aprobadas.
- Suite completa: 55 archivos, 253 pruebas aprobadas.
- Type-check: aprobado.
- Lint: 0 errores y 4 avisos históricos.
- Build: aprobado con el aviso histórico de partición de `TourGuide`.
- Empaquetado independiente de Gemini y OpenRouter: aprobado.
- `git diff --check`: aprobado; solo se reportaron avisos de normalización LF/CRLF.
- Supabase real y proveedores externos: no invocados; no se afirma validación
  operativa, de persistencia ni de despliegue.
