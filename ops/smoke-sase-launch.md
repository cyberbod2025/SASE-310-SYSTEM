# Smoke SASE -> Feria

Este smoke se ejecuta del lado SASE en el Ubuntu real donde corra el runtime server-side.

## Objetivo

Validar que el launcher real de SASE:

- tiene variables activas de runtime
- responde por HTTP real en `POST /api/modules/launch`
- autoriza a un piloto de Feria
- rechaza a un usuario no autorizado
- genera una URL con `?sase_token=...#/docente`
- firma el token con `base64url`
- registra auditoria `MODULO_LAUNCH_OK` y `MODULO_LAUNCH_DENIED`

## Variables necesarias

Obligatorias:

- `SASE_BASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SASE_SHARED_SECRET`
- `FERIA_APP_URL`
- `SASE_PILOT_EMAIL`
- `SASE_PILOT_PASSWORD`
- `SASE_BLOCKED_EMAIL`
- `SASE_BLOCKED_PASSWORD`

Opcionales:

- `SASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_ANON_KEY`

## Ejemplo

```bash
export SASE_BASE_URL="https://sase.midominio.com"
export FERIA_APP_URL="https://feria.midominio.com/#/docente"
export SUPABASE_URL="https://proyecto.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="..."
export SASE_SHARED_SECRET="EL_MISMO_SECRETO_QUE_USA_FERIA"
export SASE_PUBLISHABLE_KEY="..."
export SASE_PILOT_EMAIL="docente.piloto@sase.mx"
export SASE_PILOT_PASSWORD="..."
export SASE_BLOCKED_EMAIL="usuario.no.autorizado@sase.mx"
export SASE_BLOCKED_PASSWORD="..."

node ops/smoke-sase-launch.js
```

## Resultado esperado

Debe imprimir la `Launch URL` con este patron:

```text
https://feria.midominio.com/?sase_token=TOKEN#/docente
```

Y debe terminar con:

```text
Smoke OK: SASE runtime authorized the pilot, denied the blocked user and preserved the Feria handoff URL.
```

## Si falla

Revisa en este orden:

1. `FERIA_APP_URL` apunta a la Feria real y accesible.
2. `SASE_SHARED_SECRET` coincide exactamente con Feria.
3. `SASE_BASE_URL` apunta al runtime real de SASE.
4. `POST /api/modules/launch` responde por HTTP real.
5. El piloto esta en `modulos_ecosistema_usuarios`.
6. El usuario negativo no aparece en la allowlist de Feria.
7. La Feria desplegada es la receptora compatible actual.

## Evidencia util para compartir

- valor efectivo de `FERIA_APP_URL`
- codigo HTTP positivo y negativo
- `Launch URL` final
- payload decodificado del token
- filas recientes de auditoria impresas por el smoke
