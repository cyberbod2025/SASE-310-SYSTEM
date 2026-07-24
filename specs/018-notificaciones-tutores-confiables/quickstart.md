# Quickstart de validación

## Aplicación

```powershell
pnpm test -- tests/notifications.test.ts tests/WhatsAppEndpointSecurity.test.ts tests/WhatsAppMigrationSecurity.test.ts tests/WhatsAppUiSecurity.test.ts tests/useStudentsSlice.test.tsx
pnpm lint
pnpm type-check
pnpm test
pnpm build
git diff --check
```

## Servidor

```powershell
pnpm exec esbuild api/notifications/whatsapp.ts --bundle --platform=node --format=esm --outfile="$env:TEMP\sase-310-api-check\whatsapp.js"
```

## Base local

```powershell
& 'C:\Program Files\Git\bin\bash.exe' ./scripts/audit-migrations.sh
pnpm exec supabase db start
pnpm exec supabase db lint --local
pnpm exec supabase migration list --local
```

## Comprobaciones manuales

1. Intentar notificar una incidencia sin teléfono de tutor.
2. Intentar con un perfil inactivo o bloqueado.
3. Verificar que sin credenciales aparece “no enviada / simulación”.
4. Verificar que un fallo del proveedor queda como `FALLIDO`.
5. Confirmar que solo `ENVIADO` cambia `notificado_whatsapp`.
6. Confirmar que logs, auditoría y tabla no contienen el teléfono completo.
