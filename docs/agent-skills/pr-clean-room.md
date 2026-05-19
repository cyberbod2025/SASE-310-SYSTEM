# PR Clean Room

## Propósito
Crear o reparar PRs limpios desde una base sana.

## Reglas
- Trabajar desde origin/main.
- No arrastrar historia contaminada.
- No usar git add .
- No tocar package/lockfiles sin autorización.
- No tocar Supabase/RLS/migrations sin autorización.

## Procedimiento

1. Actualizar:
git fetch origin

2. Crear rama limpia:
git checkout origin/main
git checkout -b <branch-clean>

3. Traer solo archivos permitidos:
git restore --source=<source-branch> -- <archivo>

4. Verificar:
git diff --name-status origin/main
git diff --stat origin/main

5. Verificar prohibidos:
git diff --name-only origin/main | grep -Ei "package.json|package-lock.json|pnpm-lock.yaml|supabase|migrations|feria|\.env" || echo "OK: sin cambios prohibidos"

6. Validar:
pnpm run build

7. Staging controlado:
git add <archivo1>
git add <archivo2>

8. Commit:
git commit -m "<mensaje>"

9. Push y PR:
git push -u origin <branch-clean>
gh pr create --base main --head <branch-clean>
