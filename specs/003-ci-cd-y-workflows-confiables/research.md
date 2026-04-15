# Research - 003 CI/CD y Workflows Confiables

## Fuentes revisadas

- `.github/workflows/build-check.yml`
- `.github/workflows/sase-secure-pipeline.yml`
- `.github/workflows/security-audit.yml`
- `package.json`
- `memory/sase-canon.md`

## Hallazgos verificados

- `build-check.yml` corria `build` antes de `lint` y no hacia `type-check` ni `test`.
- `build-check.yml` silenciaba errores de lint con `|| echo`.
- `sase-secure-pipeline.yml` ya reflejaba mejor el gate real, pero sin concurrency ni timeouts.
- `security-audit.yml` usaba `supabase/setup-cli@v1` con `version: latest`.
- No existia workflow dedicado para el smoke visual Glass aunque ya existe `tests/visual-glass-smoke.js`.

## Decision

- Corregir los workflows existentes en vez de abrir otro gate duplicado para frontend.
- Agregar `visual-qa.yml` como workflow separado, manual y por PR en paths visuales.
