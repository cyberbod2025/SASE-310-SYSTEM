# Research 007 - Hardening Edge para Feria

## Hallazgos

- Supabase Advisor reporta RPCs `SECURITY DEFINER` ejecutables por `authenticated`.
- `public.registrar_progreso_v2` y `public.finalizar_trivia_v2` mutan progreso, puntos y visitantes.
- El repo local tenía grants/revokes para esas RPCs, pero no sus definiciones originales; se verificaron en Supabase con introspección de `pg_proc`.
- `public` está expuesto en `supabase/config.toml`, así que cualquier función con `EXECUTE` puede publicarse vía PostgREST.

## Decisiones

- No revocar en esta fase para evitar romper Feria.
- Usar Edge Functions como único punto nuevo de entrada.
- Guardar tokens de sesión opacos como hash.
- Mantener funciones internas en `public` para que Edge pueda llamarlas por PostgREST con `service_role`, pero revocarlas para `anon`, `authenticated` y `public`.
