# Quickstart - 002 Seguridad y Supabase Hardening

## Objetivo

Cerrar riesgos de Supabase y endpoints sensibles sin romper registro, aprobación e interacción operativa del sistema.

## Archivos a revisar antes de implementar

- `memory/constitution.md`
- `memory/sase-canon.md`
- `src/components/RegistroPersonal.tsx`
- `src/components/AprobacionesPersonal.tsx`
- `api/notifications/whatsapp.ts`
- `supabase/functions/create-user/index.ts`
- `supabase/functions/invite-staff/index.ts`
- `supabase/migrations/20260111_sistema_institucional_completo.sql`
- `supabase/migrations/20260120_request_staff_access.sql`
- `docs/SECURITY_AUDIT_REPORT_2026-03-28.md`

## Orden recomendado

1. Crear migración correctiva de seguridad.
2. Implementar el flujo server-side de aprobación.
3. Conectar `AprobacionesPersonal.tsx` al nuevo flujo.
4. Corregir `whatsapp.ts`.
5. Alinear `.env.example` y `supabase/config.toml`.
6. Ejecutar validaciones.

## Validación mínima

### SQL

- `./scripts/audit-migrations.sh`
- `supabase db start`
- `supabase db lint --local`

### Frontend y app

- `npm run lint`
- `npm run type-check`
- `npm run test`
- `npm run build`

### Smoke manual

- enviar una solicitud desde `RegistroPersonal`
- confirmar que la solicitud no se pueda leer públicamente
- aprobar una solicitud como rol permitido
- confirmar creación o invitación real de usuario
- probar `/api/notifications/whatsapp` con rol permitido y no permitido

## Regla operativa

Si al implementar esta fase cambias una regla estable del sistema, actualiza tambien:

- `memory/sase-canon.md`
- `AGENTS.md` si el cambio altera una instrucción operacional corta
