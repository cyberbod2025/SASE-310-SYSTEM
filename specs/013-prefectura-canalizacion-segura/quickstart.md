# Verificación rápida

```powershell
pnpm test -- tests/prefecturaPersistence.test.ts tests/DashboardPrefectura.test.tsx tests/useStudentsSlice.test.tsx tests/PrefecturaMigrationSecurity.test.ts
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

1. Identificar alumno por matrícula.
2. Registrar una incidencia y verificar que conserva el UUID de Supabase.
3. Simular RLS denegado y confirmar que no aparece éxito.
4. Escribir un motivo y canalizar a Orientación.
5. Confirmar responsable y caso asignados.
6. Repetir la canalización y confirmar reutilización del caso abierto.

## Resultado del 18 de julio de 2026

Las validaciones de frontend, build, diff y auditoría estática aprobaron. Los
dos comandos de base local quedaron bloqueados: Docker no expuso
`//./pipe/docker_engine` y, por consecuencia, el linter no pudo conectar a
Postgres.
