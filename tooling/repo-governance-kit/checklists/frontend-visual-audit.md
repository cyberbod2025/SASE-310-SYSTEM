# Checklist - Auditoria Visual Frontend

- Identificar la fuente real del sistema visual: tokens, Tailwind, componentes base, layout y temas.
- Detectar si el repo tiene un lenguaje visual dominante ya establecido.
- Buscar modulos que usen superficies, bordes o colores ajenos al sistema dominante.
- Revisar modales, formularios, dashboards y estados vacios primero.
- Verificar consistencia en:
  - fondo y profundidad
  - bordes y radios
  - contraste de texto
  - botones, inputs, selects, textareas
  - badges, alerts y callouts
- Preservar el lenguaje visual del producto; no imponer uno nuevo.
- Validar con `lint`, `type-check`, `test`, `build` y recorrido visual real.
- Si hay testing visual o screenshots, integrarlos en el quickstart del expediente.
