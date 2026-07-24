# Quickstart de validación

## Aplicación

```powershell
pnpm test -- tests/registroPersonalPersistence.test.ts tests/RegistroPersonal.test.tsx tests/VerifyStaffSecurity.test.ts tests/RegistroPersonalMigrationSecurity.test.ts
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

## Comprobaciones manuales

1. Completar una solicitud con correo `nombre.apellido@sase.mx`.
2. Confirmar que el formulario no pide contraseña, respuestas de seguridad,
   fecha de nacimiento ni RFC.
3. Confirmar que el mensaje final conserva el estado pendiente.
4. Verificar que el payload solo contiene metadata operativa.
5. Intentar insertar una clave `password` o `preguntas_seguridad` en metadata y
   confirmar el rechazo.
6. Intentar un correo externo y confirmar el rechazo.

## Resultado observado el 24 de julio de 2026

- 11/11 pruebas enfocadas aprobadas.
- 218/218 pruebas de la suite completa aprobadas.
- Type-check y build aprobados.
- Lint sin errores; cuatro advertencias históricas fuera del cambio.
- Handlers `verify-staff`, `register-staff` y `approve-staff` empaquetados sin
  errores.
- Auditoría estática de migraciones aprobada.
- PostgreSQL local no inició porque Docker Desktop no está disponible; por
  tanto, la aplicación y el lint SQL real siguen pendientes.
