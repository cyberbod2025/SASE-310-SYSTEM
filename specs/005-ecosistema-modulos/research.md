# Research - 005 Ecosistema de Modulos Externos

## Fuentes revisadas

- `api/auth/launch-feria.ts`
- `src/components/Layout.tsx`
- `src/components/OrbNavigation.tsx`
- `src/components/ModuleRouter.tsx`
- `src/components/dashboards/DashboardDocente.tsx`
- `src/components/AuthProvider.tsx`
- `src/utils/onboardingLogic.ts`
- `supabase/migrations/20260419000000_feria_pilotos.sql`
- `supabase/migrations/20260110090000_create_perfiles_usuario.sql`
- `supabase/migrations/20260312110000_sase_core_logic_unification.sql`

## Hallazgos verificados

- La identidad institucional ya prioriza `perfiles_usuario` y deja `profiles` como fallback legado.
- Feria ya tenia un flujo aislado de launcher y una tabla `feria_pilotos`, pero no existia catalogo generico.
- Home, Sidebar y Router tenian hardcodes explicitos para `FERIA`.
- El repo no modela aun un rol autenticable final de alumno; `Mate` debe salir como rollout provisional para usuarios autenticados actuales.
- `public.auditoria` ya es la bitacora institucional reutilizable para exito, rechazo y error.

## Decision

- Crear un catalogo DB-driven para modulos externos y mantener la metadata visual solo en frontend.
- Resolver visibilidad de UI desde `get_modulos_ecosistema_visibles()` y autorizacion final desde backend.
- Emitir `uid` unicamente como compatibilidad temporal y usar `sub` como canonico.
