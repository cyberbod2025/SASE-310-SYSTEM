# Quickstart de validación

## Aplicación y endpoint

```powershell
pnpm test -- tests/DistribucionEndpointSecurity.test.ts tests/DistribucionEndpoint.test.ts
pnpm type-check
pnpm lint
pnpm test
pnpm build
git diff --check
```

## Empaquetado

```powershell
pnpm exec esbuild api/ai/distribucion.ts --bundle --platform=node --format=esm --outfile="$env:TEMP\sase-310-api-check\distribucion.js"
```

## Comprobaciones manuales

1. Rechazar origen no permitido, token ausente y perfil bloqueado.
2. Rechazar roles distintos de Dirección, Subdirección o técnicos.
3. Rechazar campos adicionales y propósitos vacíos.
4. Confirmar que la respuesta no contiene puntajes, nombres ni BAP.
5. Confirmar que no cambia `alumno_ciclo.grupo_sugerido`.
6. Confirmar una entrada de auditoría con actor, ciclo y propósito.

## Límite

Las pruebas locales usan dobles controlados. La autorización y la auditoría deben
validarse nuevamente contra un proyecto Supabase seguro antes del despliegue.
