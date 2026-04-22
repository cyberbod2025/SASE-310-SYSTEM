# Quickstart - 005 Ecosistema de Modulos Externos

## Variables necesarias

1. Configura en `.env.local` o en tu entorno:
   - `SASE_SHARED_SECRET`
   - `FERIA_APP_URL`
   - `DIAGNOSTICO_APP_URL`
   - `MATE_APP_URL`

## Levantar entorno local

1. `supabase db start`
2. `npm ci`
3. `npm run dev`

## Validar catalogo y launcher

1. Verifica que los modulos visibles aparezcan en Home y Sidebar tras iniciar sesion.
2. Entra a `Feria` desde la UI de SASE con un usuario piloto.
3. Confirma que la URL de salida incluya `?sase_token=` antes del hash del modulo.
4. Repite con un usuario no autorizado y valida rechazo controlado.

## Nota operativa

- `Mate` queda sembrado como acceso provisional de rollout para usuarios autenticados actuales de SASE. No representa el modelo final de identidad estudiantil.
