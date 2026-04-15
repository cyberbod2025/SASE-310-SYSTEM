# QA Visual Runbook

## Smoke local

1. Levanta Vite en `3100`:

```bash
npm run dev
```

2. Ejecuta el smoke visual:

```bash
npm run test:visual:glass
```

3. Revisa artefactos en:

- `testsprite_tests/visual-audit/login.png`
- `testsprite_tests/visual-audit/registro.png`
- `testsprite_tests/visual-audit/laboratorio-ui.png`
- `testsprite_tests/visual-audit/summary.json`

## Smoke funcional T017

Con Supabase local completo y `approve-staff` servido localmente:

```bash
npm run smoke:t017
```

## En GitHub

- workflow: `Visual QA`
- artefacto: `visual-qa-artifacts`

## Nota TestSprite

La base técnica de evidencia visual del repo es `puppeteer`, no `playwright`.
Si TestSprite se integra después, debe reutilizar esta salida y los criterios visuales de `PRD.md`.
