# Verificación rápida

```powershell
pnpm test -- tests/direccionPersistence.test.ts tests/DashboardDireccion.test.tsx tests/DireccionMigrationSecurity.test.ts
pnpm lint
pnpm type-check
pnpm test
pnpm build
git diff --check
& 'C:\Program Files\Git\bin\bash.exe' -lc './scripts/audit-migrations.sh'
pnpm exec supabase db start
pnpm exec supabase db lint --local
```

## Flujo

1. Ingresar como Dirección.
2. Confirmar que el panorama carga desde el RPC.
3. Verificar KPIs, carga por área y concentración por grupo.
4. Abrir un alumno y revisar únicamente conteos, estados y fechas.
5. Aplicar el filtro de pendientes vencidos.
6. Generar reporte y comparar sus cifras con la pantalla.

## Resultado del 18 de julio de 2026

Las validaciones frontend, build, diff y auditoría estática aprobaron. Docker
no expuso `//./pipe/docker_engine`; por consecuencia, Supabase local no arrancó
y el linter no pudo conectar a Postgres.
