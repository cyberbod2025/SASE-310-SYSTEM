# Security Review: snapshots remotos de migraciones

Estado: borrador local
Fecha: 2026-06-02
Rama: `codex/supabase-migration-reconciliation`

## Alcance

Revision de seguridad y compatibilidad de los cinco archivos agregados para reconciliar IDs que ya existen en `supabase_migrations.schema_migrations` remoto.

No se autoriza ejecutar `supabase db push`, `supabase migration repair`, deploy, merge ni cambios remotos.

## Esquema canonico local esperado

- `public.diagnosticos_docentes` canonico viene de `20260501084547_orientacion_v2_backend.sql` y usa `solicitud_id`, `caso_id`, `docente_id`; no usa `docente_nombre` ni `alumno_id`.
- `src/supabase/types.ts` confirma esa forma canonica.
- `sos_alerts` aparece usado en `src/hooks/useInstitutionalActions.ts`, pero con casts `as any`, lo que indica integracion incompleta con tipos generados.
- No se encontro uso actual de `feedback_institucional` en `src/`, `api/`, `public/` ni `supabase/functions/`.

## Riesgos por archivo

### `20260503220000_sos_auto_escalation.sql`

Riesgo: alto.

- Crea `public.sos_alerts` en schema expuesto.
- Policy `sos_alerts_read_institutional` usa `USING (true)` sin `TO`, por lo que queda conceptualmente abierta si existen grants.
- Policies de INSERT/UPDATE solo validan `auth.uid() IS NOT NULL`; cualquier usuario autenticado podria crear, reconocer o resolver alertas ajenas si hay grants.
- `public.auto_escalate_sos()` es `SECURITY DEFINER` en schema expuesto y no revoca `EXECUTE`; puede quedar invocable como RPC.
- `public.auto_resolve_previous_sos()` tambien es `SECURITY DEFINER` y no define `search_path`.
- `pg_cron` agenda ejecucion cada minuto y escribe en `notificaciones`; esto puede amplificar errores de RLS o datos.

Decision propuesta: mover a `_wip` o convertir en snapshot no-op/documental hasta auditar RLS, grants, `EXECUTE`, `search_path` y rol operativo del cron. No esta listo como migracion activa segura.

### `20260504234803_fix_diagnosticos_docentes_rls.sql`

Riesgo: medio si se ejecuta sobre schema legacy; bajo en replay canonico actual.

- Esta protegido por guardas que exigen `docente_nombre` y `alumno_id`.
- En schema canonico local debe hacer solo `NOTICE`.
- Si remoto conserva schema legacy, crea INSERT anon controlado pero tambien SELECT/INSERT authenticated con `USING (true)` y `WITH CHECK (true)`.

Decision propuesta: conservar condicionado como snapshot historico. Si se confirma schema legacy remoto, ajustar antes de cualquier accion remota para eliminar policies permisivas.

### `20260504234816_fix_v_diagnosticos_docentes_view.sql`

Riesgo: medio si se ejecuta sobre schema legacy; bajo en replay canonico actual.

- Esta protegido por guardas de columnas legacy.
- Crea `public.v_diagnosticos_docentes` sin `WITH (security_invoker = true)`.
- La nota del SQL asume invoker por defecto, pero la regla segura para vistas expuestas es declararlo explicitamente.

Decision propuesta: conservar condicionado como snapshot historico. Ajustar a `security_invoker = true` si alguna vez se activa sobre schema legacy.

### `20260511163305_create_feedback_institucional.sql`

Riesgo: medio.

- Crea tabla publica con campos potencialmente sensibles: nombre, grupo, rol, `user_agent`, metadata.
- Policy inicial permite INSERT con `WITH CHECK (true)`.
- Policy inicial permite SELECT a cualquier `authenticated`; si la siguiente migracion falla, el feedback queda visible para todos los usuarios autenticados.

Decision propuesta: conservar solo como par historico inseparable de `20260511163531`. Antes de accion remota, preferir una migracion de hardening adicional o reescritura fail-closed.

### `20260511163531_refine_feedback_institucional_rls.sql`

Riesgo: bajo-medio.

- Mejora SELECT con `public.is_staff()`.
- Permite INSERT a `anon` y `authenticated`, con checks de tipo, origen, longitud y estado.
- No limita `metadata`, `user_agent`, `nombre`, `grupo` ni correlacion de `user_id`; puede recibir PII o payloads grandes si no hay controles API.
- Depende de que `public.is_staff()` exista y sea seguro.

Decision propuesta: conservar, pero documentar como superficie publica de captura. Requiere limites de payload, privacidad y confirmacion de `is_staff()` antes de considerarse lista para produccion.

## Compatibilidad con replay local

- SOS altera replay local de forma material y peligrosa: crea tabla, funciones, cron y RLS. No es solo documental.
- Los dos archivos de `diagnosticos_docentes` son seguros para replay canonico porque estan condicionados al schema legacy.
- Los dos archivos de `feedback_institucional` alteran replay local creando una tabla nueva y policies; son compatibles sintacticamente, pero introducen superficie nueva.

## Decision global

La rama no esta lista como PR de reconciliacion ejecutable. Si el PR es estrictamente documental, puede avanzar con este review y sin aplicar acciones remotas. Para PR de migraciones activas, primero hay que decidir si `sos_auto_escalation` vuelve a `_wip`, se convierte en no-op historico o se reemplaza por una migracion segura nueva.

## Validaciones ejecutadas

- `./scripts/audit-migrations.sh`: pasa sin errores criticos. Mantiene advertencias heredadas, incluido `DROP TABLE public.audit_log CASCADE` en `20260410120000_supabase_final_polish.sql` y multiples alertas de RLS del parser simple.
- `supabase db lint --local`: exit code 0, pero reporta errores existentes fuera de alcance en funciones Feria que referencian `public.progreso_recorrido` inexistente: `public.internal_feria_registrar_progreso`, `public.internal_feria_finalizar_trivia`, `public.internal_feria_get_progress`.
- `pnpm type-check`: pasa.

No ejecutar validaciones remotas adicionales si el pooler vuelve a responder con `ECIRCUITBREAKER`.
