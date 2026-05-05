# Plan 007 - Hardening Edge para Feria

## Diseño

- `student-login` recibe `sase_token`, valida firma HMAC con `SASE_SHARED_SECRET`, valida módulo `feria`, expiración y estudiante, y genera `student_session_token` opaco.
- El token opaco se guarda solo como hash en `feria_student_sessions`.
- Las operaciones posteriores usan `x-student-session-token`.
- `student-progress` y `student-finish-trivia` llaman RPC internas `internal_feria_*` con `service_role` desde Edge.
- `student-finish-trivia` valida respuestas contra llaves de la estación antes de otorgar puntos.
- `student-progress-get` devuelve progreso solo para la sesión validada.

## Seguridad

- `verify_jwt = false` queda configurado porque estas funciones usan autenticación propia; cada handler valida token explícitamente.
- No se guardan tokens en claro.
- Auditoría en `auditoria` registra acción, actor institucional y IDs técnicos.
- No se ejecutan revokes legacy hasta migrar el cliente Feria.

## Riesgos

- Si `estaciones` no contiene llave de respuesta, `student-finish-trivia` devuelve `422` en lugar de confiar en el frontend.
- Si Feria aún llama RPC legacy, seguirá funcionando hasta ejecutar el script manual de revocación.
