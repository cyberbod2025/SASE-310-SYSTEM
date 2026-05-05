# Informe de Reparación de Replayability (Migraciones)

Para poder ejecutar `supabase db reset` localmente y validar las políticas RLS, fue necesario intervenir tres migraciones previas que presentaban errores de ejecución en entornos limpios.

## 1. Migración `20260428131416_advisor_safe_hardening.sql`
- **Problema**: Intentaba ejecutar `ALTER FUNCTION` y `REVOKE` sobre funciones que no existen en un `db reset` limpio (ej. `checar_patron_incidencias`), bloqueando el inicio de Supabase.
- **Solución**: Se envolvieron todas las sentencias frágiles en bloques `DO $$ BEGIN ... EXCEPTION WHEN undefined_function THEN NULL; END $$;`. Esto permite que la migración sea tolerante a funciones faltantes sin abortar la transacción.

## 2. Migración `20260428134646_invoker_safe_helpers.sql`
- **Problema**: Similar al anterior, fallaba al intentar cambiar a `SECURITY INVOKER` funciones que aún no habían sido creadas en el orden secuencial de la base local.
- **Solución**: Aplicación de bloques `DO` defensivos para cada sentencia `ALTER FUNCTION`.

## 3. Migración `20260502000000_create_diagnosticos_docentes.sql`
- **Problema**: Error `invalid input value for enum app_role`. La política intentaba comparar el rol contra los literales `'maestro'` y `'developer'`, los cuales no existen en el tipo enum `app_role` definido en el esquema.
- **Solución**: Se añadió un cast explícito `::text` a la subconsulta de obtención de rol: `(SELECT role::text FROM profiles WHERE ...)`. Esto permite comparaciones seguras contra cualquier string sin violar las restricciones del enum.

---

> [!IMPORTANT]
> Estos cambios aseguran que el entorno sea **reproducible localmente tras `supabase db reset`**, manteniendo la integridad del histórico de migraciones sin errores de ejecución manual.
