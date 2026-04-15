# Quickstart - SDD Brownfield en SASE-310

## 1. Lectura minima antes de tocar codigo

Lee en este orden:

1. `AGENTS.md`
2. `memory/constitution.md`
3. `memory/sase-canon.md`
4. El expediente activo en `specs/<NNN-slug>/`

## 2. Cuando abrir un expediente nuevo

Abre un expediente nuevo en `specs/` si el cambio toca cualquiera de estos dominios:

- seguridad
- roles y permisos
- RLS o migraciones
- autenticacion o aprobacion de personal
- CI/CD y workflows
- onboarding y visibilidad por rol
- integraciones IA o notificaciones
- artefactos de agente, wrappers o automatizacion sensible

## 3. Estructura minima del expediente

Para cambios materiales, crea:

- `spec.md`
- `research.md`
- `plan.md`
- `tasks.md`
- `quickstart.md`

Si el cambio ademas toca contratos o modelos compartidos, agrega:

- `data-model.md`
- `contracts/`

## 4. Orden recomendado del flujo

1. Definir el problema y alcance en `spec.md`.
2. Investigar fuentes reales del repo en `research.md`.
3. Traducir a plan tecnico en `plan.md`.
4. Desglosar en tareas en `tasks.md`.
5. Implementar y validar.
6. Actualizar canon o constitucion si el cambio altera reglas vigentes.

## 5. Verificacion minima

Frontend:

- `npm run lint`
- `npm run type-check`
- `npm run test`
- `npm run build`

Base de datos y RLS:

- `./scripts/audit-migrations.sh`
- `supabase db start`
- `supabase db lint --local`

## 6. Regla de precedencia

Si dos documentos se contradicen, manda este orden:

1. `memory/constitution.md`
2. El expediente activo en `specs/`
3. `memory/sase-canon.md`
4. `AGENTS.md`
5. Codigo y configuracion ejecutable
6. Docs heredadas

## 7. Lo que no debes hacer

- No uses documentos heredados como unica fuente de verdad.
- No toques permisos solo en frontend.
- No subas secretos, wrappers con keys ni scripts que apunten a produccion sin documentarlo.
- No cierres un expediente como terminado sin registrar como se valido.
