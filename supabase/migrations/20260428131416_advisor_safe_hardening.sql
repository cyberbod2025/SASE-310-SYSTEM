-- Advisor safe hardening 2026-04-28
-- Objetivo: cerrar hallazgos de Supabase Security Advisor sin romper flujos activos.

-- -----------------------------------------------------------------------------
-- 1. search_path fijo para funciones reportadas como mutable.
-- -----------------------------------------------------------------------------
alter function public.checar_patron_incidencias() set search_path = public, auth;
alter function public.fn_automatic_audit_trigger() set search_path = public, auth;
alter function public.fn_sync_semaphore_states() set search_path = public;
alter function public.is_staff() set search_path = public, auth;
alter function public.log_audit(text, text, text, uuid, text, jsonb, jsonb) set search_path = public, auth;
alter function public.log_event(text, text, text, jsonb) set search_path = public, auth;

-- -----------------------------------------------------------------------------
-- 2. INSERT policies demasiado permisivas.
-- Las escrituras operativas quedan pasando por log_event()/triggers SECURITY DEFINER.
-- -----------------------------------------------------------------------------
drop policy if exists "Audit logs are insertable by authenticated users" on public.audit_logs;
drop policy if exists "Alerts are insertable by authenticated users" on public.sase_alerts;
drop policy if exists "Simulation users can insert logs" on public.smoke_test_logs;

-- -----------------------------------------------------------------------------
-- 3. Storage queda fuera de esta migración porque el rol remoto del MCP no es
-- owner de storage.objects. Aplicar el bloque de Storage desde Dashboard SQL si
-- se quiere cerrar public_bucket_allows_listing en el entorno hospedado.

-- -----------------------------------------------------------------------------
-- 4. SECURITY DEFINER: quitar superficie pública/anónima.
-- -----------------------------------------------------------------------------
alter default privileges in schema public revoke execute on functions from anon, authenticated, public;

revoke execute on function public.audit_solicitud_personal() from anon, authenticated, public;
revoke execute on function public.calcular_deriva(uuid) from anon, authenticated, public;
revoke execute on function public.calculate_student_risk(uuid) from anon, authenticated, public;
revoke execute on function public.checar_patron_incidencias() from anon, authenticated, public;
revoke execute on function public.fn_automatic_audit_trigger() from anon, authenticated, public;
revoke execute on function public.handle_anomaly_response(text, text, jsonb) from anon, authenticated, public;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.handle_new_user_v3() from anon, authenticated, public;
revoke execute on function public.log_audit(text, text, text, uuid, text, jsonb, jsonb) from anon, authenticated, public;
revoke execute on function public.log_expediente_access() from anon, authenticated, public;
revoke execute on function public.log_semaphore_change() from anon, authenticated, public;
revoke execute on function public.registrar_behavior_metric(uuid) from anon, authenticated, public;
revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
revoke execute on function public.sandbox_detectar_patron() from anon, authenticated, public;
revoke execute on function public.sync_alumno_grupo_desde_ciclo() from anon, authenticated, public;
revoke execute on function public.trigger_update_behavior_drift_from_expediente() from anon, authenticated, public;
revoke execute on function public.trigger_update_behavior_drift_from_incidencia() from anon, authenticated, public;
revoke execute on function public.trigger_update_student_risk() from anon, authenticated, public;

-- RPCs/helpers usados por UI, RLS o módulos externos: se cierra anon/public,
-- pero se conserva authenticated para evitar regresión funcional.
revoke execute on function public.decrement_visitantes(uuid) from anon, public;
revoke execute on function public.ejecutar_promocion(uuid, uuid) from anon, public;
revoke execute on function public.finalizar_trivia_v2(uuid, uuid, integer) from anon, public;
revoke execute on function public.get_modulos_ecosistema_visibles() from anon, public;
revoke execute on function public.get_my_normalized_email() from anon, public;
revoke execute on function public.get_my_rol_safe() from anon, public;
revoke execute on function public.get_my_role() from anon, public;
revoke execute on function public.get_my_role_text() from anon, public;
revoke execute on function public.get_user_role() from anon, public;
revoke execute on function public.increment_visitantes(uuid) from anon, public;
revoke execute on function public.is_staff() from anon, public;
revoke execute on function public.log_event(text, text, text, jsonb) from anon, public;
revoke execute on function public.registrar_progreso_v2(uuid, uuid, integer) from anon, public;
revoke execute on function public.simular_promocion(uuid) from anon, public;

grant execute on function public.decrement_visitantes(uuid) to authenticated;
grant execute on function public.ejecutar_promocion(uuid, uuid) to authenticated;
grant execute on function public.finalizar_trivia_v2(uuid, uuid, integer) to authenticated;
grant execute on function public.get_modulos_ecosistema_visibles() to authenticated;
grant execute on function public.get_my_normalized_email() to authenticated;
grant execute on function public.get_my_rol_safe() to authenticated;
grant execute on function public.get_my_role() to authenticated;
grant execute on function public.get_my_role_text() to authenticated;
grant execute on function public.get_user_role() to authenticated;
grant execute on function public.increment_visitantes(uuid) to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.log_event(text, text, text, jsonb) to authenticated;
grant execute on function public.registrar_progreso_v2(uuid, uuid, integer) to authenticated;
grant execute on function public.simular_promocion(uuid) to authenticated;
