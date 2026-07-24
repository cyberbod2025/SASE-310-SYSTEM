# Plan de implementación

1. Confirmar columnas, claves, triggers y RLS de las tablas de seguimiento recientes.
2. Elegir un modelo único de persistencia o justificar una migración específica.
3. Actualizar tipos Supabase y una capa de servicio de Trabajo Social.
4. Conectar lectura y escritura del dashboard con manejo fail-closed de errores.
5. Añadir pruebas unitarias/integración focalizadas y revisión manual de `api/`, `supabase/` y `tests/`.
6. Ejecutar `pnpm lint`, `pnpm type-check`, pruebas focalizadas, suite completa, build y auditoría de migraciones si se modifica SQL.

## Estado

Los pasos 1 a 5 están implementados. El paso 6 está completo para frontend y auditoría estática; queda pendiente la ejecución de la migración y `db lint` en Supabase local con Docker disponible.
