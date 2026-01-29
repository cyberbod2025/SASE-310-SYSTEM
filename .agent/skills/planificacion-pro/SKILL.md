---
name: planificacion-pro
description: Convierte una idea en un plan ejecutable por fases, con checklist, riesgos y entregables. Úsalo cuando haya que pasar de idea a acción sin improvisar.
---

# Planificación Pro

Esta habilidad transforma intenciones vagas o listas desordenadas en una hoja de ruta estructurada, priorizando la ejecución y la anticipación de problemas.

## Cuándo usar este skill

- Cuando el usuario pida un plan paso a paso, una estrategia o una hoja de ruta.
- Cuando haya que entregar algo (landing, vídeo, proyecto, lanzamiento) con tiempos definidos.
- Cuando el usuario tenga muchas tareas sueltas y quiera ordenarlas lógicamente.

## Inputs necesarios (si faltan, pregunta primero)

1. **Resultado final**: ¿Qué significa exactamente “terminado”?
2. **Fecha límite o ritmo**: ¿Es para hoy, esta semana, o sin prisa?
3. **Recursos disponibles**: Herramientas, equipo, presupuesto, tiempo diario disponible.
4. **Criterios de éxito**: ¿Qué condiciones debe cumplir para estar "bien"?

## Workflow (Flujo de trabajo)

1. **Definir el Norte**:
   - Redacta el resultado final en 1 frase.
   - Lista los 3 criterios de éxito principales.
2. **Dividir en Fases** (Máximo 4):
   - Fase 1: Preparación.
   - Fase 2: Producción / Ejecución.
   - Fase 3: Revisión / QA.
   - Fase 4: Publicación / Entrega.
3. **Detallar cada Fase**:
   - Lista de tareas en orden secuencial.
   - **Entregable claro**: ¿Qué sale tangiblemente de esta fase?
   - **Tiempo estimado**: Aproximación por tarea.
4. **Gestión de Riesgos** (Añadir sección "Riesgos y mitigación"):
   - Identifica 3–5 riesgos probables.
   - Define la mitigación: "Si pasa X → hago Y".
5. **Cierre**:
   - Genera una **Checklist final** de validación para el usuario.

## Reglas de calidad (Instrucciones)

- **Evita planes infinitos**: Prioriza siempre lo que desbloquea el siguiente paso.
- **Dependencias**: Si una tarea bloquea a otra, indícalo explícitamente (“esto depende de X”).
- **Nivel del usuario**:
  - _Principiante_: Reduce pasos, da opciones simples y guiadas.
  - _Avanzado_: Incluye optimizaciones, atajos y paralelismo.

## Output (Formato exacto)

Devuelve siempre:

1. **Resultado final + Criterios de éxito**.
2. **Plan por fases** (Con tareas, tiempos y entregables por fase).
3. **Riesgos y mitigación** (Tabla o lista "Si X -> Y").
4. **Checklist final** (Lista de verificación para dar por concluido el proyecto).

## Checklist de Validación interna

- [ ] ¿El plan tiene máximo 4 fases?
- [ ] ¿Hay tiempos estimados para las tareas?
- [ ] ¿He incluido la sección de riesgos "Si pasa X → hago Y"?
