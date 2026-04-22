# Spec 005 - Ecosistema de Modulos Externos

Estado: Aprobada para implementacion

## Contexto

SASE debe consolidarse como shell central del ecosistema institucional sin absorber el codigo de modulos externos como Feria, Diagnostico Colectivo y Mate. El repo ya tenia un launcher aislado para Feria, pero no existia un catalogo persistente, reglas genericas de acceso ni un contrato unico de handoff.

## Problema

La integracion actual depende de codigo hardcodeado en frontend y backend, con un flujo especifico para Feria y sin una fuente de verdad unificada para visibilidad, autorizacion, rollout y auditoria de modulos externos.

## Objetivos

- Crear un catalogo persistente de modulos externos en Supabase.
- Resolver acceso por rol y por usuario desde backend con denegacion por defecto.
- Estandarizar el launcher en `POST /api/modules/launch`.
- Emitir tokens firmados con `base64url` usando `sub` como identificador canonico.
- Hacer que Home, Sidebar y Router lean modulos externos desde una fuente de verdad real.

## Requisitos funcionales

- Deben existir las tablas `modulos_ecosistema`, `modulos_ecosistema_roles` y `modulos_ecosistema_usuarios`.
- Debe existir una funcion `get_modulos_ecosistema_visibles()` para la UI autenticada.
- El backend debe validar sesion, modulo activo y acceso efectivo antes de lanzar cualquier modulo.
- El token de handoff debe tener formato `<payloadBase64Url>.<signatureBase64Url>`.
- El payload debe incluir `sub`, `uid`, `email`, `role`, `name`, `module`, `institutionId`, `groupId`, `iat`, `exp`.
- `api/auth/launch-feria.ts` debe quedar como wrapper temporal hacia la logica nueva.
- `Mate` debe documentarse y sembrarse como rollout provisional para usuarios autenticados actuales de SASE.

## Criterios de exito

- El launcher generico funciona para `feria`, `diagnostico` y `mate`.
- La firma nueva usa `base64url` y no vuelve a emitir `hex`.
- La UI muestra modulos externos segun `get_modulos_ecosistema_visibles()`.
- Un usuario no autorizado recibe rechazo consistente en backend y queda auditado.
