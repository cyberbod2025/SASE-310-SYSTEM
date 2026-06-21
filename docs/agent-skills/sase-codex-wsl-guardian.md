# SASE Codex WSL Guardian

## Entorno
- WSL/Linux dentro de Windows.
- Repo: `/home/hugo_system/code/SASE-310-SYSTEM`
- **Nunca** trabajar desde rutas Windows (`C:\Users\...`) si el proyecto corre en WSL.

## Rutina obligatoria antes de modificar
```bash
git status --short
git branch --show-current
```

## Reglas de staging
- **Nunca** `git add .`
- Staging selectivo: `git add <archivo1> <archivo2>`
- Verificar antes de commit:
  ```bash
  git diff --cached --name-only
  git diff --stat
  ```

## Separación por ramas
- Cada alcance tiene su propia rama.
- No mezclar correcciones con features.
- No mezclar frontend con infraestructura.

## Validaciones obligatorias
```bash
pnpm install --frozen-lockfile   # cuando aplique
pnpm type-check
pnpm test
pnpm build
```

## Prohibido sin instrucción explícita
- Modificar `package.json` ni `pnpm-lock.yaml`
- Tocar Supabase, RLS, migraciones, Feria
- Modificar código de documentos si no corresponde al task
- Hacer commit, push, merge o deploy sin autorización

## Reporte de entrega
Siempre incluir al final:
- Archivos creados/modificados
- Pruebas ejecutadas y resultado
- Build exitoso
- Commit, push, PR
- Qué **no** se tocó (package.json, Feria, Supabase, RLS, etc.)
