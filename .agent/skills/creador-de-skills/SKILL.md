---
name: creador-de-skills
description: Generador estandarizado de Skills para Antigravity. Asegura consistencia, estabilidad y adherencia a la estructura oficial.
---

# Skill: Creador de Skills para Antigravity

## Contexto

Eres un experto en diseñar Skills para el entorno de Antigravity. Tu objetivo es crear Skills predecibles, reutilizables y fáciles de mantener, con una estructura clara de carpetas y una lógica que funcione bien en producción.

## Cuándo usar este Skill

- Cuando el usuario pida crear un skill nuevo.
- Cuando el usuario repita un proceso y sea conveniente estandarizarlo.
- Cuando se necesite un estándar de formato para nuevas herramientas.
- Cuando haya que convertir un prompt largo en un procedimiento reutilizable.

## Entradas (Inputs)

- **Tema del skill**: ¿Qué debe hacer? (Ej: "auditar landing", "escribir correos").
- **Nivel de libertad**: ¿Es creativo (alto), plantilla (medio) o técnico/estricto (bajo)?
- **Material base**: ¿Hay documentos, reglas o ejemplos previos?

## Workflow para crear un Skill

1. **Definir Identidad**:
   - Nombre en `kebab-case` (corto, máx 40 caracteres).
   - Descripción operativa en tercera persona (máx 220 caracteres).

2. **Determinar Estructura de Archivos**:
   - `agent/skills/<nombre>/SKILL.md` (Obligatorio).
   - `agent/skills/<nombre>/recursos/` (Para guías, JSON, plantillas).
   - `agent/skills/<nombre>/scripts/` (Solo si requiere ejecución de código).

3. **Redactar SKILL.md** siguiendo este esquema estricto:
   - **YAML Frontmatter**: name y description.
   - **Principios**: Reglas claras, no relleno.
   - **Triggers**: "Cuándo usar este skill".
   - **Workflow**: Plan -> Validar -> Ejecutar (pasos numerados).
   - **Checklist**: Criterios de éxito.
   - **Estándar de Salida**: Qué formato exacto debe entregar el agente.

4. **Validar Principio de Estabilidad**:
   - Si es un proceso técnico, reducir la libertad del LLM (instrucciones paso a paso).
   - Separar estilo (recursos) de lógica (pasos).

5. **Generar Archivos**: Crear físicamente la carpeta y los archivos MD/JSON.

## Estructura de Salida (Template del SKILL.md generado)

El archivo `SKILL.md` que generes debe verse así:

```markdown
---
name: <nombre-del-skill>
description: <descripción breve>
---

# Skill: <Título>

## Cuándo usar este skill

- <Caso 1>
- <Caso 2>

## Workflow

1. <Paso 1>
2. <Paso 2>

## Reglas / Instrucciones

- <Regla A>
- <Regla B>

## Output esperado

<Formato de respuesta>
```

## Checklist de Calidad

- [ ] ¿Tiene YAML válido?
- [ ] ¿El nombre es simple y sin espacios?
- [ ] ¿Está separado en carpeta propia?
- [ ] ¿Define claramente cuándo usarse?
- [ ] ¿Incluye checklist o validación final?
