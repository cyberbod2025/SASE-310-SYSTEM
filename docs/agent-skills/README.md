# Agent Skills — SASE-310

Estos skills son protocolos operativos para agentes IA que trabajan sobre este repositorio.

Reglas generales:
- No usar git add .
- No hacer merge automático.
- No hacer deploy manual.
- No tocar Supabase/RLS/migrations sin autorización explícita.
- No tocar package.json ni lockfiles salvo autorización explícita.
- No corregir deuda no relacionada.
- No ampliar alcance del PR.
- Antes de editar, declarar archivos candidatos.
- Después de editar, reportar diff, validaciones y riesgos.

## Skills adicionales

- `playwright-smoke-test.md`: validación visual/funcional antes de merge.
- `vercel-deploy-guard.md`: control de despliegues y previews.
- `release-manager.md`: criterios para autorizar merge manual.
- `weekly-status-auditor.md`: resumen semanal sin inventar datos.
- `agent-context-template.md`: reducción de tokens mediante contexto mínimo.

## Uso recomendado

1. Leer `scope-guard.md`.
2. Leer el skill específico de la tarea.
3. Leer `.agent-context/` si existe.
4. Ejecutar solo lo permitido.
