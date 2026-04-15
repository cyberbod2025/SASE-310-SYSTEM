# Repo Governance Kit

Kit portable para adoptar gobernanza SDD brownfield en otros repositorios sin copiar reglas de negocio de SASE.

## Que incluye

- `templates/constitution.base.md`
- `templates/canon.base.md`
- `templates/AGENTS.base.md`
- `templates/specs/001-gobernanza-brownfield/`
- `checklists/`
- `prompts/`

## Como usarlo en otro repo

1. Copia este directorio a un espacio temporal o al repo destino.
2. Lee primero el repo destino: `README*`, manifests, workflows CI, config de lint/test/typecheck/build, docs de instrucciones y `AGENTS.md` si existe.
3. Adapta las plantillas; no copies nombres, paths, puertos, roles ni comandos de SASE.
4. Crea o actualiza en el repo destino:
   - `memory/constitution.md`
   - `memory/<repo>-canon.md`
   - `specs/001-gobernanza-brownfield/`
   - `AGENTS.md` si hace falta enlazar la nueva base
5. Usa los checklists para la auditoria inicial.

## Regla de oro

Este kit porta metodologia, estructura y controles. No porta reglas de dominio.

## Borrado seguro en SASE

Este directorio no participa en runtime, build, tests ni imports de la app. Puede eliminarse despues de exportarlo sin afectar a SASE.
