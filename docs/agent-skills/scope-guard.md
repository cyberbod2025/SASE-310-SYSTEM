# Scope Guard

## Propósito
Evitar que un agente amplíe el alcance de una tarea.

## Reglas base
- AG no toca Feria.
- OC no toca SASE.
- Codex audita, no edita.
- Nada de merge automático.
- Nada de deploy manual.
- Nada de Supabase/RLS/migrations sin autorización.
- Nada de package.json ni lockfiles sin autorización.
- Nada de dashboards alumno sin autorización.
- Nada de refactors amplios.

## Antes de editar
El agente debe declarar:
- objetivo
- archivos candidatos
- archivos prohibidos
- validaciones
- riesgo esperado

## Después de editar
Debe reportar:
- archivos modificados
- diff resumido
- validaciones ejecutadas
- errores
- recomendación: commit / no commit / bloquear
