# HANDOFF

PROJECT:
SASE-310 SYSTEM

AUTHORIZED AGENTS:
- Codex
- Antigravity
- OpenCode

CURRENT TASK:
PR-6B completed: Prefectura hardening.

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

PR-5A implementation completed and validated:

- `DashboardUDEII.tsx` no longer uses informational toast clicks for unavailable tools.
- Exportar log BAP, Manual de Estrategias and Notificar a Tutores are disabled with explicit "Próximamente/en preparación" labels.
- The BAP adjustment action remains connected to the existing `updateBapInfo` store action.
- `updateBapInfo` now checks Supabase `alumnos.update(...).eq(...)` errors and returns `{ success, error }` explicitly.
- UDEII does not close/show modal success when BAP persistence fails.
- BAP print remains connected to the existing `printDocument` action.
- New tests cover disabled tools, BAP success/failure behavior and print wiring.

PR-5B implementation completed and validated:

- `DashboardDeveloper.tsx` no longer shows a fake RLS audit success toast.
- The `handleForceRLSCheck` function was removed, and its trigger button was disabled with an explicit "Próximamente" label.
- The Quick Access modules buttons were wired correctly to `setCurrentModule` using `useApp`.
- Experimental laboratory tools ("Run Simulation", "Compute Matrix", "New Experiment") were disabled, visually faded (`opacity-50`/`opacity-40`), labeled "(Próximamente)", and their pointer cursors removed.

PR-5C implementation completed and validated:

- `DashboardSubdireccion.tsx` fake `handleQuickAction` was entirely removed, effectively killing all fake async toasts.
- Actions "Inyectar Protocolo" and "Validar NEEM" were connected to `setCurrentModule(AppModule.PROTOCOLOS / PLANEACION_NEM)`.
- Fictional/placeholder actions ("EXP_ZONA.PDF", "FORZAR_SYNC", "AUTORIZAR_PASO", "Gestionar Suplencia") were disabled (`disabled` prop), styled with `opacity-50`, cursor `not-allowed`, and appended with `(Próximamente)`.
- New `DashboardSubdireccion` tests cover disabled placeholder actions and connected module navigation.

PR-6B implementation completed and validated:

- Modified `registerAttendance` in `src/store/slices/useInventoryStatsSlice.ts` to return explicit success/error objects instead of `void`.
- Updated `DashboardPrefectura.tsx` to check database status for both `registerAttendance` and `addIncident` before proceeding to show success messages or log audits.
- Disabled the fake "Notificar Tutor" button in `DashboardPrefectura.tsx` and styled it as a future feature with a `(Próximamente)` label.
- Updated `Asistencia.tsx` to check database status of `registerAttendance` and `addIncident` before showing success toasts.
- Added comprehensive unit tests in `tests/DashboardPrefectura.test.tsx` to verify error paths and disabled tutor notification button.

---

## MODIFIED FILES

`src/components/Asistencia.tsx`
`src/components/StudentAdvancedPanel.tsx`
`src/components/dashboards/DashboardLectura.tsx`
`src/components/dashboards/DashboardPrefectura.tsx`
`src/components/dashboards/DashboardPromotora.tsx`
`src/components/dashboards/DashboardSecretaria.tsx`
`src/components/dashboards/DashboardUDEII.tsx`
`src/components/dashboards/DashboardDeveloper.tsx`
`src/components/dashboards/DashboardSubdireccion.tsx`
`src/components/emergency/EmergencyAlertModal.tsx`
`src/hooks/useInstitutionalActions.ts`
`src/store.tsx`
`src/store/slices/useAuditLogic.ts`
`src/store/slices/useCierreCicloSlice.ts`
`src/store/slices/useInventoryStatsSlice.ts`
`src/store/slices/useMatriculaSlice.ts`
`src/store/slices/useStudentsSlice.ts`
`sase/QUICK_CONTEXT.md`
`sase/RULES.md`
`sase/TASK.md`
`tests/DashboardPrefectura.test.tsx`
`tests/DashboardLectura.test.tsx`
`tests/DashboardPromotora.test.tsx`
`tests/DashboardSecretaria.test.tsx`
`tests/DashboardSubdireccion.test.tsx`
`tests/DashboardUDEII.test.tsx`
`tests/useAuditLogic.test.ts`
`tests/useStudentsSlice.test.tsx`
`sase/STATE.md`
`sase/HANDOFF.md`

---

## REMAINING FOR CURRENT TASK

PR-5 (A, B, and C) is now completely done. Fake actions in UDEII, Developer, and Subdirección have been successfully reduced or connected to real existing functionality.

Next agent should await explicit instructions from the user for the next assignment.

---

## RISKS

- Privacy leak is reduced but not fully audited across the whole app.
- Role mismatch remains a risk if future dashboards bypass `can_view_names`.
- UI still depends on student data in some modules outside PR-1 scope.
- Some non-critical fire-and-forget audit calls remain for telemetry-like access logs.
- `saveEvidence` now reports persistence failure, but other callers may need review before relying on its result.
- `QUICK_CONTEXT.md` is a summary, not a replacement for `TASK.md`, `STATE.md` or `HANDOFF.md`.
- Fake actions in UDEII, Developer, and Subdirección dashboards were successfully neutralized.
- `updateBapInfo` now returns explicit results; any future caller should check `success` before showing success UI.
- Existing tests still emit known mocked Supabase warning logs, but the suite passes.

---

## NEXT AGENT INSTRUCTION

1. Read `/sase/QUICK_CONTEXT.md`, then `/sase/TASK.md`, `/sase/STATE.md`, and `/sase/HANDOFF.md`.
2. Reread `/sase/PROJECT_MASTER.md` or `/sase/RULES.md` only when context is missing, risky, contradictory, architectural, or protocol-related.
3. Confirm scope, risks and validation before editing.
4. Await next user instructions.
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
