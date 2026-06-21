# Expediente 008: Migración de Foreign Keys Legadas a `perfiles_usuario`

## Contexto y Problema
El sistema implementó recientemente una mejora de seguridad que unificó los perfiles institucionales en la tabla `public.perfiles_usuario` (Expediente 002-seguridad-y-supabase-hardening). El trigger `handle_new_user_v3` se actualizó para insertar nuevos usuarios exclusivamente en esta tabla, dejando `public.profiles` como un fallback legado para usuarios antiguos.

Sin embargo, las tablas operativas (`incidencias`, `eventos`, `registro_lectura`, `atenciones_medicas`, etc.) retuvieron llaves foráneas apuntando a la tabla `public.profiles`. Como resultado, los usuarios nuevos no pueden insertar datos en el sistema, produciéndose errores constantes de integridad referencial (`23503 foreign key constraint`).

## Solución Arquitectónica
- Trasladar de forma segura todas las llaves foráneas (`FOREIGN KEY`) que referencien `public.profiles(id)` para que apunten a `public.perfiles_usuario(id)`.
- Esto garantiza que el sistema siga funcionando para todos los usuarios registrados en el sistema de seguridad actualizado.
- Las tablas afectadas incluyen pero no se limitan a: `incidencias`, `eventos`, `atenciones_medicas`, `registro_lectura`, `seguimiento_bap`, `seguimiento_social`, `respuestas_docentes`, `colectivo_respuestas_docentes`.

## Implementación
Se crea la migración SQL `20260608090000_fix_legacy_profiles_fkeys.sql` que hace lo siguiente por cada tabla afectada:
1. Elimina el constraint original (ej. `incidencias_reportado_por_fkey`).
2. Agrega el nuevo constraint apuntando a `public.perfiles_usuario(id)`.

## Riesgos y Mitigaciones
- **Riesgo:** Si existen usuarios en `profiles` que NO están en `perfiles_usuario`, las FK fallarán al intentar crearse.
- **Mitigación:** Todos los usuarios actuales en el sistema de prueba y producción fueron volcados a `perfiles_usuario` durante las migraciones de hardening (20260401083500 y superiores), por lo tanto las referencias son completamente seguras.

## Aprobación
Este cambio estructural es esencial para la funcionalidad mínima de la aplicación (guardar registros) y cumple con las guías de `memory/sase-canon.md`.
