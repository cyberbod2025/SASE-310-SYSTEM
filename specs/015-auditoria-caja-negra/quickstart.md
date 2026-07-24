# Quickstart de validación

## Frontend

```powershell
pnpm lint
pnpm type-check
pnpm test -- tests/auditoriaPersistence.test.ts tests/AuditoriaMigrationSecurity.test.ts tests/BitacoraAuditoria.test.tsx tests/useAuditLogic.test.ts tests/useAuditoriaAccesos.test.ts
pnpm test
pnpm build
git diff --check
```

## Base local

```powershell
& 'C:\Program Files\Git\bin\bash.exe' ./scripts/audit-migrations.sh
pnpm exec supabase db start
pnpm exec supabase db lint --local
pnpm exec supabase migration list --local
```

La auditoría estática de migraciones puede ejecutarse sin Docker. Los tres
comandos de Supabase local requieren Docker Desktop en ejecución.

## Comprobaciones manuales

1. Iniciar sesión con Dirección o Subdirección activa.
2. Abrir Caja Negra y confirmar que la consulta queda registrada.
3. Filtrar por categoría, rol, tabla y texto.
4. Confirmar que un registro sin alumno no inventa un nombre.
5. Descargar CSV y verificar contenido y nombre del archivo.
6. Confirmar que un rol no autorizado recibe `42501`.
7. Confirmar que `authenticated` no puede consultar ni insertar directamente
   en `public.auditoria`.
