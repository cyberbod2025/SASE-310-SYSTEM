# Constitucion SDD del Repositorio

Estado: Activa
Alcance: Todo cambio material en producto, seguridad, datos, integraciones, CI/CD y reglas operativas.

## Proposito

Esta constitucion define los principios no negociables para evolucionar este repositorio con Spec-Driven Development en contexto brownfield. Su objetivo es reducir deriva entre codigo, base de datos, automatizaciones y documentacion.

## Precedencia de fuentes

Cuando haya conflicto, usa este orden:

1. `memory/constitution.md`
2. El expediente activo en `specs/<NNN-slug>/`
3. `memory/<repo>-canon.md`
4. `AGENTS.md`
5. Configuracion ejecutable y codigo
6. Documentacion heredada

Si la prosa contradice al codigo o la configuracion ejecutable, manda lo ejecutable.

## Articulo I. Verificable Antes Que Aspiracional

- Solo se documentan reglas verificadas en codigo, configuracion, migraciones, tests o workflows.
- Los documentos de gobierno deben citar rutas concretas cuando una regla no sea obvia.
- Los cambios de arquitectura, seguridad, permisos, datos o CI requieren actualizar el expediente activo en `specs/`.

## Articulo II. Seguridad Fail-Closed

- Ante duda de rol, perfil o permiso, el sistema debe negar o degradar acceso.
- Los cambios de autenticacion, autorizacion, RLS y auditoria deben favorecer denegacion por defecto.
- Ninguna correccion futura puede introducir fallbacks permisivos sin riesgo documentado.

## Articulo III. Limites de Cliente y Servidor

- Credenciales privilegiadas, operaciones de admin y mutaciones sensibles deben vivir en server/edge/api, no en cliente.
- Ningun secreto, token o credencial real puede persistir en repo, wrappers, scripts o artefactos de testing.

## Articulo IV. Cambios Distribuidos Deben Quedar Sincronizados

- Si un cambio toca permisos, tipos, RLS, contratos, endpoints o migraciones, debe mantenerse sincronizado en todas las capas afectadas.
- Ningun cambio se considera terminado si solo vive en frontend o solo vive en backend/SQL.

## Articulo V. Puertas Minimas de Verificacion

- La cadena minima de verificacion debe quedar documentada con comandos exactos del repo.
- Si una parte del repo no entra en lint/typecheck/test normales, esa brecha debe quedar documentada y revisarse explicitamente.

## Articulo VI. Higiene Operativa

- Perfiles de navegador, caches pesados, respaldos reales y artefactos locales no pertenecen al repositorio.
- Los scripts que apuntan a entornos hospedados o usan credenciales privilegiadas deben tratarse como operacion sensible.
- Ningun wrapper de testing o automatizacion puede contener API keys embebidas.

## Articulo VII. Gobernanza SDD

- Todo cambio material debe abrir o actualizar un expediente en `specs/<NNN-slug>/` con al menos `spec.md`, `plan.md` y `tasks.md`.
- Para adopcion brownfield, `research.md` y `quickstart.md` son obligatorios cuando el cambio afecte arquitectura, seguridad, integraciones o procesos.

## Articulo VIII. Regla de Deriva Documental

- `AGENTS.md` debe permanecer corto y operativo; no debe duplicar la constitucion ni el canon.
- `memory/<repo>-canon.md` concentra reglas verificadas del repositorio.
- Si un documento heredado entra en conflicto, se convierte en stub de compatibilidad o se archiva.

## Enmiendas

- Toda enmienda a esta constitucion requiere una justificacion explicita en un expediente bajo `specs/`.
