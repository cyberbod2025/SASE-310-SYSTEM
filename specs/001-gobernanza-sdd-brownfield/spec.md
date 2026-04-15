# Spec 001 - Gobernanza SDD Brownfield para SASE-310

Estado: Aprobada

## Contexto

SASE-310 ya existe como repositorio brownfield con reglas criticas repartidas entre codigo, migraciones, workflows, auditorias de seguridad y documentos heredados. Varias de esas reglas son validas, pero hoy compiten entre si o estan desactualizadas. El objetivo de esta especificacion es establecer una base compatible con Spec Kit para que futuros cambios no dependan de memoria tribal.

## Problema

Hoy no existe una autoridad unica y ejecutable para responder preguntas como:

- que documento manda cuando hay conflicto
- cuales reglas son inmutables
- que debe revisarse antes de tocar seguridad, Supabase o CI
- como debe abrirse un cambio futuro sin improvisar

Ademas, el repo contiene documentos de reglas con conflictos de merge y workflows heredados con datos obsoletos.

## Objetivos

- Crear una constitucion SDD canonica para SASE.
- Concentrar las reglas verificadas del proyecto en un canon brownfield.
- Dejar un primer expediente `specs/001-*` que modele la adopcion de Spec Kit en el repo.
- Reparar documentos heredados rotos para que dejen de competir con la fuente canonica.
- Dejar instrucciones claras para que futuros agentes abran specs antes de cambios materiales.

## No objetivos

- No corregir todavia bugs funcionales de Supabase, GitHub Actions o TestSprite.
- No refactorizar arquitectura de producto.
- No reemplazar toda la documentacion heredada; solo reconciliar la parte necesaria para gobernanza.

## Usuarios afectados

- Agentes futuros que necesiten contexto confiable antes de editar codigo.
- Mantenedores humanos que aprueban cambios sensibles.
- Revisores de seguridad que necesitan trazabilidad entre reglas y codigo.

## Requisitos funcionales

- FR-001: Debe existir `memory/constitution.md` con principios no negociables de SASE.
- FR-002: Debe existir `memory/sase-canon.md` con reglas verificadas y referencias a fuentes reales del repo.
- FR-003: `AGENTS.md` debe apuntar a la constitucion y al canon para que un agente los lea antes de cambios materiales.
- FR-004: Debe existir un expediente inicial bajo `specs/001-gobernanza-sdd-brownfield/` con `spec.md`, `research.md`, `plan.md`, `tasks.md` y `quickstart.md`.
- FR-005: Los documentos heredados de reglas con conflictos o ambiguedad deben dejar de ser autoridades autonomas y convertirse en stubs de compatibilidad.
- FR-006: El canon debe documentar comandos exactos y gotchas no obvios del repo actual.
- FR-007: El canon debe documentar reglas de seguridad, permisos, onboarding y datos que afecten decisiones futuras.
- FR-008: La base SDD debe ser brownfield y compatible con adopcion incremental; no debe exigir reescribir el repo para empezar a usarla.

## Escenarios de aceptacion

### Escenario 1: Agente nuevo

Dado que un agente entra por primera vez al repo,
cuando lea `AGENTS.md`,
entonces debe encontrar donde viven la constitucion y el canon,
y distinguir entre documento operativo corto y autoridad normativa.

### Escenario 2: Cambio futuro material

Dado que un mantenedor va a tocar permisos, RLS, CI o integraciones,
cuando siga `specs/001-gobernanza-sdd-brownfield/quickstart.md`,
entonces debe poder abrir un nuevo expediente siguiendo la misma estructura antes de implementar.

### Escenario 3: Revisor de seguridad

Dado que un revisor necesita entender una regla sensible,
cuando consulte `memory/sase-canon.md`,
entonces debe poder encontrar la regla y su fuente del repo sin navegar decenas de documentos heredados.

## Criterios de exito

- Existe una precedencia documental explicita.
- No quedan conflictos de merge en los docs de reglas reconciliados por esta fase.
- La base SDD del repo queda operativa sin depender del CLI de Spec Kit.
- Futuros cambios materiales tienen un lugar claro donde comenzar.
