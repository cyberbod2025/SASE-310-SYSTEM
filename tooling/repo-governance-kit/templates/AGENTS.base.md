# Guia corta para agentes

- Lee primero `AGENTS.md`, `memory/constitution.md`, `memory/<repo>-canon.md` y el expediente activo en `specs/`.
- Si docs y config se contradicen, manda config/codigo ejecutable.
- No copies reglas de dominio desde otro repo; adapta solo la metodologia y lo verificable localmente.

## Verificacion

- Ejecuta la cadena minima de verificacion documentada por este repo.
- Si el cambio toca zonas fuera del gate normal, agrega verificacion focalizada y explicita.

## Gobernanza

- Cambios materiales requieren expediente en `specs/<NNN-slug>/`.
- `AGENTS.md` debe permanecer corto; el detalle normativo vive en `memory/` y `specs/`.

## Seguridad

- No subas secretos, wrappers con keys ni scripts que apunten a produccion sin documentarlo.
- No hagas cambios de permisos solo en frontend o solo en backend.
