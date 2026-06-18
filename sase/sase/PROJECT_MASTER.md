# PROJECT MASTER

PROJECT:
SASE-310 SYSTEM

OWNER:
Hugo Sánchez

AUTHORIZED AGENTS:
- Codex
- Antigravity
- OpenCode

STACK:
- React
- TypeScript
- Vite
- Tailwind
- Supabase
- Vercel

ARCHITECTURE:
- Frontend-first
- DB-backed
- Role-based
- RLS enforced
- Institutional dashboards
- Modular components
- Supabase as persistence layer

SOURCE OF TRUTH:
- Repository files
- Supabase schema
- Git history
- /sase/*.md continuity files

DO NOT TRUST:
- memory-only assumptions
- previous chat context without files
- fake UI states
- success toasts without persistence

---

## CRITICAL RULES

1. Privacy first.
2. Permissions mandatory.
3. No fake success states.
4. No silent DB failures.
5. No broad uncontrolled refactors.
6. Every change must be verifiable.
7. Every session must be resumable.

---

## ACTIVE PRIORITIES

### P0
- Fix permission leaks.
- Fix audit reliability.
- Remove fake actions.
- Prevent silent Supabase failures.

### P1
- Add real persistence in weak dashboards.
- Replace local-only flows with DB-backed flows.

### P2
- UX refinement.
- Technical debt cleanup.
- Remove orphan dashboards if unused.

---

## KNOWN WEAK MODULES

- Subdirección
- Trabajo Social
- Lectura
- Promotora
- UDEII
- Secretaría distribution/import flows

---

## KNOWN STRONGER MODULES

- Dirección
- Orientación
- Prefectura
- Salud

These still require validation for privacy, RLS, and error handling.

---

## DEVELOPMENT STYLE

Use microtasks.

Good:
- Fix permission rendering in DashboardDocente.
- Add Supabase write to DashboardLectura.
- Make logAudit return errors.

Bad:
- Fix all dashboards.
- Refactor entire app.
- Rewrite permissions globally without validation.
