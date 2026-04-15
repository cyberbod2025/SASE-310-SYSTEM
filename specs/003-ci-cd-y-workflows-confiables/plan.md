# Plan - 003 CI/CD y Workflows Confiables

## Resumen

Hacer que GitHub Actions refleje la validación real de SASE y deje evidencia útil para QA visual.

## Cambios previstos

- Corregir `build-check.yml`.
- Endurecer `sase-secure-pipeline.yml` y `security-audit.yml`.
- Crear `visual-qa.yml`.
- Añadir scripts de QA visual y smoke funcional reutilizables en `package.json`.

## Validación

- Validar sintaxis por lectura.
- Verificar que los scripts referenciados existan.
- Correr `lint`, `type-check`, `test` y `build` localmente.
