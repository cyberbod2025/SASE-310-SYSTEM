# Verificación rápida

```powershell
pnpm test -- tests/orientacionApi.test.ts tests/DashboardOrientacion.test.tsx
pnpm lint
pnpm type-check
pnpm test
pnpm build
git diff --check
```

## Flujo

1. Abrir un caso persistido.
2. Registrar un seguimiento y confirmar que aparece sin recargar la página.
3. Crear un plan y confirmar que historial y métricas se actualizan.
4. Simular un rechazo RLS y comprobar que el formulario conserva el texto.
5. Derivar o escalar y comprobar que la confirmación no promete automatismos.
