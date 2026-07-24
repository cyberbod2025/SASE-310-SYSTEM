# Quickstart de validación

## Pruebas focales

```powershell
pnpm test -- tests/AiSecurity.test.ts tests/AiEndpointSecurity.test.ts tests/AiClientPrivacy.test.ts
```

## Validación integral

```powershell
pnpm type-check
pnpm lint
pnpm test
pnpm build
git diff --check
```

## Handlers

```powershell
pnpm exec esbuild api/ai/gemini.ts --bundle --platform=node --format=esm --outfile="$env:TEMP\sase-310-api-check\gemini.js"
pnpm exec esbuild api/ai/openrouter.ts --bundle --platform=node --format=esm --outfile="$env:TEMP\sase-310-api-check\openrouter.js"
```

## Comprobaciones manuales

1. Rechazar usuario sin perfil activo y seguro.
2. Rechazar CURP, correo, teléfono y campos extra antes del proveedor.
3. Confirmar que auditoría contiene propósito, proveedor, modelo y resultado, pero
   no prompt ni respuesta.
4. Confirmar que el análisis de expediente no genera tráfico de red.
5. Confirmar que el generador de documentos de caso no genera tráfico externo y
   produce un borrador local.
6. Confirmar que una respuesta IA permanece como borrador hasta revisión humana.

## Límite

No se deben configurar ni invocar proveedores reales durante esta validación local.
