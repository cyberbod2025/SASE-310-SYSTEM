# Research - 004 TestSprite y QA Visual

## Fuentes revisadas

- `tests/visual-glass-smoke.js`
- `tests/test-sprite-render.js`
- `package.json`
- `PRD.md`
- `testsprite_tests/visual-audit/summary.json`

## Hallazgos verificados

- El repo tiene `puppeteer`, no `playwright`.
- `tests/test-sprite-render.js` estaba roto por dependencia incorrecta.
- `tests/visual-glass-smoke.js` ya produce capturas reutilizables para `login`, `registro` y `lab=ui`.
- `PRD.md` ya define criterios visuales y riesgos de onboarding útiles para TestSprite.

## Decision

- Estandarizar los smokes manuales en `puppeteer`.
- Mantener `testsprite_tests/visual-audit` como salida de evidencia.
