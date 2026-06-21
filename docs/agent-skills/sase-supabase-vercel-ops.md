# SASE — Supabase & Vercel Operations

## Stack
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Supabase (Postgres, Auth, RLS, Edge Functions, Realtime)
- **Despliegue:** Vercel
- **CI:** GitHub Actions (Node 20, PNPM)

## Reglas de oro

### Supabase
- **No tocar RLS sin migración revisada.**
- **No usar `service_role` en frontend.** Nunca. La clave service_role solo se usa en edge functions o scripts server-side.
- **No mezclar frontend, RLS y Feria en un mismo PR** salvo autorización explícita.
- **No modificar variables de entorno de producción** sin instrucción directa (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.).
- Toda migración debe tener su correspondiente rollback o ser idempotente.
- Usar `supabase db diff` para generar migraciones desde cambios locales.

### Vercel
- Usar `vercel.json` para configuración de builds y rutas.
- No modificar `installCommand` ni `buildCommand` sin justificación.
- Validar que `ALLOWED_ORIGINS` incluya `http://localhost:3100` para desarrollo local.
- `ignoreCommand` existe para evitar builds duplicados entre proyectos Vercel.

## Flujo de trabajo
1. **Branch** — crear rama con prefijo semántico (`fix/`, `feat/`, `docs/`, `chore/`).
2. **Cambios pequeños** — un alcance por commit.
3. **Pruebas locales**:
   ```bash
   pnpm type-check
   pnpm test
   pnpm build
   ```
4. **Commit quirúrgico** — `git add <archivos específicos>`.
5. **Push** y **PR**.
6. **Revisar checks** — CI debe pasar: lint, type-check, test, build.
7. **Merge solo con aprobación humana** — nunca automático.

## Archivos protegidos
- `package.json` — no modificar sin instrucción explícita.
- `pnpm-lock.yaml` — no modificar manualmente.
- `supabase/config.toml` — cambios requieren revisión.
- `vercel.json` — cambios requieren revisión.
- `src/supabase/types.ts` — regenerar con `supabase gen types`.

## Prohibido
- Hacer merge de PRs con checks fallando.
- Desplegar manualmente a producción sin PR mergeado.
- Compartir claves de servicio (service_role, anon key de producción).
- Modificar RLS policies fuera de migraciones versionadas.
