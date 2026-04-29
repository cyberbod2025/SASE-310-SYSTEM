# SASE-310 — Guía rápida para agentes

- Todo el dominio institucional (UI, copy, docs y comentarios de negocio) va en español.
- `README.md` raíz no describe esta app: es del Supabase CLI. La app activa vive en la raíz (`src/`, `api/`, `supabase/`). `sasito-ai-copilot/` es otra app/prototipo con su propio `package.json`; no la toques salvo que el task la mencione.
- Autoridad SDD: `memory/constitution.md` define principios no negociables, `memory/sase-canon.md` concentra reglas verificadas del repo y `specs/` guarda expedientes de cambios materiales. Léelos antes de tocar seguridad, permisos, schema, CI o integraciones.

## Arquitectura
- No hay React Router. Flujo real: `src/index.tsx` -> `AuthProvider` -> `App` -> `AppProvider` (`src/store.tsx`) -> `AppShell` -> `ModuleRouter`.
- `src/store.tsx` es el entrypoint del estado; los slices viven en `src/store/slices`.
- La fuente real del client Supabase es `src/lib/supabaseClient.ts`; `src/supabase/client.ts` solo reexporta por compatibilidad.
- El rol del usuario se lee primero de `perfiles_usuario`; `profiles` queda como fallback legado.
- IA no pasa por un solo proxy: `src/components/ai/aiRouter.ts` llama `/api/ai/openrouter`, pero `src/modules/documentos/*` y `src/modules/expedientes/*` llaman `/api/ai/gemini` directo.
- Altas seguras de personal: `src/components/AprobacionesPersonal.tsx` debe usar `supabase/functions/approve-staff`; no vuelvas a crear perfiles o usuarios reales directamente desde el cliente.

## Verificación
- CI usa Node 20 y PNPM en este orden para frontend: `pnpm install --frozen-lockfile` -> `pnpm lint` -> `pnpm type-check` -> `pnpm test` -> `pnpm build`.
- `pnpm lint` y `pnpm type-check` solo cubren `src/` (`eslint.config.js` y `tsconfig.json`); cambios en `api/`, `supabase/functions/` y `tests/` requieren revisión manual adicional.
- `pnpm test` usa Vitest + jsdom + `tests/setup.ts`. Foco por archivo: `pnpm test -- tests/Agenda.test.tsx`.
- `tests/test-sprite-*.js` no entra en `pnpm test`; son scripts manuales de render/Puppeteer.
- Si tocas SQL/migraciones, además corre `./scripts/audit-migrations.sh` y `supabase db start` + `supabase db lint --local`.

## Entorno y gotchas
- El frontend falla al arrancar si faltan `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY`.
- Vite corre en `3100`; si pruebas `/api/*` o auth localmente, confirma que `ALLOWED_ORIGINS` incluya `http://localhost:3100`.
- Los handlers server-side además usan vars no documentadas en `.env.example`: `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`, `GOOGLE_API_KEY` y, para rate limit compartido, `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` o `KV_REST_API_URL`/`KV_REST_API_TOKEN`.
- Sin Redis/KV, `api/ai/rateLimit.ts` cae a un `Map` en memoria por instancia.
- `api/notifications/whatsapp.ts` entra en modo simulado si faltan `WHATSAPP_TOKEN` o `WHATSAPP_PHONE_ID`; aun asi registra auditoria en BD.
- `api/notifications/whatsapp.ts` debe validar rol institucional real antes de enviar o simular notificaciones.
- `supabase/config.toml` usa `./seed_data.sql`; si cambias seeds, mantén `config.toml` y el archivo real sincronizados.

## Datos y permisos
- No recalcules el semaforo en React. `puntaje_riesgo` y `estado_semaforo` se persisten desde `public.calculate_student_risk` + trigger en `20260310160000_risk_semaphore_backend.sql`.
- Cambios de roles/permisos nunca son solo frontend: toca `src/types.ts`, `src/supabase/types.ts`, `src/utils/permisos.ts`, RLS/migraciones y los allowlists de edge functions (`supabase/functions/create-user`, `supabase/functions/invite-staff`).
- CI falla si `supabase.auth.admin` aparece en `src/`; el admin auth se queda en server/edge.
- `invite-staff` exige correos `nombre.apellido@sase.mx` y valida el rol invitado contra `ALLOWED_INVITE_ROLES`.

## Scripts peligrosos
- No uses `scripts/test_auth.mjs` ni `scripts/test_rls.mjs` como smoke tests locales: apuntan a un proyecto Supabase hospedado y traen credenciales hardcodeadas.
- `scripts/mass_invite_staff.js` y `scripts/seed-institucional.ts` usan service role y mutan auth/datos reales.
