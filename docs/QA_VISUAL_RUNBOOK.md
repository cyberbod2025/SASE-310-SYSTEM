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

- `qa_artifacts/visual-audit/login.png`
- `qa_artifacts/visual-audit/registro.png`
- `qa_artifacts/visual-audit/laboratorio-ui.png`
- `qa_artifacts/visual-audit/summary.json`

## Smoke funcional T017

Con Supabase local completo y `approve-staff` servido localmente:

```bash
npm run smoke:t017
```

## En GitHub

- workflow: `Visual QA`
- artefacto: `visual-qa-artifacts`

## Nota

La base técnica de evidencia visual del repo es `puppeteer`, no `playwright`.
