# Playwright Smoke Test

## Propósito
Validar que una app o PR funciona visual y funcionalmente sin hacer pruebas profundas.

## Cuándo usarlo
- Antes de merge manual.
- Después de un PR visual.
- Después de cambios en rutas, dashboards o login.
- Antes de piloto institucional.

## Prohibido
- No modificar código durante el smoke.
- No hacer merge.
- No hacer deploy manual.
- No corregir errores sin autorización.
- No actualizar snapshots sin autorización.

## Procedimiento

1. Confirmar rama:
git branch --show-current
git status --short

2. Confirmar app/build:
pnpm run build

3. Ejecutar smoke:
pnpm exec playwright test

4. Si hay pruebas específicas:
pnpm exec playwright test tests/<archivo>.spec.ts

5. Capturas:
Guardar evidencia en carpeta temporal o artefactos CI, nunca commitear `test-results/` salvo autorización.

## Reporte obligatorio
- URL probada.
- Navegador.
- Tests ejecutados.
- PASS / FAIL.
- Capturas disponibles.
- Errores exactos.
- Recomendación: merge / no merge / requiere ajuste.
