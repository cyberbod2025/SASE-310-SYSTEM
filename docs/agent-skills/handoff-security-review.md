# Handoff Security Review

## Propósito
Auditar integraciones entre SASE y módulos externos como Feria.

## Revisar
- firma del token
- issuer
- audience
- exp
- iat
- nbf
- jti
- module
- role
- anti-replay
- cookie HttpOnly
- sesión server-side

## Reglas
- El cliente no decide rol.
- El backend valida token.
- Secret nunca va al frontend.
- Tokens cortos: 1 a 5 minutos.
- Rechazar module incorrecto.
- Rechazar rol no permitido.
- Rechazar token expirado o alterado.
