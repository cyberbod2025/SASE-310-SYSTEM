# HANDOFF

PROJECT:
SASE-310 SYSTEM

AUTHORIZED AGENTS:
- Codex
- Antigravity
- OpenCode

CURRENT TASK:
Fix permission leaks in Docente and Prefectura.

---

## COMPLETED

A read-only dashboard audit was completed.

Important findings:

- Gate is not ready.
- Dirección, Orientación, Prefectura and Salud have real functional bases.
- Subdirección, Trabajo Social, Lectura, Promotora, UDEII and some Secretaría flows are weak.
- Several modules have fake toasts or local-only flows.
- Some Supabase writes may fail silently.
- Docente and Prefectura appear to violate expected privacy behavior.

---

## MODIFIED FILES

None yet.

---

## REMAINING FOR CURRENT TASK

Inspect and fix:

- DashboardDocente.tsx
- DashboardPrefectura.tsx
- StudentQuickList.tsx
- MyRecentIncidents.tsx
- permisos.ts

Enforce:

- can_view_names=false hides names.
- restricted roles do not see family data.
- anonymized labels are used where necessary.

---

## RISKS

- Privacy leak.
- Role mismatch.
- UI depending on student names.
- Overcorrecting permissions globally.
- Breaking screens by removing expected fields.

---

## NEXT AGENT INSTRUCTION

1. Read /sase/PROJECT_MASTER.md.
2. Read /sase/TASK.md.
3. Read /sase/STATE.md.
4. Inspect actual repo files.
5. Implement the smallest possible fix for can_view_names=false.
6. Validate TypeScript/build if possible.
7. Update /sase/STATE.md.
8. Update /sase/HANDOFF.md.
9. Report modified files and validation results.

---

## IF CONTEXT RUNS OUT

Stop immediately and update this HANDOFF.md with:

- what was changed
- what remains
- exact files touched
- exact next step
