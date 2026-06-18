# CURRENT TASK

TASK:
Fix permission leaks in Docente and Prefectura dashboards.

---

## GOAL

Respect can_view_names=false.

Restricted roles must not see:

- student names
- family data
- sensitive identifiers
- personally identifying details not allowed by permissions

---

## TARGET FILES

Likely affected:

- src/components/dashboards/DashboardDocente.tsx
- src/components/dashboards/DashboardPrefectura.tsx
- src/components/docente/StudentQuickList.tsx
- src/components/docente/MyRecentIncidents.tsx
- src/utils/permisos.ts

The agent must inspect actual repo files before editing.

---

## FILES NOT TO TOUCH UNLESS NECESSARY

- Supabase migrations
- global auth logic
- unrelated dashboards
- unrelated UI components
- package configuration

---

## SUCCESS CRITERIA

- can_view_names=false is respected.
- Docente no longer exposes names when restricted.
- Prefectura no longer exposes names or family data when restricted.
- UI remains usable with anonymized labels.
- No TypeScript errors introduced.
- No unrelated refactor.
- State and handoff files updated after changes.

---

## VALIDATION

Run the strongest available checks:

- typecheck if configured
- lint if configured
- local build if reasonable
- inspect affected screens manually if possible

If checks cannot be run, explain why.

---

## NEXT TASK AFTER THIS

Fix logAudit silent failures.
