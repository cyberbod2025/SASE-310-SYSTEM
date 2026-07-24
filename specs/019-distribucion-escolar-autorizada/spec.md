# Especificación 019 — Distribución escolar autorizada

Estado: Implementada y validada estáticamente; validación contra Supabase real
pendiente

## Problema

`/api/ai/distribucion` usa `SUPABASE_SERVICE_ROLE_KEY`, pero actualmente:

- no autentica al solicitante;
- no valida cuenta activa, seguridad activa ni rol institucional;
- acepta un cuerpo sin lista cerrada de campos;
- permite consultar cualquier ciclo conocido;
- obtiene nombre y datos BAP aunque el algoritmo no los necesita;
- no limita frecuencia;
- no registra quién generó la propuesta ni con qué propósito;
- devuelve errores internos de base;
- puede presentar una regla algorítmica como decisión institucional.

Al estar bajo `api/`, el endpoint es una superficie pública aunque hoy no exista
un consumidor visible en React.

## Objetivo

Conservar la capacidad de producir una propuesta de distribución, pero convertirla
en una consulta institucional restringida, mínima, trazable y explícitamente
humana:

- autenticar con la sesión de Supabase;
- autorizar solo perfiles canónicos activos y seguros;
- limitar la operación a Dirección, Subdirección y roles técnicos;
- aceptar únicamente `cycleId` y `purpose`;
- consultar solo identificador y puntaje persistido de riesgo;
- no leer nombres, CURP, tutor ni BAP;
- generar una propuesta determinista sin guardar cambios;
- auditar actor, rol, ciclo, propósito y volumen;
- devolver una marca clara de “solo propuesta” y “requiere aprobación humana”.

## Reglas

- No existe acceso anónimo.
- No se usa `profiles` como fallback.
- Los perfiles deben tener `estado_cuenta = 'activo'` y
  `seguridad_status = 'active'`.
- Roles permitidos: `directivo`, `subdireccion`, `system_admin` y `developer`.
- El cuerpo no admite campos distintos de `cycleId` y `purpose`.
- `cycleId` debe ser UUID y corresponder a un ciclo activo.
- `purpose` es obligatorio, entre 5 y 240 caracteres.
- El rate limit se identifica por usuario e IP.
- El algoritmo no persiste `grupo_sugerido` ni modifica alumnos o grupos.
- El resultado no incluye puntajes de riesgo ni datos personales.
- La auditoría debe persistirse antes de devolver la propuesta.
- Los errores al cliente no revelan mensajes internos de Postgres.
- La propuesta no equivale a asignación ni autorización automática.

## Criterios de aceptación

- El endpoint falla cerrado sin origen, token, perfil activo/seguro o rol.
- La llave administrativa nunca opera antes de autenticar al usuario.
- La consulta a `alumno_ciclo` no selecciona `nombre_completo` ni `datos_bap`.
- La respuesta contiene solo referencias de alumno, grupo sugerido, conteos y
  las banderas de propuesta.
- La salida es determinista ante empates.
- Existe auditoría con actor derivado del token y propósito visible.
- Existen pruebas del endpoint y de sus invariantes de seguridad.
- Handler, tipos, lint, suite y build continúan aprobando.

## Fuera de alcance

- Aplicar automáticamente la distribución.
- Crear una interfaz nueva para aprobar la propuesta.
- Diseñar un modelo pedagógico definitivo de conformación de grupos.
- Reemplazar la decisión colegiada por un puntaje.
- Validar contra un proyecto Supabase hospedado.

## Estado de validación

- Pruebas focales: 2 archivos y 9 casos aprobados.
- Suite completa: 52 archivos y 241 casos aprobados.
- `type-check`: aprobado.
- `lint`: 0 errores y 4 advertencias preexistentes.
- Handler: empaquetado con esbuild.
- Build de producción: aprobado con dos advertencias históricas de chunks.
- `git diff --check`: aprobado.
- No se consultó ni escribió un proyecto Supabase real; autenticación, datos y
  auditoría se validaron con dobles controlados.
