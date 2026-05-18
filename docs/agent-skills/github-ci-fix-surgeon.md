# GitHub CI Fix Surgeon

## Propósito
Corregir fallos de CI en un PR de forma mínima, auditable y segura.

## Cuándo usarlo
Cuando fallen:
- lint
- type-check
- build
- tests
- CodeQL
- security workflow
- Frontend Validation

## Prohibido
- No merge.
- No deploy.
- No git add .
- No package.json.
- No lockfiles.
- No Supabase/RLS/migrations.
- No refactor amplio.
- No deuda no relacionada.
- No --no-verify salvo autorización explícita.

## Procedimiento

1. Ver PR:
gh pr view <PR> --json url,headRefName,baseRefName,mergeStateStatus,reviewDecision,autoMergeRequest,commits,files

2. Ver checks:
gh pr checks <PR>

3. Ver runs:
gh run list --branch <BRANCH> --limit 10

4. Leer logs fallidos:
gh run view <RUN_ID> --log-failed

5. Clasificar cada fallo:
- archivo
- línea
- error exacto
- causa probable
- si es deuda previa o error del PR
- acción recomendada

6. Corregir solo el error reportado.

7. Validar:
pnpm lint
pnpm exec tsc --noEmit
pnpm run build

8. Verificar prohibidos:
git diff --name-only origin/main...HEAD | grep -Ei "package.json|package-lock.json|pnpm-lock.yaml|supabase|migrations|feria|AGENTS.md|SASE_AUDIT_REPORT.md|\.env|test-results|STATUS.md" || echo "OK: sin cambios prohibidos"

9. Commit solo si todo está verde:
git add <archivos-específicos>
git commit -m "fix: stabilize CI for <PR>"

10. Push:
git push origin <branch>
