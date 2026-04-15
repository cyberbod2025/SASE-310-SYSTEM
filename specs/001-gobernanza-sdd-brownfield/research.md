# Research - 001 Gobernanza SDD Brownfield

## Fuentes revisadas

- `AGENTS.md`
- `package.json`
- `.github/workflows/build-check.yml`
- `.github/workflows/sase-secure-pipeline.yml`
- `.github/workflows/security-audit.yml`
- `vite.config.ts`
- `eslint.config.js`
- `tsconfig.json`
- `vitest.config.ts`
- `supabase/config.toml`
- `.env.example`
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
- `docs/MANUAL_OPERACIONES_DEV.md`
- `docs/SASE_MASTER_ARCHITECTURE.md`
- `docs/SECURITY_AUDIT_REPORT_2026-03-28.md`
- `docs/RULES.md`
- `docs/BIBLIOTECA_INTEGRATION.md`
- `.agents/workflows/dev-sase.md`
- `.agents/workflows/apply-migration.md`
- `.opencode/opencode.jsonc`

## Hallazgos verificados de alto valor

1. `README.md` raiz no documenta la aplicacion; es del Supabase CLI.
2. No existe `memory/` ni `specs/`; el repo no tenia base SDD previa.
3. `uv` no esta instalado en este entorno, asi que la adopcion debe ser manual pero compatible con Spec Kit.
4. Vite corre en `3100`, mientras que docs heredadas y `.env.example` seguian mencionando `3000` o `5173`.
5. `lint` y `type-check` solo cubren `src/`; `api/`, `tests/` y `supabase/functions/` quedan fuera del gate estatico principal.
6. La seguridad de roles ya tuvo un hallazgo critico historico por fallback inseguro a `docente`.
7. `solicitudes_alta_personal` y el flujo de aprobacion mezclan PII, permisos y riesgo operativo.
8. Existen documentos de reglas con conflictos de merge (`docs/RULES.md`, `docs/BIBLIOTECA_INTEGRATION.md`).
9. Existen workflows locales heredados en `.agents/workflows/` con datos obsoletos; no deben tratarse como autoridad.
10. `opencode` ya esta configurado con MCPs utiles (`TestSprite`, `Supabase`, `Figma`, etc.), pero no con artefactos Spec Kit.

## Decision de adopcion

- Adoptar Spec Kit de forma brownfield y manual.
- Crear `memory/constitution.md` y `memory/sase-canon.md` como capa normativa.
- Crear un primer expediente `specs/001-*` para modelar el proceso futuro.
- No instalar el CLI ahora porque el entorno no trae `uv` y el objetivo inmediato es dejar gobernanza, no tooling.

## Riesgos conocidos que justifican esta fase

- Deriva documental entre docs, codigo y workflows.
- Riesgos de seguridad ya documentados pero no elevados a regla canonica.
- Futuros agentes podrian heredar instrucciones erradas desde documentos viejos si no se declara una precedencia explicita.
