# Quickstart 007 - Hardening Edge para Feria

## Flujo Seguro

1. SASE genera URL de Feria con `sase_token`.
2. Feria llama `student-login` con `sase_token` y `estudiante_id` o `alumno_id`.
3. `student-login` devuelve `student_session_token`.
4. Feria llama las demás funciones con header `x-student-session-token`.
5. El frontend externo deja de llamar `registrar_progreso_v2` y `finalizar_trivia_v2` directamente.
6. Cuando el corte esté validado, ejecutar manualmente `supabase/sql/feria_rpc_revoke_after_edge_cutover.sql`.

## Endpoints

- `POST /functions/v1/student-login`
- `POST /functions/v1/student-progress`
- `POST /functions/v1/student-finish-trivia`
- `GET /functions/v1/student-progress-get`

## Headers

- `Content-Type: application/json`
- `x-student-session-token: <student_session_token>` para endpoints posteriores al login.
