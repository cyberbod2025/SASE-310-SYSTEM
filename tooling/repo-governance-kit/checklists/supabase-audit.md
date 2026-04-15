# Checklist - Auditoria Supabase

- Revisar `supabase/config.toml`.
- Revisar `supabase/migrations/*` en orden historico.
- Verificar tablas, RLS y funciones `SECURITY DEFINER` sensibles.
- Buscar policies abiertas a `anon` o `authenticated` sin restriccion suficiente.
- Verificar drift entre schema SQL, tipos generados y frontend.
- Verificar si el cliente hace mutaciones que deberian vivir en edge/server.
- Verificar edge functions, service role, CORS y allowlists de roles.
- Verificar seeds, `db reset`, `db push`, `db lint --local` y codegen si aplica.
- Marcar scripts peligrosos que apunten a proyectos hospedados o usen service role.
- Validar que auditoria y trazabilidad apunten a tablas/columnas vigentes.
