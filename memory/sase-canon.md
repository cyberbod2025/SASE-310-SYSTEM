# Canon Brownfield de SASE-310

Estado: Canonico
Objetivo: concentrar reglas verificadas del repo para futuros agentes y mantenedores.

## Fuentes de verdad usadas

- `AGENTS.md`
- `package.json`
- `.github/workflows/build-check.yml`
- `.github/workflows/sase-secure-pipeline.yml`
- `.github/workflows/security-audit.yml`
- `vite.config.ts`
- `tsconfig.json`
- `eslint.config.js`
- `vitest.config.ts`
- `supabase/config.toml`
- `src/App.tsx`
- `src/store.tsx`
- `src/lib/supabaseClient.ts`
- `src/supabase/client.ts`
- `src/components/RegistroPersonal.tsx`
- `src/components/AprobacionesPersonal.tsx`
- `src/components/ai/aiRouter.ts`
- `api/notifications/whatsapp.ts`
- `supabase/functions/invite-staff/index.ts`
- `supabase/migrations/20260111_sistema_institucional_completo.sql`
- `supabase/migrations/20260120_request_staff_access.sql`
- `supabase/migrations/20260310160000_risk_semaphore_backend.sql`
- `.jules/sentinel.md`
- `PRD.md`
- `docs/SECURITY_AUDIT_REPORT_2026-03-28.md`

## 1. Limites reales del repo

- `README.md` raiz no describe la app; es del Supabase CLI. La app activa vive en la raiz del repo.
- `sasito-ai-copilot/` es otra app/prototipo con su propio `package.json`; no es la aplicacion principal.
- La base SDD de este repo vive ahora en:
  - `memory/constitution.md`
  - `memory/sase-canon.md`
  - `specs/`

## 2. Arquitectura verificada

- No hay React Router como fuente principal de navegacion. Flujo real: `src/index.tsx` -> `AuthProvider` -> `App` -> `AppProvider` -> `AppShell` -> `ModuleRouter`.
- El entrypoint del estado es `src/store.tsx`; los slices viven en `src/store/slices`.
- La fuente real del client Supabase es `src/lib/supabaseClient.ts`; `src/supabase/client.ts` solo reexporta por compatibilidad.
- El rol del usuario se busca primero en `perfiles_usuario`; `profiles` queda como fallback legado.
- IA no entra por un solo punto: `src/components/ai/aiRouter.ts` usa `/api/ai/openrouter`, pero `src/modules/documentos/*` y `src/modules/expedientes/*` llaman `/api/ai/gemini` directo.

## 3. Reglas de build, test y verificacion

- La cadena minima verificada del frontend usa pnpm: `pnpm install --frozen-lockfile` -> `pnpm lint` -> `pnpm type-check` -> `pnpm test` -> `pnpm build`.
- `pnpm lint` ejecuta `eslint src` y `pnpm type-check` usa `tsc --noEmit`; ambas validaciones solo cubren `src/`.
- `pnpm test` usa Vitest + jsdom + `tests/setup.ts`.
- Prueba focalizada por archivo: `pnpm test -- tests/Agenda.test.tsx`.
- `tests/test-sprite-*.js` no entran al script `npm run test`; son scripts manuales de render.
- Si el cambio toca SQL o RLS, ejecuta ademas `./scripts/audit-migrations.sh`, `supabase db start` y `supabase db lint --local`.

## 4. Entorno local y gotchas

- Vite corre en `3100`; el repo no usa `3000` ni `5173` como puerto principal de desarrollo.
- El origen local correcto para pruebas de `/api/*` y auth es `http://localhost:3100`, y debe aparecer en `ALLOWED_ORIGINS`.
- El frontend falla al arrancar si faltan `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY`.
- Los handlers server-side tambien dependen de variables no reflejadas por completo en docs heredadas: `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`, `GOOGLE_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`.
- `supabase/config.toml` debe permanecer alineado con el seed real del repo (`./seed_data.sql`).

## 5. Seguridad y limites sensibles

- El principio correcto de roles es fail-closed. `.jules/sentinel.md` registra como hallazgo critico que nunca debe volver a existir un fallback permisivo a `docente`.
- `supabase.auth.admin` no debe aparecer en `src/`; el CI ya lo busca y debe permanecer asi.
- `solicitudes_alta_personal` contiene PII sensible y `metadata` operativa. Cualquier cambio futuro debe tratar esa tabla como superficie critica de seguridad.
- `api/notifications/whatsapp.ts` es endpoint sensible porque envia notificaciones y registra auditoria. Debe validar rol institucional real y usar el schema vigente de `auditoria`.
- `api/ai/rateLimit.ts` cae a `Map` en memoria si no hay Redis/KV; esto sirve para local, no para rate limit distribuido robusto.
- `invite-staff` valida correos `nombre.apellido@sase.mx` y un allowlist de roles; cualquier ampliacion debe hacerse de forma sincronizada con tipos y permisos.

## 6. Reglas de datos, RLS y dominio institucional

- El semaforo institucional no se recalcula en React. `puntaje_riesgo` y `estado_semaforo` se mantienen desde SQL y triggers.
- Cambios de roles o permisos nunca son solo frontend. Deben tocar tipos, utilidades de permisos, RLS, migraciones y funciones edge/server.
- `perfiles_usuario` es el modelo institucional principal para identidad, alcances y estado de cuenta.
- La aprobacion segura de personal vive en `supabase/functions/approve-staff`; `AprobacionesPersonal.tsx` solo orquesta la captura y la llamada server-side.
- Los estados y vocabulario de aprobacion deben normalizarse; actualmente coexistieron variantes como `APROBADO` y `APROBADA`.

## 7. Reglas funcionales de producto que cambian decisiones tecnicas

- SASE acompana procesos, no persigue errores. Esa regla del producto afecta onboarding, tono y testing.
- El onboarding docente usa fases 30-60-90 segun `PRD.md`:
  - Fase 1: `Tablero`, `Asistencia` y entrada de onboarding restringida
  - Fase 2: desbloquea `Expedientes` y `Protocolos`
  - Fase 3: acceso total segun rol
- La diferencia entre `Deteccion Pedagogica` en sidebar y `Reporte Rapido` dentro del dashboard debe documentarse como comportamiento actual, no asumirse como bug automatico.

## 8. Workflows y automatizacion

- CI usa Node 20 y pnpm 9.
- `sase-secure-pipeline.yml` es el gate oficial SASE SHIELD v2; `build-check.yml` queda como verificacion complementaria con lint, test y build.
- `security-audit.yml` audita secretos, dependencias y Supabase, pero sus reglas no deben considerarse suficientes por si solas; deben alinearse con esta constitucion y con el expediente activo.

## 9. Scripts y artefactos peligrosos

- `scripts/test_auth.mjs` y `scripts/test_rls.mjs` apuntan a un proyecto hospedado y no deben tratarse como smoke tests locales seguros.
- `scripts/mass_invite_staff.js` y `scripts/seed-institucional.ts` usan credenciales privilegiadas o mutan datos reales.
- `.agents/testsprite_wrapper.sh` es superficie sensible porque mezcla automatizacion con acceso a proveedor externo; nunca debe contener claves embebidas.
- Los perfiles de navegador, carpetas `chrome/`, `.tmp`, `.bak`, caches y respaldos reales no pertenecen al repositorio.

## 10. Estado de documentacion heredada

- `AGENTS.md` es la puerta de entrada operacional para agentes, no la autoridad maxima.
- `docs/RULES.md` y `docs/BIBLIOTECA_INTEGRATION.md` quedan como stubs de compatibilidad y apuntan a este canon.
- `docs/SECURITY_AUDIT_REPORT_2026-03-28.md` y `PRD.md` siguen siendo fuentes importantes, pero el resumen normativo vigente vive aqui.

## 11. Regla de cambio futuro

- Si el cambio afecta seguridad, permisos, onboarding, schema, edge functions, integraciones IA, CI o artefactos de agente, debe abrirse un expediente nuevo en `specs/` antes de implementarse.
- Si una regla de este canon deja de corresponder al repo, el cambio correcto es actualizar el codigo/configuracion y luego este canon en el mismo trabajo.
