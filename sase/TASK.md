# CURRENT TASK

TASK:
PR-5C: Reduce fake actions in Subdirección dashboard.

---

## GOAL

Remove fake success states and decorative actions from the Subdirección dashboard.

Every visible action must be categorized as:

- remove
- disable with explicit "coming soon" / "en preparación"
- connect to real existing functionality

---

## TARGET FILES

Likely affected:

- `src/components/dashboards/DashboardSubdireccion.tsx`
- tests related to DashboardSubdireccion, if any
- `/sase/STATE.md`
- `/sase/HANDOFF.md`
- `/sase/QUICK_CONTEXT.md`

The agent must inspect actual repo files before editing.

---

## FILES NOT TO TOUCH UNLESS NECESSARY

- Supabase migrations
- package configuration
- lockfiles
- Bridge
- mathematical module
- unrelated dashboards

---

## SUCCESS CRITERIA

- No fake success toasts.
- No decorative buttons that appear operational.
- Existing real actions remain functional.
- Unavailable actions are disabled or clearly labelled as in preparation.
- No unrelated refactor.
- State and handoff files updated after changes.

---

## VALIDATION

Run the strongest available checks:

- `pnpm test`
- `pnpm type-check`
- `pnpm build`
- `git diff --check`

If checks cannot be run, explain why.

---

## NEXT TASK AFTER THIS

(None currently planned in the PR-5 series).
