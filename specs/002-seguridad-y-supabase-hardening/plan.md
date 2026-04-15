# Plan - 002 Seguridad y Supabase Hardening

## Resumen

Aplicar un hardening focalizado sobre Supabase y endpoints sensibles sin reescribir el producto. La intervención se centra en cerrar exposición de datos, consolidar paths server-side para aprobación institucional y corregir inconsistencias de auditoría y entorno local.

## Alcance técnico

- SQL y migraciones de seguridad.
- Edge/server para aprobación e invitación de personal.
- Frontend de aprobación para consumir el nuevo camino seguro.
- Endpoint `/api/notifications/whatsapp`.
- Alineación mínima de `.env.example` y `supabase/config.toml`.

## Estrategia

### Fase 1. Hardening SQL mínimo y seguro

- Crear una nueva migración correctiva.
- Eliminar la policy abierta de `SELECT` en `solicitudes_alta_personal`.
- Eliminar la policy anónima insegura de auditoría.
- Normalizar estados de `solicitudes_alta_personal` a la convención canónica elegida.
- Dejar documentado el impacto sobre datos existentes si hay filas con estados viejos.

### Fase 2. Aprobación server-side

- Implementar una edge function dedicada `approve-staff` o equivalente con contrato explícito.
- Flujo esperado:
  1. validar origin y token
  2. validar rol aprobador (`directivo`, `subdireccion`, `developer` o el set definitivo)
  3. leer solicitud
  4. crear o invitar usuario real en Auth
  5. crear o actualizar `perfiles_usuario`
  6. actualizar solicitud con estado canónico, matrícula y datos asignados
  7. registrar auditoría
- Mantener `create-user` como función base solo si no introduce ambigüedad; preferencia actual: endpoint dedicado.

### Fase 3. Frontend de aprobación

- Reemplazar el insert directo en `AprobacionesPersonal.tsx` por llamada al flujo server-side.
- Conservar la UX actual tanto como sea posible.
- Mostrar error claro si el backend rechaza por permisos o inconsistencia de datos.

### Fase 4. Endpoint WhatsApp y entorno

- Resolver rol institucional desde `perfiles_usuario` y fallback legado si aún es necesario.
- Limitar uso del endpoint a roles permitidos.
- Insertar auditoría usando columnas reales.
- Alinear `.env.example` y `supabase/config.toml`.

## Archivos previstos

- nueva migración en `supabase/migrations/`
- `supabase/functions/approve-staff/index.ts` o equivalente
- `src/components/AprobacionesPersonal.tsx`
- `api/notifications/whatsapp.ts`
- `.env.example`
- `supabase/config.toml`

## Riesgos y mitigación

- Riesgo: romper el flujo de aprobación actual.
  - Mitigación: mover la lógica a backend manteniendo el contrato visual del modal.
- Riesgo: estados históricos incompatibles.
  - Mitigación: normalización de datos dentro de la nueva migración.
- Riesgo: edge function con allowlist desalineado respecto a tipos.
  - Mitigación: revisar al mismo tiempo `invite-staff`, tipos y canon.
- Riesgo: auditoría silenciosa rota.
  - Mitigación: verificar explícitamente errores de inserción y usar columnas reales.

## Validación prevista

- `./scripts/audit-migrations.sh`
- `supabase db start`
- `supabase db lint --local`
- `npm run lint`
- `npm run type-check`
- `npm run test`
- smoke manual del registro y la aprobación
