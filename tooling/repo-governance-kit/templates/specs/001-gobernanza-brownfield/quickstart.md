# Quickstart - SDD Brownfield

## 1. Lectura minima antes de tocar codigo

Lee en este orden:

1. `AGENTS.md`
2. `memory/constitution.md`
3. `memory/<repo>-canon.md`
4. El expediente activo en `specs/<NNN-slug>/`

## 2. Cuando abrir un expediente nuevo

Abre un expediente nuevo en `specs/` si el cambio toca:

- seguridad
- permisos
- datos o migraciones
- CI/CD y workflows
- integraciones
- artefactos de agente o automatizacion sensible
- arquitectura o package boundaries

## 3. Estructura minima del expediente

- `spec.md`
- `research.md`
- `plan.md`
- `tasks.md`
- `quickstart.md`

## 4. Orden recomendado del flujo

1. Definir problema y alcance en `spec.md`.
2. Investigar fuentes reales del repo en `research.md`.
3. Traducir a plan tecnico en `plan.md`.
4. Desglosar en tareas en `tasks.md`.
5. Implementar y validar.
6. Actualizar canon o constitucion si cambia una regla vigente.

## 5. Regla de precedencia

1. `memory/constitution.md`
2. El expediente activo en `specs/`
3. `memory/<repo>-canon.md`
4. `AGENTS.md`
5. Codigo y configuracion ejecutable
6. Docs heredadas
