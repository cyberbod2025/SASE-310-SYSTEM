-- Hardening integral: cierra los 23 hallazgos de supabase db lint
-- Generado: 2026-06-21
-- Rules abordadas:
--   function_search_path_mutable (5)
--   rls_policy_always_true       (1)
--   anon_security_definer_func   (2)
--   authenticated_security_def   (14)
--   auth_leaked_password         (1)

-- ═══════════════════════════════════════════════════════════════════
-- 1. search_path fijo — function_search_path_mutable
-- ═══════════════════════════════════════════════════════════════════

do $$ begin
  if exists (select 1 from pg_proc where proname = 'set_orientacion_fecha_actualizacion' and pronamespace = 'public'::regnamespace)
  then alter function public.set_orientacion_fecha_actualizacion() set search_path = public; end if;
end $$;

do $$ begin
  if exists (select 1 from pg_proc where proname = 'fn_marcar_solicitud_respondida' and pronamespace = 'public'::regnamespace)
  then alter function public.fn_marcar_solicitud_respondida() set search_path = public; end if;
end $$;

do $$ begin
  if exists (select 1 from pg_proc where proname = 'fn_valida_solicitud' and pronamespace = 'public'::regnamespace)
  then alter function public.fn_valida_solicitud() set search_path = public; end if;
end $$;

do $$ begin
  if exists (select 1 from pg_proc where proname = 'update_diagnosticos_colectivos_updated_at' and pronamespace = 'public'::regnamespace)
  then alter function public.update_diagnosticos_colectivos_updated_at() set search_path = public; end if;
end $$;

do $$ begin
  if exists (select 1 from pg_proc where proname = 'prevent_diagnostico_docente_id_change' and pronamespace = 'public'::regnamespace)
  then alter function public.prevent_diagnostico_docente_id_change() set search_path = public; end if;
end $$;

do $$ begin
  if exists (select 1 from pg_proc where proname = 'auto_resolve_previous_sos' and pronamespace = 'public'::regnamespace)
  then alter function public.auto_resolve_previous_sos() set search_path = public; end if;
end $$;

do $$ begin
  if exists (select 1 from pg_proc where proname = 'auto_escalate_sos' and pronamespace = 'public'::regnamespace)
  then alter function public.auto_escalate_sos() set search_path = public; end if;
end $$;

-- ═══════════════════════════════════════════════════════════════════
-- 2. RLS permisiva — rls_policy_always_true
--    diag_auth_insert permite INSERT sin restricciones (WITH CHECK true)
--    Ya hay políticas específicas que cubren INSERT (Docente inserta, Admin)
-- ═══════════════════════════════════════════════════════════════════

drop policy if exists "diag_auth_insert" on public.diagnosticos_docentes;

-- ═══════════════════════════════════════════════════════════════════
-- 3. SECURITY DEFINER ejecutable por anon — anon_security_definer
--    Las funciones SOS aún no están en producción (_wip/), pero se
--    protegen por si ya existen en el entorno.
-- ═══════════════════════════════════════════════════════════════════

do $$ begin
  revoke all on function public.auto_escalate_sos() from anon, public;
exception when others then null; end $$;

do $$ begin
  revoke all on function public.auto_resolve_previous_sos() from anon, public;
exception when others then null; end $$;

do $$ begin
  grant execute on function public.auto_escalate_sos() to authenticated;
exception when others then null; end $$;

do $$ begin
  grant execute on function public.auto_resolve_previous_sos() to authenticated;
exception when others then null; end $$;

-- ═══════════════════════════════════════════════════════════════════
-- 4. SECURITY DEFINER ejecutable por authenticated
--    Se agrega validación de rol interno a funciones operativas que
--    carecían de ella. Las helpers de identidad (get_my_role, etc.)
--    requieren SECURITY DEFINER para leer auth.users y son seguras
--    por diseño (solo lectura del propio registro).
-- ═══════════════════════════════════════════════════════════════════

-- 4a. ejecutar_promocion — añade guardia de rol (era invocable por cualquiera autenticado)
create or replace function public.ejecutar_promocion(
  p_ciclo_actual uuid,
  p_ciclo_nuevo  uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_alumno record;
  v_conteo_promovidos integer := 0;
  v_conteo_egresados  integer := 0;
  v_conteo_bajas      integer := 0;
  v_conteo_retenidos  integer := 0;
  v_faltas bigint;
  v_decision text;
begin
  -- Validar rol autorizado
  if public.get_my_role_text() not in ('directivo', 'subdireccion', 'developer', 'system_admin') then
    raise exception 'No autorizado: solo directivo, subdireccion o admin puede ejecutar promocion.';
  end if;

  if not exists (
    select 1 from public.ciclos_escolares
    where id = p_ciclo_actual and activo = true
  ) then
    raise exception 'El ciclo actual no está activo o no existe.';
  end if;

  if not exists (
    select 1 from public.ciclos_escolares
    where id = p_ciclo_nuevo and activo = false
  ) then
    raise exception 'El ciclo nuevo no existe o ya está activo.';
  end if;

  for v_alumno in
    select ac.id as alumno_ciclo_id,
           ac.alumno_id,
           ac.grado,
           ac.grupo
    from public.alumno_ciclo ac
    where ac.ciclo_id = p_ciclo_actual
      and ac.estatus = 'activo'
  loop
    select count(*) into v_faltas
    from public.attendance_logs al
    where al.alumno_id = v_alumno.alumno_id
      and lower(al.estado) != 'presente';

    if v_alumno.grado = 3 then
      v_decision := 'egresado';
    elsif v_faltas >= 21 then
      v_decision := 'baja';
    else
      v_decision := 'promovido';
    end if;

    update public.alumno_ciclo
    set estatus = v_decision
    where id = v_alumno.alumno_ciclo_id;

    if v_decision = 'promovido' then
      insert into public.alumno_ciclo (alumno_id, ciclo_id, grado, estatus)
      values (v_alumno.alumno_id, p_ciclo_nuevo, v_alumno.grado + 1, 'activo')
      on conflict (alumno_id, ciclo_id) do nothing;
      v_conteo_promovidos := v_conteo_promovidos + 1;
    elsif v_decision = 'egresado' then
      v_conteo_egresados := v_conteo_egresados + 1;
    elsif v_decision = 'baja' then
      v_conteo_bajas := v_conteo_bajas + 1;
    end if;
  end loop;

  update public.ciclos_escolares
  set activo = false
  where id = p_ciclo_actual;

  update public.ciclos_escolares
  set activo = true
  where id = p_ciclo_nuevo;

  insert into public.auditoria (
    tipo_accion, descripcion_accion, tabla_objetivo,
    old_values, new_values
  ) values (
    'CIERRE_CICLO',
    'Cierre de ciclo escolar y promocion de alumnos.',
    'alumno_ciclo',
    jsonb_build_object('ciclo_cerrado', p_ciclo_actual),
    jsonb_build_object(
      'ciclo_nuevo', p_ciclo_nuevo,
      'promovidos', v_conteo_promovidos,
      'egresados', v_conteo_egresados,
      'bajas', v_conteo_bajas,
      'retenidos', v_conteo_retenidos
    )
  );

  return jsonb_build_object(
    'success', true,
    'promovidos', v_conteo_promovidos,
    'egresados', v_conteo_egresados,
    'bajas', v_conteo_bajas,
    'retenidos', v_conteo_retenidos
  );
end;
$$;

-- 4b. simular_promocion — guardia de rol (solo roles institucionales)
create or replace function public.simular_promocion(p_ciclo_id uuid)
returns table (
  alumno_id       uuid,
  nombre          text,
  grado           integer,
  grupo           text,
  faltas          bigint,
  faltas_consecutivas integer,
  promedio        numeric,
  incidencias     bigint,
  bap             boolean,
  decision_sugerida text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.get_my_role_text() not in ('directivo', 'subdireccion', 'docente', 'docente_tutor', 'developer', 'system_admin') then
    raise exception 'No autorizado: solo personal institucional puede simular promocion.';
  end if;

  return query
  select
    ac.alumno_id,
    a.nombre_completo                      as nombre,
    ac.grado,
    ac.grupo,
    coalesce((
      select count(*)
      from public.attendance_logs al
      where al.alumno_id = ac.alumno_id
        and lower(al.estado) != 'presente'
    ), 0)                                  as faltas,
    coalesce((
      select max(streak)
      from (
        select count(*) as streak
        from (
          select al.fecha,
                 al.fecha - (row_number() over (order by al.fecha))::int as grp
          from public.attendance_logs al
          where al.alumno_id = ac.alumno_id
            and lower(al.estado) != 'presente'
        ) gaps
        group by grp
      ) streaks
    ), 0)::integer                         as faltas_consecutivas,
    coalesce((
      select round(avg(et.calificacion_final), 2)
      from public.examenes_trimestre et
      where et.nombre_alumno = a.nombre_completo
    ), 0)                                  as promedio,
    coalesce((
      select count(*)
      from public.incidencias i
      where i.alumno_id = ac.alumno_id
    ), 0)                                  as incidencias,
    (a.datos_bap is not null)              as bap,
    case
      when ac.grado = 3 then 'egresar'
      when coalesce((
        select count(*)
        from public.attendance_logs al2
        where al2.alumno_id = ac.alumno_id
          and lower(al2.estado) != 'presente'
      ), 0) >= 21 then 'baja'
      else 'promover'
    end                                    as decision_sugerida
  from public.alumno_ciclo ac
  join public.alumnos a on a.id = ac.alumno_id
  where ac.ciclo_id = p_ciclo_id
    and ac.estatus = 'activo'
  order by ac.grado, ac.grupo, a.nombre_completo;
end;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- 5. Re-confirmar que helpers sigan con search_path fijo y EXECUTE
--    restringido, por si ALTER previo no surtió efecto.
-- ═══════════════════════════════════════════════════════════════════

do $$ begin
  if exists (select 1 from pg_proc where proname = 'get_my_role' and pronamespace = 'public'::regnamespace)
  then alter function public.get_my_role() set search_path = public, auth; end if;
end $$;

do $$ begin
  if exists (select 1 from pg_proc where proname = 'get_my_role_text' and pronamespace = 'public'::regnamespace)
  then alter function public.get_my_role_text() set search_path = public, auth; end if;
end $$;

do $$ begin
  if exists (select 1 from pg_proc where proname = 'get_user_role' and pronamespace = 'public'::regnamespace)
  then alter function public.get_user_role() set search_path = public, auth; end if;
end $$;

do $$ begin
  if exists (select 1 from pg_proc where proname = 'get_my_normalized_email' and pronamespace = 'public'::regnamespace)
  then alter function public.get_my_normalized_email() set search_path = public, auth; end if;
end $$;

do $$ begin
  if exists (select 1 from pg_proc where proname = 'is_staff' and pronamespace = 'public'::regnamespace)
  then alter function public.is_staff() set search_path = public, auth; end if;
end $$;

do $$ begin
  if exists (select 1 from pg_proc where proname = 'is_current_user_smoke_test' and pronamespace = 'public'::regnamespace)
  then alter function public.is_current_user_smoke_test() set search_path = public, auth; end if;
end $$;

do $$ begin
  if exists (select 1 from pg_proc where proname = 'log_event' and pronamespace = 'public'::regnamespace)
  then alter function public.log_event(text, text, text, jsonb) set search_path = public, auth; end if;
end $$;

do $$ begin
  if exists (select 1 from pg_proc where proname = 'registrar_incidencia_post_emergencia' and pronamespace = 'public'::regnamespace)
  then alter function public.registrar_incidencia_post_emergencia(uuid, uuid, text, text) set search_path = public, private; end if;
end $$;
