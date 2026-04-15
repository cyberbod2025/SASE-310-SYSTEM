# Spec 004 - TestSprite y QA Visual

Estado: Aprobada para implementación

## Contexto

SASE ya tiene un smoke visual Glass reproducible y PRD con criterios visuales y de onboarding. Hace falta formalizar la integración de QA visual y TestSprite para que futuras sesiones no partan desde scripts rotos o supuestos falsos.

## Problema

El repo arrastraba scripts manuales inconsistentes (`playwright` sin dependencia) y no existía una ruta oficial para producir evidencia visual reutilizable en local y CI.

## Objetivos

- Unificar la base técnica de smoke visual alrededor de `puppeteer`.
- Dejar scripts reproducibles para capturas y smoke funcional.
- Formalizar el uso de `qa_artifacts/visual-audit` como carpeta de evidencia.

## Requisitos funcionales

- Debe existir un smoke visual reproducible para `login`, `registro` y `lab=ui`.
- Los scripts manuales no deben depender de librerías ausentes.
- La documentación debe dejar claro qué revisar visualmente y dónde quedan las capturas.

## Criterios de éxito

- La base de QA visual es ejecutable en local y desde GitHub.
- No quedan scripts manuales rotos por dependencia incorrecta.
