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

## PROTOCOLO GENERAL

Antes de ejecutar:

- Leer PROJECT_MASTER.md
- Leer TASK.md
- Leer STATE.md
- Leer HANDOFF.md
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
