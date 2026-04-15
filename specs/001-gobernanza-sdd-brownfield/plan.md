# Plan - 001 Gobernanza SDD Brownfield

## Resumen

Establecer una capa de gobierno compatible con Spec Kit para SASE-310 sin depender del CLI y sin refactorizar la aplicacion. La salida de esta fase es un conjunto pequeno de artefactos canonicos que permitan abrir cambios futuros con trazabilidad, puertas de validacion y precedencia documental.

## Contexto tecnico

- Tipo de repo: brownfield React + Vite + TypeScript + Supabase + Vercel API.
- Entorno de desarrollo verificado: Node 20 en CI; Vite local en `3100`.
- Constraint actual: `uv` no esta disponible en este entorno, por lo que la estructura Spec Kit se crea manualmente.
- Constraint de seguridad: el repo ya tiene hallazgos relevantes de RLS, roles, scripts sensibles y deriva documental.

## Artefactos de esta fase

- `memory/constitution.md`
- `memory/sase-canon.md`
- `specs/001-gobernanza-sdd-brownfield/spec.md`
- `specs/001-gobernanza-sdd-brownfield/research.md`
- `specs/001-gobernanza-sdd-brownfield/plan.md`
- `specs/001-gobernanza-sdd-brownfield/tasks.md`
- `specs/001-gobernanza-sdd-brownfield/quickstart.md`
- Ajustes de enlace/compatibilidad en `AGENTS.md`, `docs/RULES.md` y `docs/BIBLIOTECA_INTEGRATION.md`

## Verificacion constitucional

### Articulo I. Verificable Antes Que Aspiracional

Se documentaran solo reglas derivadas de fuentes reales del repo, con rutas concretas.

### Articulo III. Seguridad Fail-Closed

La constitucion eleva a principio el hallazgo historico sobre fallback inseguro de rol.

### Articulo VII. Puertas Minimas de Verificacion

El canon registrara la cadena real de validacion y sus huecos actuales.

### Articulo IX. Gobernanza SDD

El expediente `001-*` servira como patron para futuros cambios materiales.

## Fases de implementacion

### Fase 1. Gobierno canonico

- Redactar constitucion.
- Redactar canon brownfield.

### Fase 2. Expediente inicial

- Escribir `spec.md`, `research.md`, `plan.md`, `tasks.md` y `quickstart.md`.

### Fase 3. Reconciliacion de puntos de entrada

- Enlazar la nueva base desde `AGENTS.md`.
- Convertir docs heredadas rotas en stubs de compatibilidad.

## Riesgos y mitigacion

- Riesgo: duplicar reglas entre artefactos.
  - Mitigacion: `AGENTS.md` queda corto; la constitucion y el canon concentran la normativa.
- Riesgo: que documentos heredados sigan compitiendo con la fuente canonica.
  - Mitigacion: convertirlos en stubs que apunten a `memory/`.
- Riesgo: creer que la base SDD reemplaza la necesidad de corregir bugs actuales.
  - Mitigacion: dejar explicito que esta fase prepara el terreno y no reemplaza las remediaciones pendientes.

## Siguientes expedientes recomendados

- `002-seguridad-y-supabase-hardening`
- `003-autenticacion-y-aprobacion-de-personal`
- `004-ci-cd-y-workflows-confiables`
- `005-testsprite-y-qa-e2e`
