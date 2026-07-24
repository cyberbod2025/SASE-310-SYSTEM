# Quickstart de validación

## Frontend y función

```powershell
pnpm test -- tests/aprobacionPersonalPersistence.test.ts tests/AprobacionesPersonal.test.tsx tests/ApproveStaffFunctionSecurity.test.ts tests/AprobacionPersonalMigrationSecurity.test.ts
pnpm lint
pnpm type-check
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

Los comandos de Supabase local requieren Docker Desktop en ejecución.

## Comprobaciones manuales

1. Iniciar sesión con Dirección o Subdirección activa.
2. Aprobar una solicitud pendiente y confirmar que se invita o reutiliza el
   usuario Auth.
3. Confirmar perfil activo, solicitud aprobada y auditoría con el mismo
   aprobador.
4. Rechazar otra solicitud con un motivo y verificar que no se crea usuario
   Auth.
5. Confirmar que un perfil suspendido, restringido o de rol no autorizado
   recibe rechazo.
6. Confirmar que el navegador no puede actualizar
   `solicitudes_alta_personal` directamente.
7. Forzar un fallo transaccional y confirmar que una invitación nueva no queda
   huérfana.
