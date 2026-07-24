-- SASE-310: Caja Negra institucional.
-- El Data API no consulta ni muta public.auditoria directamente.
-- Las RPC derivan la identidad del actor desde auth.uid() + perfiles_usuario.

alter table public.auditoria
  add column if not exists proposito text,
  add column if not exists alumno_id uuid,
  add column if not exists origen text not null default 'sistema';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'auditoria_proposito_longitud_check'
      and conrelid = 'public.auditoria'::regclass
  ) then
    alter table public.auditoria
      add constraint auditoria_proposito_longitud_check
      check (
        proposito is null
        or char_length(btrim(proposito)) between 5 and 240
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'auditoria_origen_check'
      and conrelid = 'public.auditoria'::regclass
  ) then
    alter table public.auditoria
      add constraint auditoria_origen_check
      check (
        origen in (
          'cliente_seguro',
          'rpc_institucional',
          'trigger',
          'servidor',
          'migracion',
          'sistema'
        )
      );
  end if;
end;
$$;

create index if not exists idx_auditoria_fecha_id_desc
  on public.auditoria (fecha desc, id desc);

create index if not exists idx_auditoria_rol_fecha
  on public.auditoria (rol_usuario, fecha desc);

create index if not exists idx_auditoria_tabla_fecha
  on public.auditoria (tabla_objetivo, fecha desc);

create index if not exists idx_auditoria_alumno_fecha
  on public.auditoria (alumno_id, fecha desc)
  where alumno_id is not null;

-- Conserva accesos sensibles legados, marcando su rol como no verificado
-- porque esa columna era enviada por el cliente.
insert into public.auditoria (
  usuario_id,
  email_usuario,
  rol_usuario,
  tipo_accion,
  descripcion_accion,
  tabla_objetivo,
  id_registro_objetivo,
  proposito,
  alumno_id,
  origen,
  fecha
)
select
  aa.usuario,
  coalesce(u.email, 'SYSTEM'),
  'legacy_no_verificado:' || left(coalesce(aa.rol, 'sin_rol'), 50),
  'ACCESO_LEGACY_' || left(
    regexp_replace(
      upper(coalesce(aa.accion, 'SIN_ACCION')),
      '[^A-Z0-9]+',
      '_',
      'g'
    ),
    60
  ),
  left(
    format(
      'Acceso sensible legado: %s desde %s.',
      coalesce(aa.accion, 'sin acción'),
      coalesce(aa.pantalla, 'pantalla no documentada')
    ),
    1000
  ),
  'auditoria_accesos',
  'auditoria_accesos:' || aa.id::text,
  'Conservación de un acceso sensible legado; rol original no verificado',
  case
    when aa.alumno_id ~*
      '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      then aa.alumno_id::uuid
    else null
  end,
  'migracion',
  aa.created_at
from public.auditoria_accesos as aa
left join auth.users as u
  on u.id = aa.usuario
where not exists (
  select 1
  from public.auditoria as existing
  where existing.id_registro_objetivo =
    'auditoria_accesos:' || aa.id::text
);

create or replace function private.categoria_evento_auditoria(
  p_tipo_accion text
)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when upper(coalesce(p_tipo_accion, '')) ~
      '(CONSULTA|ACCESO|LECTURA|VISUALIZACION|EXPORTACION)'
      then 'CONSULTA'
    when upper(coalesce(p_tipo_accion, '')) ~
      '(CREACION|INSERT|ALTA|APROBACION|REGISTRO|APERTURA)'
      then 'CREACION'
    when upper(coalesce(p_tipo_accion, '')) ~
      '(ACTUALIZACION|UPDATE|CAMBIO|CIERRE|RECHAZO|ESCALAMIENTO)'
      then 'ACTUALIZACION'
    when upper(coalesce(p_tipo_accion, '')) ~
      '(ELIMINACION|DELETE|BAJA)'
      then 'ELIMINACION'
    else 'OTRA'
  end;
$$;

revoke all on function private.categoria_evento_auditoria(text)
  from public, anon, authenticated;

create or replace function public.registrar_evento_auditoria(
  p_tipo_accion text,
  p_descripcion text,
  p_tabla_objetivo text,
  p_id_registro_objetivo text,
  p_proposito text,
  p_alumno_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_actor_email text;
  v_actor_role text;
  v_audit_id uuid;
begin
  if v_actor_id is null then
    raise exception 'Se requiere una sesión institucional para registrar auditoría.'
      using errcode = '42501';
  end if;

  select
    lower(btrim(p.rol)),
    coalesce(
      nullif(btrim(p.email), ''),
      (
        select u.email
        from auth.users as u
        where u.id = v_actor_id
      )
    )
  into v_actor_role, v_actor_email
  from public.perfiles_usuario as p
  where p.id = v_actor_id
    and p.estado_cuenta = 'activo'
    and p.seguridad_status = 'active'
    and lower(btrim(p.rol)) = any (array[
      'directivo',
      'subdireccion',
      'docente',
      'docente_tutor',
      'prefectura',
      'orientacion',
      'trabajo_social',
      'medico_escolar',
      'udeii',
      'promotora_lectura',
      'secretaria',
      'developer',
      'system_admin'
    ]::text[]);

  if v_actor_role is null then
    raise exception 'El perfil institucional no está activo o no puede registrar auditoría.'
      using errcode = '42501';
  end if;

  if btrim(coalesce(p_tipo_accion, '')) !~
    '^[A-Za-z0-9_]{2,80}$'
  then
    raise exception 'El tipo de acción no cumple el contrato de auditoría.'
      using errcode = '22023';
  end if;

  if char_length(btrim(coalesce(p_descripcion, ''))) not between 5 and 1000 then
    raise exception 'La descripción debe tener entre 5 y 1000 caracteres.'
      using errcode = '22023';
  end if;

  if btrim(coalesce(p_tabla_objetivo, '')) !~ '^[a-z0-9_]{1,80}$' then
    raise exception 'La tabla objetivo no cumple el contrato de auditoría.'
      using errcode = '22023';
  end if;

  if p_id_registro_objetivo is not null
    and char_length(btrim(p_id_registro_objetivo)) > 160
  then
    raise exception 'El identificador objetivo excede 160 caracteres.'
      using errcode = '22023';
  end if;

  if char_length(btrim(coalesce(p_proposito, ''))) not between 5 and 240 then
    raise exception 'El propósito debe tener entre 5 y 240 caracteres.'
      using errcode = '22023';
  end if;

  insert into public.auditoria (
    usuario_id,
    email_usuario,
    rol_usuario,
    tipo_accion,
    descripcion_accion,
    tabla_objetivo,
    id_registro_objetivo,
    proposito,
    alumno_id,
    origen,
    fecha
  ) values (
    v_actor_id,
    v_actor_email,
    v_actor_role,
    upper(btrim(p_tipo_accion)),
    btrim(p_descripcion),
    btrim(p_tabla_objetivo),
    nullif(btrim(p_id_registro_objetivo), ''),
    btrim(p_proposito),
    p_alumno_id,
    'cliente_seguro',
    now()
  )
  returning id into v_audit_id;

  return v_audit_id;
end;
$$;

create or replace function public.consultar_caja_negra(
  p_limite integer default 100,
  p_cursor_fecha timestamptz default null,
  p_cursor_id uuid default null,
  p_categoria text default null,
  p_rol text default null,
  p_tabla text default null,
  p_busqueda text default null,
  p_desde date default null,
  p_hasta date default null
)
returns table (
  id uuid,
  usuario_id uuid,
  email_usuario text,
  rol_usuario text,
  tipo_accion text,
  categoria_accion text,
  descripcion_accion text,
  tabla_objetivo text,
  id_registro_objetivo text,
  proposito text,
  alumno_id uuid,
  alumno_nombre text,
  origen text,
  fecha timestamptz,
  total_filtrado bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_actor_email text;
  v_actor_role text;
  v_limite integer := least(greatest(coalesce(p_limite, 100), 1), 200);
  v_busqueda text := nullif(btrim(coalesce(p_busqueda, '')), '');
begin
  if v_actor_id is null then
    raise exception 'Se requiere una sesión institucional para consultar Caja Negra.'
      using errcode = '42501';
  end if;

  select
    lower(btrim(p.rol)),
    coalesce(
      nullif(btrim(p.email), ''),
      (
        select u.email
        from auth.users as u
        where u.id = v_actor_id
      )
    )
  into v_actor_role, v_actor_email
  from public.perfiles_usuario as p
  where p.id = v_actor_id
    and p.estado_cuenta = 'activo'
    and p.seguridad_status = 'active'
    and lower(btrim(p.rol)) = any (array[
      'directivo',
      'subdireccion',
      'developer',
      'system_admin'
    ]::text[]);

  if v_actor_role is null then
    raise exception 'El rol institucional no puede consultar Caja Negra.'
      using errcode = '42501';
  end if;

  if p_desde is not null and p_hasta is not null and p_desde > p_hasta then
    raise exception 'El rango de fechas de Caja Negra es inválido.'
      using errcode = '22023';
  end if;

  if v_busqueda is not null and char_length(v_busqueda) > 120 then
    raise exception 'La búsqueda excede 120 caracteres.'
      using errcode = '22023';
  end if;

  insert into public.auditoria (
    usuario_id,
    email_usuario,
    rol_usuario,
    tipo_accion,
    descripcion_accion,
    tabla_objetivo,
    id_registro_objetivo,
    proposito,
    origen,
    fecha
  ) values (
    v_actor_id,
    v_actor_email,
    v_actor_role,
    'CONSULTA_CAJA_NEGRA',
    'Consultó el registro institucional de actividad.',
    'auditoria',
    null,
    'Supervisión autorizada de trazabilidad institucional',
    'rpc_institucional',
    now()
  );

  return query
  with eventos as (
    select
      a.id,
      a.usuario_id,
      a.email_usuario,
      a.rol_usuario,
      a.tipo_accion,
      private.categoria_evento_auditoria(a.tipo_accion) as categoria_accion,
      a.descripcion_accion,
      a.tabla_objetivo,
      a.id_registro_objetivo,
      a.proposito,
      a.alumno_id,
      nullif(btrim(al.nombre), '') as alumno_nombre,
      a.origen,
      a.fecha
    from public.auditoria as a
    left join public.alumnos as al
      on al.id = a.alumno_id
    where (
      p_cursor_fecha is null
      or a.fecha < p_cursor_fecha
      or (
        a.fecha = p_cursor_fecha
        and p_cursor_id is not null
        and a.id < p_cursor_id
      )
    )
      and (
        p_rol is null
        or lower(coalesce(a.rol_usuario, '')) = lower(btrim(p_rol))
      )
      and (
        p_tabla is null
        or lower(coalesce(a.tabla_objetivo, '')) = lower(btrim(p_tabla))
      )
      and (
        p_desde is null
        or (a.fecha at time zone 'America/Mexico_City')::date >= p_desde
      )
      and (
        p_hasta is null
        or (a.fecha at time zone 'America/Mexico_City')::date <= p_hasta
      )
      and (
        v_busqueda is null
        or lower(coalesce(a.email_usuario, '')) like
          '%' || lower(v_busqueda) || '%'
        or lower(coalesce(a.tipo_accion, '')) like
          '%' || lower(v_busqueda) || '%'
        or lower(coalesce(a.descripcion_accion, '')) like
          '%' || lower(v_busqueda) || '%'
        or lower(coalesce(a.tabla_objetivo, '')) like
          '%' || lower(v_busqueda) || '%'
        or lower(coalesce(a.id_registro_objetivo, '')) like
          '%' || lower(v_busqueda) || '%'
        or lower(coalesce(a.proposito, '')) like
          '%' || lower(v_busqueda) || '%'
      )
  )
  select
    e.id,
    e.usuario_id,
    e.email_usuario,
    e.rol_usuario,
    e.tipo_accion,
    e.categoria_accion,
    e.descripcion_accion,
    e.tabla_objetivo,
    e.id_registro_objetivo,
    e.proposito,
    e.alumno_id,
    e.alumno_nombre,
    e.origen,
    e.fecha,
    count(*) over () as total_filtrado
  from eventos as e
  where (
    p_categoria is null
    or e.categoria_accion = upper(btrim(p_categoria))
  )
  order by e.fecha desc nulls last, e.id desc
  limit v_limite;
end;
$$;

create or replace function public.fn_automatic_audit_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_user_email text;
  v_user_role text;
  v_action text;
  v_old_data jsonb;
  v_new_data jsonb;
  v_row_data jsonb;
  v_target_id text;
  v_student_text text;
  v_student_id uuid;
  v_changed_fields text[];
begin
  if tg_op = 'INSERT' then
    v_action := 'CREACION';
    v_new_data := to_jsonb(new);
  elsif tg_op = 'UPDATE' then
    v_action := 'ACTUALIZACION';
    v_old_data := to_jsonb(old);
    v_new_data := to_jsonb(new);
  elsif tg_op = 'DELETE' then
    v_action := 'ELIMINACION';
    v_old_data := to_jsonb(old);
  end if;

  v_row_data := coalesce(v_new_data, v_old_data, '{}'::jsonb);
  v_target_id := nullif(v_row_data ->> 'id', '');
  v_student_text := case
    when tg_table_name = 'alumnos' then v_target_id
    else nullif(v_row_data ->> 'alumno_id', '')
  end;

  if v_student_text ~*
    '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  then
    v_student_id := v_student_text::uuid;
  end if;

  select coalesce(array_agg(changed.key order by changed.key), '{}'::text[])
  into v_changed_fields
  from (
    select keys.key
    from jsonb_object_keys(
      coalesce(v_old_data, '{}'::jsonb)
      || coalesce(v_new_data, '{}'::jsonb)
    ) as keys(key)
    where (v_old_data -> keys.key) is distinct from
      (v_new_data -> keys.key)
  ) as changed;

  if v_user_id is not null then
    select
      coalesce(
        nullif(btrim(p.email), ''),
        (
          select u.email
          from auth.users as u
          where u.id = v_user_id
        )
      ),
      coalesce(nullif(lower(btrim(p.rol)), ''), 'sin_perfil')
    into v_user_email, v_user_role
    from public.perfiles_usuario as p
    where p.id = v_user_id;

    if not found then
      select u.email
      into v_user_email
      from auth.users as u
      where u.id = v_user_id;
      v_user_role := 'sin_perfil';
    end if;
  else
    v_user_email := 'SYSTEM';
    v_user_role := 'sistema';
  end if;

  insert into public.auditoria (
    usuario_id,
    email_usuario,
    rol_usuario,
    tipo_accion,
    descripcion_accion,
    tabla_objetivo,
    id_registro_objetivo,
    old_values,
    new_values,
    proposito,
    alumno_id,
    origen,
    fecha
  ) values (
    v_user_id,
    v_user_email,
    v_user_role,
    v_action,
    format('%s en tabla %s.', v_action, tg_table_name),
    tg_table_name,
    v_target_id,
    null,
    jsonb_build_object(
      'campos_afectados',
      to_jsonb(v_changed_fields),
      'contenido_sensible_omitido',
      true
    ),
    'Trazabilidad automática de una mutación institucional',
    v_student_id,
    'trigger',
    now()
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

alter table public.auditoria enable row level security;

do $$
declare
  v_policy record;
begin
  for v_policy in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'auditoria'
  loop
    execute format(
      'drop policy if exists %I on public.auditoria',
      v_policy.policyname
    );
  end loop;
end;
$$;

revoke all on table public.auditoria from public, anon, authenticated;

alter table public.auditoria_accesos enable row level security;

do $$
declare
  v_policy record;
begin
  for v_policy in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'auditoria_accesos'
  loop
    execute format(
      'drop policy if exists %I on public.auditoria_accesos',
      v_policy.policyname
    );
  end loop;
end;
$$;

revoke all on table public.auditoria_accesos
  from public, anon, authenticated;

revoke all on function public.registrar_evento_auditoria(
  text, text, text, text, text, uuid
) from public, anon, authenticated;
grant execute on function public.registrar_evento_auditoria(
  text, text, text, text, text, uuid
) to authenticated;

revoke all on function public.consultar_caja_negra(
  integer, timestamptz, uuid, text, text, text, text, date, date
) from public, anon, authenticated;
grant execute on function public.consultar_caja_negra(
  integer, timestamptz, uuid, text, text, text, text, date, date
) to authenticated;

-- Helpers legados que permiten que el cliente suplante identidad.
revoke all on function public.registrar_auditoria_sase(
  uuid, text, text, text, text, text, text
) from public, anon, authenticated;

revoke all on function public.log_audit(
  text, text, text, uuid, text, jsonb, jsonb
) from public, anon, authenticated;

revoke all on function public.fn_automatic_audit_trigger()
  from public, anon, authenticated;

comment on function public.registrar_evento_auditoria(
  text, text, text, text, text, uuid
) is
  'Registra un evento mínimo de auditoría derivando identidad y rol desde la sesión institucional activa.';

comment on function public.consultar_caja_negra(
  integer, timestamptz, uuid, text, text, text, text, date, date
) is
  'Consulta paginada de Caja Negra para supervisión autorizada; no expone payloads sensibles.';
