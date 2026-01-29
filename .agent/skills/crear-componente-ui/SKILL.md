---
name: crear-componente-ui
description: Genera componentes React + Tailwind validados con la identidad SASE. Asegura estabilidad visual y técnica.
---

# Skill: Crear Componente UI SASE

Este skill estandariza la creación de componentes visuales para asegurar que CADA nuevo elemento cumpla con la identidad de marca y las reglas técnicas de SASE desde el primer intento.

## Cuándo usar este skill

- Cuando el usuario pida "crea un botón", "haz una card", "diseña un modal", "nuevo componente".
- Cuando se necesite refactorizar un componente existente para cumplir con la marca de SASE o el "login" #lanmding" o "UI",
- Cuando se implementen nuevas pantallas que requieran elementos UI atómicos.

## Inputs necesarios

1. **Descripción funcional**: ¿Qué hace el componente? (ej: "Botón de login").
2. **Contexto de uso**: ¿Dónde se va a usar? (ej: "Pantalla de inicio").
3. **Ubicación deseada**: Ruta del archivo (si no se da, sugerir `src/components/`).

## Workflow (Flujo de trabajo)

### Fase 1: Planificación y Contexto

1. **Invocar Reglas de Marca**: Leer OBLIGATORIAMENTE `agent/skills/estilo-marca-sase/SKILL.md` y `recursos/estilo-visual.json` antes de escribir código.
2. **Definir Interfaz**: Determinar Props (TypeScript) necesarias. Priorizar simplicidad.
3. **Seleccionar Paleta**: Elegir colores exactos del JSON de branding (nada de aproximaciones).

### Fase 2: Ejecución (Código)

4. **Generar Estructura**: Crear el componente funcional en React (TypeScript).
   - Usar `export function NombreComponente` (no default export).
   - Usar Tailwind CSS para estilos.
5. **Aplicar Estilos SASE**:
   - Fondos: `#020617` (Main) o `#0B1220` (Surface).
   - Acentos: `#FF9605` (Solo para acciones principales).
   - Texto: Inter, blanco o gris (#CBD5E1).
   - Bordes: `#1E293B`.
6. **Integrar Accesibilidad**: Asegurar contrastes y `aria-labels` básicos.

### Fase 3: Validación y Salida

7. **Revisión de Prohibiciones**:
   - ¿Hay degradados exagerados? (Eliminar).
   - ¿Hay sombras neón? (Eliminar).
   - ¿Parece sci-fi? (Ajustar a sobrio/institucional).

## Instrucciones de Estabilidad

- **No inventes clases**: Usa las utilidades estándar de Tailwind.
- **No dependencias nuevas**: Usa lo que ya existe en el `package.json`.
- **Componentes puros**: Evita lógica de negocio compleja dentro del componente UI.

## Checklist de Calidad

- [ ] ¿El componente compila sin errores de TS?
- [ ] ¿Usa estrictamente la paleta de colores SASE?
- [ ] ¿La tipografía es Inter?
- [ ] ¿Es responsive (funciona en móvil y desktop)?
- [ ] ¿El código es limpio y tiene comentarios explicativos si es complejo?
