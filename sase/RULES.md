# SASE RULES

## PRINCIPIOS

1. Trabajar siempre en microtasks.
2. Nunca modificar demasiados archivos a la vez.
3. Git es la fuente de verdad.
4. Optimizar tokens y contexto.
5. Toda sesión debe ser resumible por otro agente.
6. Evitar fake toasts.
7. Evitar silent failures.
8. Seguridad y privacidad primero.
9. No confiar en memoria conversacional si existe evidencia en archivos.
10. Cada agente debe dejar continuidad clara.

---

## AGENTES AUTORIZADOS

Este flujo está diseñado para usarse únicamente con:

- Codex
- Antigravity
- OpenCode

No asumir compatibilidad con otros agentes salvo indicación explícita.

---

## PROTOCOLO DE ARRANQUE

Objetivo:

- Reducir lectura repetida de archivos estables.
- Mantener seguridad, continuidad y evidencia.
- Evitar codificar a ciegas.

Antes de ejecutar:

- Si existe `QUICK_CONTEXT.md`, leerlo primero.
- Leer siempre `TASK.md`, `STATE.md` y `HANDOFF.md`.
- Si no existe `QUICK_CONTEXT.md`, leer `STATE.md` y `HANDOFF.md` como base minima y crear/actualizar `QUICK_CONTEXT.md` cuando la tarea lo permita.
- Confirmar alcance, riesgos y validacion antes de modificar archivos.

No es obligatorio releer siempre `PROJECT_MASTER.md` ni este `RULES.md` si `QUICK_CONTEXT.md`, `TASK.md`, `STATE.md` y `HANDOFF.md` dan contexto suficiente.

Releer `PROJECT_MASTER.md` cuando:

- No exista `QUICK_CONTEXT.md`.
- El stack, arquitectura, prioridades o fuente de verdad no esten claros.
- La tarea toque seguridad, permisos, roles, RLS, Supabase, CI, integraciones o arquitectura.
- Haya contradiccion entre `TASK.md`, `STATE.md`, `HANDOFF.md`, issue, PR o instrucciones del usuario.
- El agente sea nuevo en el repo o no pueda verificar contexto reciente con Git.

Releer `RULES.md` cuando:

- No exista `QUICK_CONTEXT.md`.
- La tarea cambie el protocolo de trabajo.
- Haya duda sobre validacion, output esperado, continuidad o limites de alcance.
- Haya instrucciones conflictivas entre usuario, SASE docs y estado del repo.
- La tarea implique riesgos de privacidad, seguridad, persistencia o cambios amplios.

Aunque se use contexto rapido, nunca se debe omitir:

- Revisar `TASK.md`, `STATE.md` y `HANDOFF.md`.
- Inspeccionar los archivos reales antes de editar.
- Validar segun el alcance.
- Actualizar `STATE.md` y `HANDOFF.md` al terminar.
- Reportar archivos modificados, riesgos y siguiente microtask.

---

## PROTOCOLO GENERAL

Antes de modificar:

- Confirmar alcance
- Identificar riesgos
- Definir validación

Después de ejecutar:

- Reportar cambios
- Listar archivos modificados
- Actualizar STATE.md
- Actualizar HANDOFF.md
- Indicar siguiente microtask

---

## REGLAS DE OUTPUT

Responder siempre en formato compacto:

- CONTEXT
- TASK
- RISKS
- EXECUTION
- VALIDATION
- NEXT STEP

Evitar explicaciones largas salvo que el usuario las pida.

---

## REGLAS DE SEGURIDAD

Nunca dejar:

- datos privados expuestos por rol
- botones que aparenten funcionar sin persistencia
- toasts de éxito sin escritura real
- errores de Supabase silenciados
- cambios grandes sin validación

---

## REGLA DE ORO

Si el agente está por quedarse sin contexto, debe detenerse y actualizar HANDOFF.md antes de continuar.
