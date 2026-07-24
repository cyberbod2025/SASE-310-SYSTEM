-- Canalización trazable de Prefectura a la bandeja persistente de Orientación.
-- No crea incidencias ni concede acceso directo a tablas de Orientación.

create or replace function public.referir_caso_orientacion(
  p_alumno_id uuid,
  p_motivo text,
  p_resumen text default null,
  p_prioridad text default 'media'
)
returns table (
  caso_id uuid,
  responsable_id uuid,
  responsable_nombre text,
  caso_existente boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_actor_role text;
  v_motivo text := nullif(btrim(coalesce(p_motivo, '')), '');
  v_prioridad text := lower(btrim(coalesce(p_prioridad, 'media')));
  v_caso_id uuid;
  v_responsable_id uuid;
  v_responsable_nombre text;
  v_caso_existente boolean := false;
begin
  if v_actor is null
    or not (select private.is_institutional_actor(array[
      'prefectura',
      'system_admin'
    ]::text[]))
  then
    raise exception 'El rol institucional no puede canalizar a Orientación.'
      using errcode = '42501';
  end if;

  if v_motivo is null then
    raise exception 'El motivo de canalización es obligatorio.'
      using errcode = '22023';
  end if;

  if v_prioridad not in ('baja', 'media', 'alta', 'critica') then
    raise exception 'La prioridad de canalización no es válida.'
      using errcode = '22023';
  end if;

  perform 1
  from public.alumnos as a
  where a.id = p_alumno_id
  for update;

  if not found then
    raise exception 'El alumno no existe.'
      using errcode = '23503';
  end if;

  select lower(btrim(p.rol))
  into v_actor_role
  from public.perfiles_usuario as p
  where p.id = v_actor;

  select c.id, c.responsable_id
  into v_caso_id, v_responsable_id
  from public.orientacion_casos as c
  where c.alumno_id = p_alumno_id
    and c.estado <> 'cerrado'
  order by c.fecha_actualizacion desc, c.id
  limit 1;

  v_caso_existente := found;

  if v_responsable_id is null
    or not exists (
      select 1
      from public.perfiles_usuario as assigned
      where assigned.id = v_responsable_id
        and lower(btrim(assigned.rol)) = 'orientacion'
        and assigned.estado_cuenta = 'activo'
        and assigned.seguridad_status = 'active'
    )
  then
    select p.id, p.nombre_completo
    into v_responsable_id, v_responsable_nombre
    from public.perfiles_usuario as p
    where lower(btrim(p.rol)) = 'orientacion'
      and p.estado_cuenta = 'activo'
      and p.seguridad_status = 'active'
    order by (
      select count(*)
      from public.orientacion_casos as active_case
      where active_case.responsable_id = p.id
        and active_case.estado <> 'cerrado'
    ), p.id
    limit 1;

    if v_responsable_id is null then
      raise exception 'No existe una cuenta activa de Orientación para asignar el caso.'
        using errcode = 'P0002';
    end if;
  else
    select p.nombre_completo
    into v_responsable_nombre
    from public.perfiles_usuario as p
    where p.id = v_responsable_id;
  end if;

  if v_caso_existente then
    update public.orientacion_casos as c
    set responsable_id = v_responsable_id
    where c.id = v_caso_id;

    insert into public.seguimiento_orientacion (
      caso_id,
      tipo,
      descripcion,
      created_by
    ) values (
      v_caso_id,
      'derivacion',
      'Referencia adicional de Prefectura: ' || v_motivo,
      v_actor
    );
  else
    insert into public.orientacion_casos (
      alumno_id,
      creado_por,
      responsable_id,
      estado,
      prioridad,
      motivo,
      resumen
    ) values (
      p_alumno_id,
      v_actor,
      v_responsable_id,
      'recibido',
      v_prioridad,
      v_motivo,
      nullif(btrim(coalesce(p_resumen, '')), '')
    )
    returning id into v_caso_id;
  end if;

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
    v_actor,
    (select auth.jwt() ->> 'email'),
    v_actor_role,
    'PREFECTURA_CANALIZA_ORIENTACION',
    case
      when v_caso_existente
        then 'Prefectura agregó una referencia a un caso abierto de Orientación.'
      else 'Prefectura abrió y asignó una referencia a Orientación.'
    end,
    'orientacion_casos',
    v_caso_id::text,
    jsonb_build_object(
      'alumno_id', p_alumno_id,
      'responsable_id', v_responsable_id,
      'prioridad', v_prioridad,
      'caso_existente', v_caso_existente
    )
  );

  return query
  select
    v_caso_id,
    v_responsable_id,
    v_responsable_nombre,
    v_caso_existente;
end;
$$;

revoke all on function public.referir_caso_orientacion(
  uuid,
  text,
  text,
  text
) from public, anon, authenticated;

grant execute on function public.referir_caso_orientacion(
  uuid,
  text,
  text,
  text
) to authenticated;

comment on function public.referir_caso_orientacion(
  uuid,
  text,
  text,
  text
) is
  'Canaliza desde Prefectura a un caso abierto o nuevo de Orientación y asigna una cuenta activa.';
