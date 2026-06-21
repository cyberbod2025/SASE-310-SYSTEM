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

## Fase 6 - Hardening post approve-staff (2026-04-28)

- [x] T018 Migración `security_hardening_approve_staff`: reemplazar policies abiertas en `solicitudes_alta_personal` y `auditoria` por validación de rol institucional vía `perfiles_usuario`.
- [x] T019 Alinear `.env.example` con todas las variables usadas por edge functions, API handlers y scripts del repo.
- [x] T020 Verificar: `audit-migrations.sh` silencioso (OK), `npm run lint` limpio, `npm run type-check` limpio, `npm run test` pasando.

## Migrations aplicadas

| Migración | Fecha | Descripción |
|-----------|-------|-------------|
| `security_hardening_approve_staff` | 2026-04-28 | Endurece RLS de `solicitudes_alta_personal` y `auditoria` usando `perfiles_usuario` como fuente de rol. Reemplaza 4 policies abiertas/inconsistentes. |
| `advisor_safe_hardening` | 2026-04-28 | Fija `search_path`, elimina INSERT policies `WITH CHECK true`, revoca ejecución `anon`/`public` en SECURITY DEFINER y conserva RPCs `authenticated` necesarios para UI/RLS/módulos externos. |
| `invoker_safe_helpers` | 2026-04-28 | Convierte helpers de identidad/ecosistema (`get_my_role*`, `get_user_role`, `get_my_normalized_email`, `is_staff`, `get_modulos_ecosistema_visibles`) a `SECURITY INVOKER`. |
| `storage_public_listing_fix` | 2026-04-28 | Reemplaza policies públicas amplias de `avatars` y `documentos_salud` por acceso propietario/roles institucionales, cerrando `public_bucket_allows_listing`. |
| `security_dashboard_snapshot` | 2026-04-28 | Agrega RPC `get_security_dashboard_snapshot()` como wrapper `SECURITY INVOKER`; la lectura privilegiada vive en `private` y valida rol por `perfiles_usuario`. |

## Fase 7 - Advisor Supabase sin regresión (2026-04-28)

- [x] T021 Corregir `function_search_path_mutable` en funciones reportadas.
- [x] T022 Eliminar policies `WITH CHECK true` en `audit_logs`, `sase_alerts` y `smoke_test_logs`.
- [x] T023 Revocar ejecución `anon`/`public` en funciones `SECURITY DEFINER`; revocar también `authenticated` en funciones internas/trigger-only.
- [x] T024 Conservar `authenticated` en RPCs usados por frontend, helpers RLS y módulos externos para evitar regresiones.
- [x] T025 Corregir `public_bucket_allows_listing` en `storage.objects` con migración `storage_public_listing_fix`; queda además runbook en `supabase/sql/storage_public_listing_fix.sql`.
- [ ] T026 Habilitar leaked password protection desde configuración Auth del proyecto; no es un cambio SQL disponible desde esta sesión.

## Fase 8 - Automatización de seguridad (2026-04-28)

- [x] T027 Agregar `scripts/security-audit.sh` con modo `--ci`, conteo de críticos/warnings y controles de tablas ultra sensibles.
- [x] T028 Agregar `scripts/security-autofix.sh` interactivo con `DRY_RUN=true`, log automático y confirmaciones de alto riesgo.
- [x] T029 Agregar `scripts/security-attack-sim.sh` para simulación ofensiva no destructiva por REST/Storage.
- [x] T030 Agregar workflow `.github/workflows/security.yml` para ejecutar lint, type-check y auditoría Supabase con `DATABASE_URL`.

## Fase 9 - Dashboard de Seguridad SASE (2026-04-28)

- [x] T031 Crear migración `security_dashboard_snapshot` con snapshot fail-closed para roles elevados.
- [x] T032 Agregar slice/store frontend para consultar el snapshot sin leer catálogos directamente desde React.
- [x] T033 Implementar `SecurityDashboard` y exponerlo en navegación para Dirección, Soporte Nivel 3 y Desarrollo.
- [x] T034 Verificar `npm run lint`, `npm run type-check`, `npm run test`, `npm run build` y `./scripts/audit-migrations.sh` tras la integración.

## Fase 10 — Prevención de autoescalamiento de roles (PR #91, 2026-06-08)

- [ ] T035 Migración `prevent_role_self_escalation`: Campos sensibles (rol, permisos, alcances, matricula_sase, email, role) protegidos contra self-update via RLS WITH CHECK.
- [ ] T036 Migración `fix_rls_helpers_hardening`: Helpers SECURITY DEFINER movidos a schema `private`, el cual no se expone como API pública por PostgREST. `authenticated` necesita `USAGE` sobre el schema `private` y `EXECUTE` sobre los helpers usados en policies; esto no abre RPC pública. `anon` no debe tener permisos. Campos `seguridad_status`, `blocked_until`, `grupo_tutor`, `grupos` agregados al conjunto inmutable.
- [ ] T037 Corrección Sasito: Matching de señales rojas por word-boundary (evita falsos positivos de subcadena). Prioridad de señales rojas sobre coincidencias académicas.
- [ ] T038 Runbook de pruebas RLS: Corregido para usar cliente autenticado real en vez de SQL Editor con service_role.
- [ ] T039 Verificación: pnpm type-check, pnpm test, pnpm build, audit-migrations.sh

### Campos protegidos contra self-update

| Tabla | Campo | Razón |
|-------|-------|-------|
| perfiles_usuario | rol | Escalamiento de privilegios |
| perfiles_usuario | permisos | Modificación de permisos JSONB |
| perfiles_usuario | alcances | Modificación de alcances JSONB |
| perfiles_usuario | matricula_sase | Identidad institucional |
| perfiles_usuario | email | Identidad |
| perfiles_usuario | role | Campo legacy de rol |
| perfiles_usuario | seguridad_status | Bloqueo de seguridad |
| perfiles_usuario | blocked_until | Bloqueo temporal |
| perfiles_usuario | grupo_tutor | Scope de grupo para tokens |
| perfiles_usuario | grupos | Scope de grupos para tokens |
| profiles | role | Rol en tabla legacy |

### Riesgos residuales

- Validación completa pendiente en Supabase real/staging con usuario QA.
- El campo `risk_score` en perfiles_usuario no está protegido explícitamente (usado solo en lectura por Login.tsx).
