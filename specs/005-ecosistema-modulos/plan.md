# Plan - 005 Ecosistema de Modulos Externos

## Resumen

Convertir SASE en portal central de modulos externos mediante un catalogo persistente, un launcher server-side generico y una integracion de UI que consuma visibilidad real desde Supabase.

## Cambios previstos

- Crear migracion de catalogo, acceso, RPC de visibilidad y auditoria asociada.
- Implementar `POST /api/modules/launch` con helpers de resolucion de URL, acceso y token.
- Mantener `api/auth/launch-feria.ts` como compatibilidad temporal sobre la logica nueva.
- Reemplazar hardcodes de Feria en Home, Sidebar, Router y dashboard docente por consumo del catalogo real.
- Actualizar tipos y documentacion de entorno.

## Validacion

- `./scripts/audit-migrations.sh`
- `supabase db start`
- `supabase db lint --local`
- `npm ci`
- `npm run lint`
- `npm run type-check`
- `npm run test`
- `npm run build`
- Smoke manual del lanzamiento de Feria y del rechazo de usuarios no autorizados.
