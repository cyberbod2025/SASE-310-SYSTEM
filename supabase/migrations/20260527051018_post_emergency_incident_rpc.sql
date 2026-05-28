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
  v_is_creator boolean := false;
  v_is_emergency_requester boolean := false;
  v_is_emergency_staff boolean := false;
  v_can_audit boolean := false;
  v_profile_exists boolean := false;
  v_profile_name text;
  v_profile_role_text text;
  v_profile_role public.app_role := 'docente'::public.app_role;
  v_allowed_roles text[] := array[
    'docente',
    'docente_tutor',
    'directivo',
    'subdireccion',
    'prefectura',
    'medico_escolar',
    'orientacion',
    'trabajo_social',
    'developer',
    'system_admin',
    'admin'
  ];
begin
  if v_actor_id is null then
    raise exception 'Usuario no autenticado' using errcode = '28000';
  end if;

  v_role := lower(btrim(coalesce(public.get_my_role_text(), '')));
  v_is_emergency_requester := private.is_emergency_requester(v_actor_id);

  -- Developer queda permitido solo en este flujo de emergencia porque los
  -- helpers institucionales lo consideran operador activo de emergencia.
  if not (v_role = any(v_allowed_roles) and v_is_emergency_requester) then
    raise exception 'Rol no autorizado para registrar incidencia post-emergencia' using errcode = '42501';
  end if;

  select exists(select 1 from public.profiles where id = v_actor_id)
  into v_profile_exists;

  if not v_profile_exists then
    select
      p.nombre_completo,
      lower(btrim(coalesce(p.rol, p.role, 'docente')))
    into v_profile_name, v_profile_role_text
    from public.perfiles_usuario p
    where p.id = v_actor_id
    limit 1;

    if v_profile_role_text is null then
      raise exception 'Perfil institucional no encontrado para reportado_por' using errcode = '23503';
    end if;

    -- public.profiles es compatibilidad legacy y su enum no incluye developer.
    -- El rol vigente se mantiene en perfiles_usuario; la fila legacy solo
    -- evita que la FK de incidencias falle al guardar reportado_por.
    v_profile_role := case v_profile_role_text
      when 'directivo' then 'directivo'::public.app_role
      when 'docente' then 'docente'::public.app_role
      when 'docente_tutor' then 'docente_tutor'::public.app_role
      when 'prefectura' then 'prefectura'::public.app_role
      when 'orientacion' then 'orientacion'::public.app_role
      when 'trabajo_social' then 'trabajo_social'::public.app_role
      when 'enfermeria' then 'enfermeria'::public.app_role
      when 'medico_escolar' then 'medico_escolar'::public.app_role
      when 'secretaria' then 'secretaria'::public.app_role
      when 'udeii' then 'udeii'::public.app_role
      when 'promotora_lectura' then 'promotora_lectura'::public.app_role
      when 'subdireccion' then 'subdireccion'::public.app_role
      when 'admin' then 'admin'::public.app_role
      when 'system_admin' then 'system_admin'::public.app_role
      when 'developer' then 'system_admin'::public.app_role
      else 'docente'::public.app_role
    end;

    insert into public.profiles (id, full_name, role)
    values (v_actor_id, nullif(v_profile_name, ''), v_profile_role)
    on conflict (id) do nothing;
  end if;

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

  v_is_creator := v_alerta.docente_id is not distinct from v_actor_id;
  v_is_emergency_staff := private.is_emergency_staff(v_actor_id);

  if not (v_is_creator or v_is_emergency_staff) then
    raise exception 'Rol no autorizado para registrar incidencia post-emergencia' using errcode = '42501';
  end if;

  select exists(select 1 from public.alumnos where id = p_alumno_id)
  into v_alumno_existe;

  if not v_alumno_existe then
    raise exception 'Alumno no encontrado' using errcode = '23503';
  end if;

  select coalesce(lower(to_jsonb(a)->>'estado'), 'activo') not in ('baja', 'inactivo', 'egresado')
  into v_alumno_activo
  from public.alumnos a
  where a.id = p_alumno_id;

  if not coalesce(v_alumno_activo, false) then
    raise exception 'Alumno no activo' using errcode = '23503';
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

  -- Auditoria best-effort: una diferencia de esquema no debe revertir la incidencia.
  begin
    select to_regclass('public.auditoria') is not null
      and exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'auditoria' and column_name = 'usuario_id'
      )
      and exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'auditoria' and column_name = 'rol_usuario'
      )
      and exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'auditoria' and column_name = 'tipo_accion'
      )
      and exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'auditoria' and column_name = 'descripcion_accion'
      )
      and exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'auditoria' and column_name = 'tabla_objetivo'
      )
      and exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'auditoria' and column_name = 'id_registro_objetivo'
      )
      and exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'auditoria' and column_name = 'new_values'
      )
    into v_can_audit;

    if v_can_audit then
      execute $audit$
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
          $1,
          $2,
          'CREACION',
          'Incidencia registrada desde flujo post_emergencia',
          'incidencias',
          $3::text,
          jsonb_build_object(
            'origen', 'post_emergencia',
            'alerta_id', $4,
            'alumno_id', $5,
            'incidencia_id', $3,
            'usuario_id', $1,
            'rol', $2,
            'timestamp', now()
          )
        )
      $audit$
      using v_actor_id, v_role, v_incidencia_id, p_alerta_id, p_alumno_id;
    else
      raise notice 'Auditoria post_emergencia omitida por estructura no compatible';
    end if;
  exception
    when others then
      raise notice 'Auditoria post_emergencia omitida por error interno';
  end;

  return query select true, v_incidencia_id;
end;
$$;

revoke all on function public.registrar_incidencia_post_emergencia(uuid, uuid, text, text) from public;
revoke all on function public.registrar_incidencia_post_emergencia(uuid, uuid, text, text) from anon;
grant execute on function public.registrar_incidencia_post_emergencia(uuid, uuid, text, text) to authenticated;
