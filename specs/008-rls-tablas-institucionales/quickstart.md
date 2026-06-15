# Quickstart - 008 RLS Tablas Institucionales

## 1. Migraciones

```bash
# Copiar WIP sos a migrations real
cp _wip/sos/20260503220000_sos_auto_escalation.sql \
   supabase/migrations/20260612000001_sos_alerts_y_auto_escalation.sql

# La migracion 002 se crea desde cero con RLS policies
# Ver spec.md para el contenido exacto
```

## 2. Frontend

```bash
# Regenerar tipos
supabase gen types typescript --local > src/supabase/types.ts

# Editar useInstitutionalActions.ts para quitar todos los "as any"
# Verificar con:
pnpm type-check
pnpm test
```

## 3. Verificacion

```bash
# Migraciones
supabase db start
supabase migration up
./scripts/audit-migrations.sh
supabase db lint --local

# Frontend
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

## 4. Prueba manual

Ver spec.md — prueba end-to-end con login de Direccion para escalar, SOS, cerrar caso.
