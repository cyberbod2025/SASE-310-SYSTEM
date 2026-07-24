# Verificación rápida

## Frontend

```powershell
pnpm test -- tests/udeiiPersistence.test.ts tests/DashboardUDEII.test.tsx
pnpm lint
pnpm type-check
pnpm test
pnpm build
git diff --check
```

## Migraciones

```powershell
& 'C:\Program Files\Git\bin\bash.exe' -lc './scripts/audit-migrations.sh'
$env:SUPABASE_TELEMETRY_DISABLED='1'
& '.\node_modules\.bin\supabase.CMD' db start
& '.\node_modules\.bin\supabase.CMD' db lint --local
```

## Comprobación funcional

1. Ingresar con rol UDEII activo.
2. Seleccionar un alumno sin resumen BAP y registrar una detección.
3. Confirmar que aparece en el monitor y en el historial.
4. Registrar un ajuste posterior.
5. Recargar y comprobar que ambos eventos permanecen.
6. Verificar que el resumen conserva los ajustes anteriores.
7. Repetir sin sesión o con rol no autorizado y confirmar denegación sin éxito visual.

