-- Hardening de Feria: capa interna para Edge Functions.
-- Importante: esta migracion NO revoca los RPC publicos legacy.
-- La revocacion se prepara en supabase/sql/feria_rpc_revoke_after_edge_cutover.sql
-- y debe ejecutarse solo cuando el frontend de Feria consuma Edge Functions.

create table if not exists public.feria_student_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  estudiante_id uuid not null references public.estudiantes(id) on delete cascade,
  alumno_id uuid null references public.alumnos(id) on delete set null,
  issued_by_user_id uuid null,
  issued_by_email text null,
  issued_by_role text null,
  group_id text null,
  expires_at timestamptz not null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz null,
  metadata jsonb not null default '{}'::jsonb,
  constraint feria_student_sessions_expires_after_created
    check (expires_at > created_at)
);

comment on table public.feria_student_sessions is
  'Sesiones opacas para Feria. Solo Edge Functions deben generar y validar tokens; no se guardan tokens en claro.';

alter table public.feria_student_sessions enable row level security;

drop policy if exists "No direct client access to feria sessions" on public.feria_student_sessions;

revoke all on table public.feria_student_sessions from anon, authenticated, public;
grant all on table public.feria_student_sessions to service_role;

create index if not exists idx_feria_student_sessions_token_hash
  on public.feria_student_sessions (token_hash);

create index if not exists idx_feria_student_sessions_estudiante_active
  on public.feria_student_sessions (estudiante_id, expires_at)
  where revoked_at is null;

create or replace function public.internal_feria_assert_session(
  p_session_id uuid,
  p_estudiante_id uuid
)
returns public.feria_student_sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.feria_student_sessions;
begin
  select *
  into v_session
  from public.feria_student_sessions
  where id = p_session_id
    and estudiante_id = p_estudiante_id
    and revoked_at is null
    and expires_at > now();

  if not found then
    raise exception 'Sesion de Feria invalida o expirada.' using errcode = '28000';
  end if;

  return v_session;
end;
$$;

create or replace function public.internal_feria_registrar_progreso(
  p_session_id uuid,
  p_estudiante_id uuid,
  p_estacion_id uuid,
  p_puntos_ganados integer,
  p_request_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.feria_student_sessions;
  v_existing boolean;
  v_points integer;
begin
  v_session := public.internal_feria_assert_session(p_session_id, p_estudiante_id);
  v_points := greatest(0, least(coalesce(p_puntos_ganados, 0), 100));

  select exists (
    select 1
    from public.progreso_recorrido
    where estudiante_id = p_estudiante_id
      and estacion_id = p_estacion_id
  ) into v_existing;

  insert into public.progreso_recorrido (estudiante_id, estacion_id, puntos_ganados)
  values (p_estudiante_id, p_estacion_id, v_points)
  on conflict (estudiante_id, estacion_id)
  do update set puntos_ganados = greatest(
    coalesce(public.progreso_recorrido.puntos_ganados, 0),
    excluded.puntos_ganados
  );

  if not v_existing then
    update public.estaciones
    set visitantes_activos = visitantes_activos + 1
    where id = p_estacion_id;

    update public.estudiantes
    set escaneos_realizados = coalesce(escaneos_realizados, 0) + 1
    where id = p_estudiante_id;
  end if;

  update public.feria_student_sessions
  set last_seen_at = now()
  where id = p_session_id;

  insert into public.auditoria (
    usuario_id,
    email_usuario,
    rol_usuario,
    tipo_accion,
    descripcion_accion,
    tabla_objetivo,
    id_registro_objetivo,
    new_values
  ) values (
    v_session.issued_by_user_id,
    v_session.issued_by_email,
    coalesce(v_session.issued_by_role, 'feria'),
    'FERIA_PROGRESS',
    'Registro de avance de estudiante en Feria mediante Edge Function.',
    'progreso_recorrido',
    p_estacion_id::text,
    jsonb_build_object(
      'session_id', p_session_id,
      'estudiante_id', p_estudiante_id,
      'estacion_id', p_estacion_id,
      'puntos_ganados', v_points,
      'duplicate', v_existing,
      'request_id', nullif(p_request_id, '')
    )
  );

  return jsonb_build_object(
    'success', true,
    'duplicate', v_existing,
    'estudiante_id', p_estudiante_id,
    'estacion_id', p_estacion_id,
    'puntos_ganados', v_points
  );
end;
$$;

create or replace function public.internal_feria_finalizar_trivia(
  p_session_id uuid,
  p_estudiante_id uuid,
  p_estacion_id uuid,
  p_puntos_adicionales integer,
  p_answer_hash text default null,
  p_request_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.feria_student_sessions;
  v_already_completed boolean;
  v_points integer;
begin
  v_session := public.internal_feria_assert_session(p_session_id, p_estudiante_id);
  v_points := greatest(0, least(coalesce(p_puntos_adicionales, 0), 100));

  select exists (
    select 1
    from public.progreso_recorrido
    where estudiante_id = p_estudiante_id
      and estacion_id = p_estacion_id
      and completado_at is not null
  ) into v_already_completed;

  if v_already_completed then
    insert into public.auditoria (
      usuario_id,
      email_usuario,
      rol_usuario,
      tipo_accion,
      descripcion_accion,
      tabla_objetivo,
      id_registro_objetivo,
      new_values
    ) values (
      v_session.issued_by_user_id,
      v_session.issued_by_email,
      coalesce(v_session.issued_by_role, 'feria'),
      'FERIA_TRIVIA_DUPLICATE',
      'Intento duplicado de cierre de trivia bloqueado.',
      'progreso_recorrido',
      p_estacion_id::text,
      jsonb_build_object(
        'session_id', p_session_id,
        'estudiante_id', p_estudiante_id,
        'estacion_id', p_estacion_id,
        'request_id', nullif(p_request_id, '')
      )
    );

    return jsonb_build_object(
      'success', true,
      'duplicate', true,
      'estudiante_id', p_estudiante_id,
      'estacion_id', p_estacion_id,
      'puntos_adicionales', 0
    );
  end if;

  insert into public.progreso_recorrido (
    estudiante_id,
    estacion_id,
    puntos_ganados,
    trivia_respondida_correctamente,
    completado_at
  ) values (
    p_estudiante_id,
    p_estacion_id,
    v_points,
    v_points > 0,
    now()
  )
  on conflict (estudiante_id, estacion_id)
  do update set
    trivia_respondida_correctamente = excluded.trivia_respondida_correctamente,
    puntos_ganados = greatest(coalesce(public.progreso_recorrido.puntos_ganados, 0), excluded.puntos_ganados),
    completado_at = coalesce(public.progreso_recorrido.completado_at, now());

  if v_points > 0 then
    update public.estudiantes
    set total_puntos = coalesce(total_puntos, 0) + v_points
    where id = p_estudiante_id;
  end if;

  update public.estaciones
  set visitantes_activos = case when visitantes_activos > 0 then visitantes_activos - 1 else 0 end
  where id = p_estacion_id;

  update public.feria_student_sessions
  set last_seen_at = now()
  where id = p_session_id;

  insert into public.auditoria (
    usuario_id,
    email_usuario,
    rol_usuario,
    tipo_accion,
    descripcion_accion,
    tabla_objetivo,
    id_registro_objetivo,
    new_values
  ) values (
    v_session.issued_by_user_id,
    v_session.issued_by_email,
    coalesce(v_session.issued_by_role, 'feria'),
    'FERIA_TRIVIA_FINISH',
    'Cierre de trivia de estudiante en Feria mediante Edge Function.',
    'progreso_recorrido',
    p_estacion_id::text,
    jsonb_build_object(
      'session_id', p_session_id,
      'estudiante_id', p_estudiante_id,
      'estacion_id', p_estacion_id,
      'puntos_adicionales', v_points,
      'answer_hash', nullif(p_answer_hash, ''),
      'request_id', nullif(p_request_id, '')
    )
  );

  return jsonb_build_object(
    'success', true,
    'duplicate', false,
    'estudiante_id', p_estudiante_id,
    'estacion_id', p_estacion_id,
    'puntos_adicionales', v_points
  );
end;
$$;

create or replace function public.internal_feria_get_progress(
  p_session_id uuid,
  p_estudiante_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.feria_student_sessions;
  v_progress jsonb;
  v_student jsonb;
begin
  v_session := public.internal_feria_assert_session(p_session_id, p_estudiante_id);

  select jsonb_build_object(
    'id', e.id,
    'nickname', e.nickname,
    'grado', e.grado,
    'total_puntos', coalesce(e.total_puntos, 0),
    'escaneos_realizados', coalesce(e.escaneos_realizados, 0),
    'alumno_id', e.alumno_id
  )
  into v_student
  from public.estudiantes e
  where e.id = p_estudiante_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'estacion_id', pr.estacion_id,
    'puntos_ganados', coalesce(pr.puntos_ganados, 0),
    'trivia_respondida_correctamente', pr.trivia_respondida_correctamente,
    'completado_at', pr.completado_at
  ) order by pr.completado_at nulls last), '[]'::jsonb)
  into v_progress
  from public.progreso_recorrido pr
  where pr.estudiante_id = p_estudiante_id;

  update public.feria_student_sessions
  set last_seen_at = now()
  where id = p_session_id;

  insert into public.auditoria (
    usuario_id,
    email_usuario,
    rol_usuario,
    tipo_accion,
    descripcion_accion,
    tabla_objetivo,
    id_registro_objetivo,
    new_values
  ) values (
    v_session.issued_by_user_id,
    v_session.issued_by_email,
    coalesce(v_session.issued_by_role, 'feria'),
    'FERIA_PROGRESS_GET',
    'Consulta de progreso de Feria mediante Edge Function.',
    'progreso_recorrido',
    p_estudiante_id::text,
    jsonb_build_object('session_id', p_session_id, 'estudiante_id', p_estudiante_id)
  );

  return jsonb_build_object(
    'success', true,
    'student', v_student,
    'progress', v_progress
  );
end;
$$;

revoke execute on function public.internal_feria_assert_session(uuid, uuid) from anon, authenticated, public;
revoke execute on function public.internal_feria_registrar_progreso(uuid, uuid, uuid, integer, text) from anon, authenticated, public;
revoke execute on function public.internal_feria_finalizar_trivia(uuid, uuid, uuid, integer, text, text) from anon, authenticated, public;
revoke execute on function public.internal_feria_get_progress(uuid, uuid) from anon, authenticated, public;

grant execute on function public.internal_feria_assert_session(uuid, uuid) to service_role;
grant execute on function public.internal_feria_registrar_progreso(uuid, uuid, uuid, integer, text) to service_role;
grant execute on function public.internal_feria_finalizar_trivia(uuid, uuid, uuid, integer, text, text) to service_role;
grant execute on function public.internal_feria_get_progress(uuid, uuid) to service_role;

insert into public.auditoria (
  tipo_accion,
  descripcion_accion,
  tabla_objetivo,
  new_values
) values (
  'MIGRACION_SEGURIDAD',
  'Feria: capa Edge segura con sesiones opacas y funciones internas sin revocar RPCs legacy.',
  'feria_student_sessions',
  jsonb_build_object(
    'legacy_rpc_revoked', false,
    'edge_functions', jsonb_build_array(
      'student-login',
      'student-progress',
      'student-finish-trivia',
      'student-progress-get'
    )
  )
);
