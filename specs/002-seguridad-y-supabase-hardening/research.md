# Research - 002 Seguridad y Supabase Hardening

## Fuentes revisadas

- `memory/constitution.md`
- `memory/sase-canon.md`
- `src/components/RegistroPersonal.tsx`
- `src/components/AprobacionesPersonal.tsx`
- `api/notifications/whatsapp.ts`
- `api/auth/verify-staff.ts`
- `supabase/functions/create-user/index.ts`
- `supabase/functions/invite-staff/index.ts`
- `supabase/migrations/20240101000000_core_sase_schema.sql`
- `supabase/migrations/20260111_sistema_institucional_completo.sql`
- `supabase/migrations/20260120_request_staff_access.sql`
- `supabase/config.toml`
- `.env.example`
- `docs/SECURITY_AUDIT_REPORT_2026-03-28.md`

## Hallazgos verificados

### 1. SELECT inseguro en `solicitudes_alta_personal`

- Fuente: `supabase/migrations/20260120_request_staff_access.sql:50-54`
- Hecho verificado: existe policy `FOR SELECT TO anon, authenticated USING (true)`.
- Impacto: exposición completa de solicitudes con PII.

### 2. Inserción anónima en auditoría

- Fuente: `supabase/migrations/20260120_request_staff_access.sql:58-65`
- Hecho verificado: existe policy `Anon puede registrar auditoria de alta`.
- Impacto: tabla de auditoría rellenable por actor no autenticado.

### 3. Aprobación en cliente con ID inválido

- Fuente: `src/components/AprobacionesPersonal.tsx:81-88`
- Hecho verificado: el cliente inserta `id = usr-${Date.now()}` en `perfiles_usuario`.
- Impacto: PK/FK incompatible con `auth.users(id)` UUID.

### 4. El frontend actual de registro no depende de `SELECT` post-insert

- Fuente: `src/components/RegistroPersonal.tsx:337-372`
- Hecho verificado: hace `.insert({...})` sin `.select()`.
- Impacto: cerrar el `SELECT` abierto no rompe el flujo actual de registro.

### 5. Existe edge function reutilizable parcialmente, pero no cubre la aprobacion completa

- Fuente: `supabase/functions/create-user/index.ts`
- Hecho verificado: crea usuario Auth real y valida rol del solicitante, pero no actualiza `solicitudes_alta_personal`, no hace `upsert` completo de `perfiles_usuario` ni normaliza estados.
- Decision: conviene una función dedicada de aprobación (`approve-staff`) o ampliar claramente la existente, pero con un contrato específico.

### 6. `verify-staff` ya usa credenciales de servidor y rate limit

- Fuente: `api/auth/verify-staff.ts`
- Hecho verificado: usa `SUPABASE_SERVICE_ROLE_KEY`, valida `ALLOWED_ORIGINS` y aplica rate limit.
- Impacto: el patrón correcto para operaciones sensibles ya existe en el repo.

### 7. `whatsapp.ts` autentica, pero no autoriza por rol y registra mal la auditoría

- Fuente: `api/notifications/whatsapp.ts:53-105`
- Hecho verificado:
  - valida token de sesión
  - no consulta rol institucional
  - inserta en `auditoria` usando `creado_en`
- Fuente del schema: `supabase/migrations/20240101000000_core_sase_schema.sql:55-65`
- Hecho verificado: la tabla usa `fecha`, no `creado_en`.

### 8. Configuración local inconsistente

- Fuente: `.env.example:1-8`
- Fuente: `vite.config.ts`
- Hecho verificado: `ALLOWED_ORIGINS` apunta a `5173`, pero Vite corre en `3100`.

### 9. Seed configurado no coincide con el archivo real

- Fuente: `supabase/config.toml:60-65`
- Hecho verificado: `sql_paths = ["./seed.sql"]`, pero el repo visible trae `supabase/seed_data.sql`.

### 10. Estado de aprobacion inconsistente

- Fuentes:
  - `supabase/migrations/20260111_sistema_institucional_completo.sql`
  - `supabase/migrations/20260120_request_staff_access.sql`
  - `src/components/AprobacionesPersonal.tsx`
- Hecho verificado: coexisten `APROBADA/RECHAZADA/OBSERVACIONES` y `APROBADO/RECHAZADO`.

## Decisiones de diseño para esta fase

1. Cerrar `SELECT` abierto de `solicitudes_alta_personal`.
2. Cerrar inserción anónima insegura en auditoría.
3. Mantener `RegistroPersonal` funcionando sin depender de lectura post-insert.
4. Mover aprobación de personal a un flujo server-side/edge con UUID real.
5. Corregir `whatsapp.ts` para que valide rol y audite con schema real.
6. Normalizar estados de solicitud con una sola convención canónica.
7. Alinear `.env.example` y `supabase/config.toml` para reducir fallas de desarrollo y QA.
