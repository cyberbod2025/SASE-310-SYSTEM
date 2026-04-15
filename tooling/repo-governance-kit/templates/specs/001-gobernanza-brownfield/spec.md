# Spec 001 - Gobernanza SDD Brownfield

Estado: Aprobada

## Contexto

Este repositorio ya existe y necesita una base SDD brownfield para evitar deriva entre codigo, configuracion, CI, base de datos y documentacion.

## Problema

Hoy no existe una autoridad unica y verificable para responder:

- que documento manda cuando hay conflicto
- cuales reglas son inmutables
- como abrir un cambio futuro sin improvisar

## Objetivos

- Crear una constitucion SDD canonica.
- Concentrar reglas verificadas en un canon brownfield.
- Dejar un primer expediente `specs/001-*` como patron.
- Reconciliar docs heredadas que compitan con la fuente canonica.

## Requisitos funcionales

- Debe existir `memory/constitution.md`.
- Debe existir `memory/<repo>-canon.md`.
- Debe existir `specs/001-gobernanza-brownfield/` con `spec.md`, `research.md`, `plan.md`, `tasks.md`, `quickstart.md`.
- `AGENTS.md` debe enlazar la nueva base SDD si hace falta.

## Criterios de exito

- Existe una precedencia documental explicita.
- Futuros cambios materiales tienen un punto claro de entrada.
- La base SDD no depende de memoria tribal.
