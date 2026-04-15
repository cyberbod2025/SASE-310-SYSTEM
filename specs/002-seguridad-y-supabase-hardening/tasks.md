# Tasks - 002 Seguridad y Supabase Hardening

## Phase 1 - SQL y RLS

- [x] T001 Crear migración correctiva para cerrar el `SELECT` abierto de `solicitudes_alta_personal`.
- [x] T002 Crear migración correctiva para cerrar la inserción anónima insegura en auditoría.
- [x] T003 Normalizar estados históricos de `solicitudes_alta_personal` a la convención canónica.
- [x] T004 Verificar impacto sobre policies relacionadas y documentarlo en la migración.

## Phase 2 - Aprobación segura de personal

- [x] T005 Implementar flujo edge/server dedicado para aprobación institucional.
- [x] T006 Crear/actualizar perfil institucional con UUID real y datos consistentes.
- [x] T007 Registrar auditoría de aprobación en backend.

## Phase 3 - Integración frontend

- [x] T008 Reemplazar en `AprobacionesPersonal.tsx` el insert directo por llamada al backend seguro.
- [x] T009 Mantener feedback UX claro para éxito y error.

## Phase 4 - Endpoint sensible y entorno

- [x] T010 Corregir `api/notifications/whatsapp.ts` para validar rol institucional.
- [x] T011 Corregir auditoría de `whatsapp.ts` para usar schema real.
- [x] T012 Alinear `.env.example` con puerto y variables reales.
- [x] T013 Alinear `supabase/config.toml` con el seed real o documentar explícitamente la diferencia.

## Phase 5 - Verificación

- [x] T014 Ejecutar `./scripts/audit-migrations.sh`.
- [x] T015 Ejecutar `supabase db start` y `supabase db lint --local`.
- [x] T016 Ejecutar `npm run lint`, `npm run type-check`, `npm run test` y `npm run build`.
- [x] T017 Validar manualmente registro público, aprobación institucional y bloqueo de uso indebido en WhatsApp.
