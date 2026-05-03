# Tasks - Orientacion v2

- [x] Diagnosticar tablas existentes y RLS.
- [x] Definir extensión mínima no duplicada.
- [x] Crear migración Supabase con RLS y RPCs (`20260501084547_orientacion_v2_backend.sql`).
- [x] Crear servicio frontend para RPCs (`orientacionApi.ts`).
- [x] Crear componentes `src/components/orientacion/` (CaseInbox, CaseDetail, InterventionPlan, FollowUp, etc.).
- [x] Reemplazar dashboard legacy con `DashboardOrientacion.tsx`.
- [x] Actualizar permisos (`src/utils/permisos.ts`: `orientacion.can_close = false`).
- [x] Actualizar tipos (`src/supabase/types.ts`, `orientacionTypes.ts`).
- [x] Actualizar tests (`tests/DashboardOrientacion.test.tsx`).
- [x] Ejecutar validaciones (`pnpm type-check`, `pnpm build`, `pnpm test` 33/33 OK).
- [x] PR #35 creado y abierto.
