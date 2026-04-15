# Constitucion SDD de SASE-310

Estado: Activa
Alcance: Todo cambio material en producto, seguridad, datos, integraciones, CI/CD y reglas operativas.

## Proposito

Esta constitucion define los principios no negociables para evolucionar SASE-310 con Spec-Driven Development en un repositorio brownfield. Su objetivo es reducir deriva entre codigo, base de datos, automatizaciones y documentacion.

## Precedencia de fuentes

Cuando haya conflicto, usa este orden:

1. `memory/constitution.md`
2. El expediente activo en `specs/<NNN-slug>/`
3. `memory/sase-canon.md`
4. `AGENTS.md`
5. Configuracion ejecutable y codigo (`package.json`, `.github/workflows/*`, `supabase/migrations/*`, `vite.config.ts`, `supabase/config.toml`, `api/*`, `src/*`)
6. Documentacion heredada bajo `docs/`

Si la prosa contradice al codigo o la configuracion ejecutable, la fuente de verdad es lo ejecutable.

## Articulo I. Verificable Antes Que Aspiracional

- Solo se documentan reglas verificadas en codigo, configuracion, migraciones, tests o workflows.
- Los documentos de gobierno deben citar rutas concretas cuando una regla no sea obvia.
- Los cambios de arquitectura, seguridad, permisos, onboarding, datos o CI requieren actualizar el expediente activo en `specs/`.

## Articulo II. Espanol Institucional

- El dominio institucional de SASE se documenta en espanol: reglas de negocio, UX, copy, runbooks y especificaciones funcionales.
- Se permiten terminos tecnicos del stack en ingles cuando sean nombres propios o comandos.

## Articulo III. Seguridad Fail-Closed

- Ante duda de rol, perfil o permiso, el sistema debe negar o degradar acceso; nunca asumir un rol con privilegios.
- Los cambios de autenticacion, autorizacion, RLS y auditoria deben favorecer denegacion por defecto.
- Ninguna correccion futura puede reintroducir fallbacks permisivos como rol por defecto para usuarios sin perfil.

## Articulo IV. Limites de Cliente y Servidor

- `SUPABASE_SERVICE_ROLE_KEY`, `supabase.auth.admin`, invitaciones, aprobaciones, notificaciones sensibles y proxies privilegiados de IA solo pueden vivir en server/edge/api.
- El cliente no crea ni aprueba usuarios institucionales directamente.
- Ningun secreto, token o credencial real puede persistir en el repositorio, wrappers, scripts o artefactos de testing.

## Articulo V. Supabase Es Autoridad Operativa

- Permisos, RLS, auditoria y semaforo de riesgo se gobiernan desde SQL, migraciones y funciones backend; no desde heuristicas en React.
- `perfiles_usuario` es la fuente principal de rol; `profiles` solo puede permanecer como compatibilidad explicita y documentada.
- Toda mutacion de esquema exige migracion; no se permite renombrar o borrar estructura sin migracion trazable.

## Articulo VI. Cambios de Permisos Son Cambios Distribuidos

- Cualquier cambio de roles, permisos o alcance institucional debe actualizar de forma sincronizada:
  - `src/types.ts`
  - `src/supabase/types.ts`
  - `src/utils/permisos.ts`
  - RLS y migraciones relacionadas
  - allowlists de edge functions y endpoints server-side
- Ningun cambio de permisos se considera terminado si solo vive en frontend o solo vive en SQL.

## Articulo VII. Puertas Minimas de Verificacion

- La verificacion minima del frontend es: `npm ci` -> `npm run lint` -> `npm run type-check` -> `npm run test` -> `npm run build`.
- Si el cambio toca `api/`, `supabase/functions/` o `tests/`, se debe agregar revision focalizada porque `lint` y `type-check` actuales solo cubren `src/`.
- Los cambios de base de datos o RLS deben ejecutar ademas: `./scripts/audit-migrations.sh`, `supabase db start` y `supabase db lint --local`.

## Articulo VIII. Higiene Operativa

- Los respaldos con datos reales, perfiles de navegador, caches pesados y artefactos locales no pertenecen al repositorio.
- Los scripts que apuntan a entornos hospedados o usan service role deben tratarse como operacion sensible y documentarse como tales.
- Ningun wrapper de testing o automatizacion puede contener API keys embebidas.

## Articulo IX. Gobernanza SDD

- Todo cambio material debe abrir o actualizar un expediente en `specs/<NNN-slug>/` con al menos `spec.md`, `plan.md` y `tasks.md`.
- Para adopcion brownfield, `research.md` y `quickstart.md` son obligatorios cuando el cambio afecte arquitectura, seguridad, integraciones o procesos.
- Antes de implementar un cambio material, el expediente debe dejar claro:
  - que problema resuelve
  - cual es la fuente de verdad existente
  - que riesgos introduce
  - como se valida

## Articulo X. Regla de Deriva Documental

- `AGENTS.md` debe permanecer corto y operativo; no debe duplicar constitucion ni canon.
- `memory/sase-canon.md` concentra reglas verificadas del repositorio y reemplaza documentos heredados ambiguos.
- Si un documento heredado entra en conflicto, se convierte en stub de compatibilidad o se archiva, pero no vuelve a competir con la fuente canonica.

## Enmiendas

- Toda enmienda a esta constitucion requiere una justificacion explicita en un expediente bajo `specs/`.
- Las enmiendas no pueden degradar seguridad, trazabilidad ni puertas de verificacion sin dejar el riesgo documentado y aprobado.
