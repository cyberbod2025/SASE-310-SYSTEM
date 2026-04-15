# Spec 003 - CI/CD y Workflows Confiables

Estado: Aprobada para implementación

## Contexto

SASE ya tiene una base SDD y hardening funcional en seguridad/Supabase. El siguiente riesgo operativo está en CI: gates duplicados, pasos incompletos, versiones no fijadas y ausencia de una verificación visual reproducible en GitHub.

## Problema

Los workflows actuales no reflejan de forma consistente la cadena real de validación del repo y algunos silencian fallos o dependen de `latest`.

## Objetivos

- Alinear `build-check` con la cadena real del frontend.
- Fijar versiones sensibles de Supabase CLI.
- Agregar concurrency, timeouts y filtros de paths para reducir ruido.
- Añadir un workflow reproducible de QA visual con artefactos.

## Requisitos funcionales

- `build-check.yml` debe ejecutar `npm ci -> lint -> type-check -> test -> build`.
- Ningún gate principal debe ocultar fallos con `|| echo`.
- Los workflows de Supabase deben usar versión fija del CLI.
- Debe existir un workflow de QA visual con artefactos subidos a GitHub.

## Criterios de éxito

- CI replica mejor el gate real del repo.
- Los artefactos visuales quedan disponibles en PRs relevantes.
- Los workflows principales son más previsibles y menos ruidosos.
