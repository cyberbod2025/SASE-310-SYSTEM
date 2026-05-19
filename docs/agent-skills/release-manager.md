# Release Manager

## Propósito
Controlar cuándo un PR puede pasar de revisión a merge manual.

## Criterios mínimos para merge
- PR limpio en alcance.
- Checks verdes.
- Sin archivos prohibidos.
- Sin cambios de dependencias no autorizados.
- Sin Supabase/RLS/migrations no autorizados.
- Sin merge automático.
- Smoke aprobado si aplica.
- Riesgos documentados.

## Prohibido
- No merge automático.
- No squash/merge sin revisión humana.
- No cerrar PRs supersedidos hasta tener reemplazo aprobado.
- No mezclar hotfix con refactor.
- No mezclar performance con seguridad salvo autorización.

## Procedimiento

1. Ver PR:
gh pr view <PR> --json mergeStateStatus,reviewDecision,autoMergeRequest,commits,files

2. Ver checks:
gh pr checks <PR>

3. Ver diff:
git diff --name-status origin/main...HEAD
git diff --stat origin/main...HEAD

4. Ver prohibidos:
git diff --name-only origin/main...HEAD | grep -Ei "package.json|package-lock.json|pnpm-lock.yaml|supabase|migrations|\.env" || echo "OK"

## Dictamen
- MERGE MANUAL AUTORIZABLE
- REQUIERE AJUSTE
- BLOQUEAR
- SUPERSEDER
