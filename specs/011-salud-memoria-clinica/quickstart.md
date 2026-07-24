# Verificación rápida

## Frontend

```powershell
pnpm test -- tests/saludPersistence.test.ts tests/DashboardSalud.test.tsx tests/HealthModuleAccess.test.tsx
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

1. Ingresar como Servicio Médico.
2. Seleccionar un alumno y registrar una atención.
3. Confirmar que aparece en historial y persiste al recargar.
4. Registrar una alerta clínica sin crear incidencia.
5. Cerrar una atención y confirmar el estado devuelto.
6. Ingresar como docente y confirmar acceso denegado al módulo.
7. Confirmar que docente no recibe filas de `salud` ni
   `atenciones_medicas`.

