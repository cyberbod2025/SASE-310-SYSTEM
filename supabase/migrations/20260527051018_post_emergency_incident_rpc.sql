-- RPC segura para registrar incidencias formales originadas desde una alerta
-- de emergencia. No modifica la policy general de INSERT en incidencias.

create or replace function public.registrar_incidencia_post_emergencia(
  p_alerta_id uuid,
  p_alumno_id uuid,
  p_tipo text,
  p_descripcion text
)
returns table(success boolean, incidencia_id uuid)
language plpgsql
security definer
set search_path to public, private
as $$
declare
  v_actor_id uuid := auth.uid();
  v_role text;
  v_descripcion text := btrim(coalesce(p_descripcion, ''));
  v_tipo_text text := lower(btrim(coalesce(p_tipo, '')));
  v_tipo public.tipo_incidencia;
  v_alerta public.alertas_emergencia%rowtype;
  v_incidencia_id uuid;
  v_alumno_existe boolean;
  v_alumno_activo boolean := true;
  v_has_estado_column boolean;
  v_allowed_roles text[] := array[
    'docente',
    'docente_tutor',
    'directivo',
    'subdireccion',
    'prefectura',
    'medico_escolar',
    'orientacion',
    'trabajo_social',
    'system_admin',
    'admin',
    'developer'
  ];
begin
  if v_actor_id is null then
    raise exception 'Usuario no autenticado' using errcode = '28000';
  end if;

  v_role := lower(btrim(coalesce(public.get_my_role_text(), '')));

  if v_descripcion = '' then
    raise exception 'La descripción no puede estar vacía' using errcode = '22023';
  end if;

  select *
  into v_alerta
  from public.alertas_emergencia
  where id = p_alerta_id;

  if not found then
    raise exception 'Alerta de emergencia no encontrada' using errcode = 'P0002';
  end if;

  if v_alerta.docente_id is distinct from v_actor_id
    and not (v_role = any(v_allowed_roles) and private.is_emergency_requester(v_actor_id))
  then
    raise exception 'Rol no autorizado para registrar incidencia post-emergencia' using errcode = '42501';
  end if;

  select exists(select 1 from public.alumnos where id = p_alumno_id)
  into v_alumno_existe;

  if not v_alumno_existe then
    raise exception 'Alumno no encontrado' using errcode = '23503';
  end if;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'alumnos'
      and column_name = 'estado'
  )
  into v_has_estado_column;

  if v_has_estado_column then
    execute $sql$
      select coalesce(lower(estado::text), 'activo') not in ('baja', 'inactivo', 'egresado')
      from public.alumnos
      where id = $1
    $sql$
    into v_alumno_activo
    using p_alumno_id;

    if not coalesce(v_alumno_activo, false) then
      raise exception 'Alumno no activo' using errcode = '23503';
    end if;
  end if;

  v_tipo := case
    when v_tipo_text in ('retardo') then 'retardo'::public.tipo_incidencia
    when v_tipo_text in ('conducta', 'observacion de convivencia', 'observación de convivencia') then 'conducta'::public.tipo_incidencia
    when v_tipo_text in ('uniforme', 'falta de uniforme') then 'uniforme'::public.tipo_incidencia
    when v_tipo_text in ('asistencia', 'asistencia / falta') then 'asistencia'::public.tipo_incidencia
    when v_tipo_text in ('academica', 'académica', 'observacion academica', 'observación académica') then 'academica'::public.tipo_incidencia
    when v_tipo_text in ('socioemocional', 'atencion socioemocional', 'atención socioemocional') then 'socioemocional'::public.tipo_incidencia
    when v_tipo_text in ('salud', 'atencion medica', 'atención médica') then 'salud'::public.tipo_incidencia
    when v_tipo_text in ('otro') then 'otro'::public.tipo_incidencia
    else null
  end;

  if v_tipo is null then
    begin
      v_tipo := v_tipo_text::public.tipo_incidencia;
    exception
      when invalid_text_representation then
        raise exception 'Tipo de incidencia inválido: %', p_tipo using errcode = '22P02';
    end;
  end if;

  insert into public.incidencias (
    alumno_id,
    tipo,
    descripcion,
    reportado_por,
    fecha
  )
  values (
    p_alumno_id,
    v_tipo,
    v_descripcion,
    v_actor_id,
    now()
  )
  returning id into v_incidencia_id;

  insert into public.auditoria (
    usuario_id,
    rol_usuario,
    tipo_accion,
    descripcion_accion,
    tabla_objetivo,
    id_registro_objetivo,
    new_values
  )
  values (
    v_actor_id,
    v_role,
    'CREACION',
    'Incidencia registrada desde flujo post_emergencia',
    'incidencias',
    v_incidencia_id::text,
    jsonb_build_object(
      'origen', 'post_emergencia',
      'alerta_id', p_alerta_id,
      'alumno_id', p_alumno_id,
      'incidencia_id', v_incidencia_id,
      'usuario_id', v_actor_id,
      'rol', v_role,
      'timestamp', now()
    )
  );

  return query select true, v_incidencia_id;
end;
$$;

revoke all on function public.registrar_incidencia_post_emergencia(uuid, uuid, text, text) from public;
revoke all on function public.registrar_incidencia_post_emergencia(uuid, uuid, text, text) from anon;
grant execute on function public.registrar_incidencia_post_emergencia(uuid, uuid, text, text) to authenticated;
