# HANDOFF

PROJECT:
SASE-310 SYSTEM

AUTHORIZED AGENTS:
- Codex
- Antigravity
- OpenCode

CURRENT TASK:
PR-4 completed: Make Promotora evidence persistence real.

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

PR-1 implementation completed and validated:

- `DashboardDocente.tsx` now passes `canViewNames` through all student-facing render paths.
- `DashboardPrefectura.tsx` now masks student names and identity labels when `can_view_names=false`.
- `StudentQuickList.tsx`, `MyRecentIncidents.tsx`, and `IncidentQuickForm.tsx` now render anonymized labels when required.
- `TeacherGroupDiagnosisOverview.tsx` already respected `canViewNames` and remains aligned.

PR-2 implementation completed and validated:

- `logAudit` now returns `{ success: true }` or `{ success: false, error }`.
- Supabase insert errors from `auditoria` are inspected explicitly instead of being swallowed.
- Critical callers that show success after audit now require `success: true`.
- New `useAuditLogic` tests cover success and Supabase error paths.

PR-3 implementation completed and validated:

- `DashboardLectura.tsx` no longer shows a fake evidence success toast.
- Lectura evidence now calls the existing `saveEvidence` store action.
- `saveEvidence` now returns `{ success: true }` or `{ success: false, error }` after the Supabase `evidence_log` insert.
- The Lectura modal keeps the same success behavior when persistence succeeds.
- If Supabase/store persistence fails, the modal shows the existing error path and does not show success.
- New `DashboardLectura` tests cover success and persistence failure.

PR-3.5 documentation-only protocol update completed and validated:

- Added `QUICK_CONTEXT.md` as the first-read startup summary.
- Updated `RULES.md` so agents do not always reread stable SASE files.
- Startup still requires `TASK.md`, `STATE.md` and `HANDOFF.md`.
- Defined safe conditions for rereading `PROJECT_MASTER.md` and `RULES.md`.
- No app code, package files, lockfiles, Supabase migrations, Bridge, or math module touched.

PR-4 implementation completed and validated:

- `DashboardPromotora.tsx` no longer shows a fake evidence success toast.
- Promotora evidence now calls the existing `saveEvidence` store action.
- The persistence path writes to Supabase `evidence_log` through the existing store mechanism.
- The Promotora modal keeps the same success behavior when persistence succeeds.
- If Supabase/store persistence fails, the modal shows the existing error path and does not show success.
- New `DashboardPromotora` tests cover success and persistence failure.

---

## MODIFIED FILES

`src/components/Asistencia.tsx`
`src/components/StudentAdvancedPanel.tsx`
`src/components/dashboards/DashboardLectura.tsx`
`src/components/dashboards/DashboardPrefectura.tsx`
`src/components/dashboards/DashboardPromotora.tsx`
`src/components/dashboards/DashboardSecretaria.tsx`
`src/components/emergency/EmergencyAlertModal.tsx`
`src/hooks/useInstitutionalActions.ts`
`src/store.tsx`
`src/store/slices/useAuditLogic.ts`
`src/store/slices/useCierreCicloSlice.ts`
`src/store/slices/useMatriculaSlice.ts`
`src/store/slices/useStudentsSlice.ts`
`sase/QUICK_CONTEXT.md`
`sase/RULES.md`
`tests/DashboardPrefectura.test.tsx`
`tests/DashboardLectura.test.tsx`
`tests/DashboardPromotora.test.tsx`
`tests/DashboardSecretaria.test.tsx`
`tests/useAuditLogic.test.ts`
`sase/STATE.md`
`sase/HANDOFF.md`

---

## REMAINING FOR CURRENT TASK

PR-4 is done. Next agent should start PR-5 and focus on:

- Reducing fake actions in UDEII / Developer / Subdirección.
- Removing local-only success flows or labelling them honestly.
- Reusing existing store/Supabase persistence paths where safe.
- Keeping audit checks explicit for any new write flow.

---

## RISKS

- Privacy leak is reduced but not fully audited across the whole app.
- Role mismatch remains a risk if future dashboards bypass `can_view_names`.
- UI still depends on student data in some modules outside PR-1 scope.
- Some non-critical fire-and-forget audit calls remain for telemetry-like access logs.
- `saveEvidence` now reports persistence failure, but other callers may need review before relying on its result.
- `QUICK_CONTEXT.md` is a summary, not a replacement for `TASK.md`, `STATE.md` or `HANDOFF.md`.
- Lectura and Promotora evidence persistence are fixed, but UDEII / Developer / Subdirección still need fake-action review.
- Existing tests still emit known mocked Supabase warning logs, but the suite passes.

---

## NEXT AGENT INSTRUCTION

1. Read `/sase/QUICK_CONTEXT.md`, then `/sase/TASK.md`, `/sase/STATE.md`, and `/sase/HANDOFF.md`.
2. Reread `/sase/PROJECT_MASTER.md` or `/sase/RULES.md` only when context is missing, risky, contradictory, architectural, or protocol-related.
3. Confirm scope, risks and validation before editing.
4. Start PR-5 on fake actions in UDEII / Developer / Subdirección.
5. Validate TypeScript/build if possible.
6. Update `/sase/STATE.md` and `/sase/HANDOFF.md`.
7. Report modified files and validation results.

---

## IF CONTEXT RUNS OUT

Stop immediately and update this HANDOFF.md with:

- what was changed
- what remains
- exact files touched
- exact next step
