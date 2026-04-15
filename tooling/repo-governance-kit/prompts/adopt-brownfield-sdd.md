Quiero adoptar este repositorio con un kit de gobernanza SDD/Spec Kit style.

Usa como base el contenido de `tooling/repo-governance-kit/`.

Objetivo:
- crear una base brownfield de gobernanza
- documentar reglas reales del repo
- dejar una constitucion y un canon local
- abrir el primer expediente de gobernanza

Instrucciones:
1. Lee primero:
   - `AGENTS.md`
   - `README*`
   - manifests raiz
   - workflows CI
   - config de lint, test, typecheck, formatter y build
   - instrucciones locales existentes
2. No copies reglas de negocio de SASE.
3. Adapta solo la metodologia, estructura y checklists.
4. Crea o actualiza:
   - `memory/constitution.md`
   - `memory/<repo>-canon.md`
   - `specs/001-gobernanza-brownfield/`
   - `AGENTS.md` si hace falta enlazar la nueva base
5. Si docs y config se contradicen, manda config/codigo ejecutable.
6. Mantén el resultado compacto, verificable y específico del repo.
7. No implementes features aún; solo deja la base SDD lista.
8. Al final, resume:
   - que reglas quedaron canonizadas
   - que docs viejos quedaron deprecados
   - que riesgos importantes detectaste
