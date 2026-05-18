# Agent Context Template

## Propósito
Reducir consumo de tokens evitando que los agentes leer todo el proyecto.

## Archivos locales sugeridos
Estos archivos viven en `.agent-context/` y no se commitean:

- CURRENT_TASK.md
- PROJECT_MAP.md
- DO_NOT_TOUCH.md
- KNOWN_DEBT.md

## Regla
El agente debe leer primero el contexto mínimo y solo después abrir archivos específicos.

## Prompt base
MODO AHORRO DE CONTEXTO.

Lee solamente:
- .agent-context/CURRENT_TASK.md
- .agent-context/PROJECT_MAP.md
- .agent-context/DO_NOT_TOUCH.md
- .agent-context/KNOWN_DEBT.md

No leas todo el proyecto.
No hagas listado recursivo completo.
No abras archivos fuera del alcance sin justificar.
Antes de editar, declara archivos candidatos.
Después de editar, reporta diff y validación.
