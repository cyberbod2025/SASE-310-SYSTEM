# SASE-310 — Guía rápida para agentes

- Todo el dominio institucional (campos, UI, docs, comentarios de negocio) debe estar en **español**. La terminología técnica del stack puede quedar en inglés.
- No recalcules el semáforo en React; lee `estado_semaforo` y `puntaje_riesgo` desde la base. El riesgo se mantiene en PostgreSQL vía triggers/migraciones.
- No cambies permisos solo en frontend; cualquier ajuste requiere RLS + `src/utils/permisos.ts` + tipos (`src/types.ts`, `src/supabase/types.ts`).

## Arquitectura y entrypoints
- Frontend: React + Vite + TypeScript. Arranque en `src/index.tsx` → `src/App.tsx` → `src/components/AppShell`. Zustand vive en `src/store` y slices bajo `src/store/slices`. Alias `@` → `src`.
- API serverless (Vercel): `api/ai/openrouter.ts` y `api/ai/gemini.ts` manejan prompts. Exigen `ALLOWED_ORIGINS`, token Supabase válido, modelos permitidos y rate limit en `api/ai/rateLimit.ts`.
- Supabase: migraciones en `supabase/migrations`; configuración local en `supabase/config.toml` (db 54322, shadow 54320, studio 54323). Edge functions `supabase/functions/create-user` e `invite-staff` usan service role, validan origen y rol antes de crear/invitar cuentas.
- README raíz es el del Supabase CLI (no describe esta app). La copia `sasito-ai-copilot (1)/` es histórica; el código activo está en la raíz (`src/`, `api/`, `supabase/`).

## Comandos y entorno
- Node 20 (coincide con CI). Instala con `npm ci`. Desarrollo: `npm run dev` (Vite en 3100). Build: `npm run build`. Lint: `npm run lint` (eslint sobre `src`). Vitest está instalado pero no hay script ni suites conocidas.
- Base local: `supabase db start` y `supabase status`; CI ejecuta `supabase db lint --local` después de levantar servicios. Seeds habilitados en `supabase/seed_data.sql` según `config.toml`.

## Variables y credenciales
- Front/SSR: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` son obligatorias; `src/supabase/client.ts` falla en frío si faltan.
- Backend/Edge: `SUPABASE_SERVICE_ROLE_KEY` solo en server; `ALLOWED_ORIGINS` requerido para AI y edge; `OPENROUTER_API_KEY` y `GOOGLE_API_KEY` para los handlers. No expongas service_role ni claves de IA en el cliente.
- CI bloquea `supabase.auth.admin` en código de `src/`.

## Incidencias y riesgo institucional
- Crear incidencias: docente, docente_tutor, prefectura, orientacion, trabajo_social, directivo. Cerrar: docente solo si la creó y no escaló; escaladas las cierran orientacion, trabajo_social, subdireccion, directivo, system_admin. Prefectura opera seguimiento y escalamiento.
- Semáforo: pesos leve 1 / media 3 / grave 5 / critica 8; 0–30 días 100%, 30–90 50%, >90 0; tres graves en 60 días → INTERVENCION; retardos/asistencia menor no llevan solos a INTERVENCION. Estados UI en `src/types.ts`.

## Seguridad y datos
- Auditar todo: hay triggers de bitácora; no sobrescribas historial ni elimines incidencias (solo dejan de impactar por tiempo).
- Mantén RLS y migraciones al día si agregas columnas/tablas; no renombres ni elimines sin migración.
- `invite-staff` valida correos `^[a-z]+\.[a-z]+@sase\.mx$` y roles permitidos; conserva CORS y los conjuntos de roles cuando toques esa función.

## Puntos de referencia
- Tipos de dominio: `src/types.ts` y `src/supabase/types.ts`. Permisos: `src/utils/permisos.ts`. Client Supabase: `src/supabase/client.ts`.
- UI/tema: Tailwind config en `tailwind.config.js`; fuente Inter/Manrope, paleta `sase.*`.
