-- SASE-310: resolución segura y transaccional de altas de personal.
--
-- La identidad Auth se crea o localiza en la función Edge. Esta migración
-- concentra en una sola transacción el perfil institucional, la resolución de
-- la solicitud y su auditoría. Los clientes no pueden ejecutar estas RPC.

CREATE SCHEMA IF NOT EXISTS private;

INSERT INTO public.roles_permisos (rol, permisos, actualizado_en)
VALUES
  ('directivo', jsonb_build_object(
    'can_view_names', true, 'can_register', true, 'can_edit', true,
    'can_close', true, 'can_escalate', true, 'can_view_audit', true,
    'can_approve_staff', true, 'can_assign_groups', true,
    'can_view_sensitive', true, 'can_manage_system', true
  ), now()),
  ('subdireccion', jsonb_build_object(
    'can_view_names', true, 'can_register', true, 'can_edit', true,
    'can_close', true, 'can_escalate', true, 'can_view_audit', true,
    'can_approve_staff', true, 'can_assign_groups', true,
    'can_view_sensitive', true, 'can_manage_system', false
  ), now()),
  ('docente', jsonb_build_object(
    'can_view_names', false, 'can_register', true, 'can_edit', false,
    'can_close', false, 'can_escalate', true, 'can_view_audit', false,
    'can_approve_staff', false, 'can_assign_groups', false,
    'can_view_sensitive', false, 'can_manage_system', false
  ), now()),
  ('docente_tutor', jsonb_build_object(
    'can_view_names', false, 'can_register', true, 'can_edit', true,
    'can_close', true, 'can_escalate', true, 'can_view_audit', false,
    'can_approve_staff', false, 'can_assign_groups', false,
    'can_view_sensitive', false, 'can_manage_system', false
  ), now()),
  ('prefectura', jsonb_build_object(
    'can_view_names', false, 'can_register', true, 'can_edit', true,
    'can_close', true, 'can_escalate', true, 'can_view_audit', false,
    'can_approve_staff', false, 'can_assign_groups', false,
    'can_view_sensitive', false, 'can_manage_system', false
  ), now()),
  ('orientacion', jsonb_build_object(
    'can_view_names', true, 'can_register', true, 'can_edit', true,
    'can_close', false, 'can_escalate', true, 'can_view_audit', false,
    'can_approve_staff', false, 'can_assign_groups', false,
    'can_view_sensitive', true, 'can_manage_system', false
  ), now()),
  ('trabajo_social', jsonb_build_object(
    'can_view_names', true, 'can_register', true, 'can_edit', true,
    'can_close', true, 'can_escalate', true, 'can_view_audit', false,
    'can_approve_staff', false, 'can_assign_groups', false,
    'can_view_sensitive', true, 'can_manage_system', false
  ), now()),
  ('medico_escolar', jsonb_build_object(
    'can_view_names', true, 'can_register', true, 'can_edit', true,
    'can_close', false, 'can_escalate', true, 'can_view_audit', false,
    'can_approve_staff', false, 'can_assign_groups', false,
    'can_view_sensitive', true, 'can_manage_system', false
  ), now()),
  ('udeii', jsonb_build_object(
    'can_view_names', true, 'can_register', true, 'can_edit', true,
    'can_close', true, 'can_escalate', true, 'can_view_audit', false,
    'can_approve_staff', false, 'can_assign_groups', false,
    'can_view_sensitive', true, 'can_manage_system', false
  ), now()),
  ('promotora_lectura', jsonb_build_object(
    'can_view_names', false, 'can_register', true, 'can_edit', true,
    'can_close', false, 'can_escalate', false, 'can_view_audit', false,
    'can_approve_staff', false, 'can_assign_groups', false,
    'can_view_sensitive', false, 'can_manage_system', false
  ), now()),
  ('secretaria', jsonb_build_object(
    'can_view_names', true, 'can_register', true, 'can_edit', true,
    'can_close', false, 'can_escalate', false, 'can_view_audit', false,
    'can_approve_staff', false, 'can_assign_groups', false,
    'can_view_sensitive', false, 'can_manage_system', false
  ), now()),
  ('developer', jsonb_build_object(
    'can_view_names', true, 'can_register', true, 'can_edit', true,
    'can_close', true, 'can_escalate', true, 'can_view_audit', true,
    'can_approve_staff', true, 'can_assign_groups', true,
    'can_view_sensitive', true, 'can_manage_system', true
  ), now()),
  ('system_admin', jsonb_build_object(
    'can_view_names', true, 'can_register', true, 'can_edit', true,
    'can_close', true, 'can_escalate', true, 'can_view_audit', true,
    'can_approve_staff', true, 'can_assign_groups', true,
    'can_view_sensitive', true, 'can_manage_system', true
  ), now())
ON CONFLICT (rol) DO UPDATE
SET permisos = EXCLUDED.permisos,
    actualizado_en = EXCLUDED.actualizado_en;

CREATE OR REPLACE FUNCTION private.normalizar_rol_personal(p_rol text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT CASE lower(btrim(p_rol))
    WHEN 'direccion' THEN 'directivo'
    WHEN 'directivo' THEN 'directivo'
    WHEN 'subdireccion' THEN 'subdireccion'
    WHEN 'docente' THEN 'docente'
    WHEN 'docente_tutor' THEN 'docente_tutor'
    WHEN 'prefectura' THEN 'prefectura'
    WHEN 'orientacion' THEN 'orientacion'
    WHEN 'trabajo_social' THEN 'trabajo_social'
    WHEN 'enfermeria' THEN 'medico_escolar'
    WHEN 'medico_escolar' THEN 'medico_escolar'
    WHEN 'udeii' THEN 'udeii'
    WHEN 'promotora' THEN 'promotora_lectura'
    WHEN 'promotora_lectura' THEN 'promotora_lectura'
    WHEN 'secretaria' THEN 'secretaria'
    ELSE NULL
  END
$$;

CREATE OR REPLACE FUNCTION private.combinar_permisos_personal(p_roles text[])
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    jsonb_object_agg(combinados.clave, combinados.permitido),
    '{}'::jsonb
  )
  FROM (
    SELECT permiso.key AS clave,
           bool_or((permiso.value #>> '{}')::boolean) AS permitido
    FROM public.roles_permisos AS rp
    CROSS JOIN LATERAL jsonb_each(rp.permisos) AS permiso
    WHERE rp.rol = ANY (p_roles)
    GROUP BY permiso.key
  ) AS combinados
$$;

CREATE OR REPLACE FUNCTION private.puede_gestionar_personal()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.perfiles_usuario AS p
    WHERE p.id = (SELECT auth.uid())
      AND p.estado_cuenta = 'activo'
      AND p.seguridad_status = 'active'
      AND p.rol IN ('directivo', 'subdireccion', 'developer', 'system_admin')
  )
$$;

REVOKE ALL ON FUNCTION private.normalizar_rol_personal(text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.combinar_permisos_personal(text[])
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.puede_gestionar_personal()
  FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.puede_gestionar_personal()
  TO authenticated;

CREATE OR REPLACE FUNCTION public.finalizar_aprobacion_personal(
  p_solicitud_id uuid,
  p_usuario_auth_id uuid,
  p_matricula_sase text,
  p_grupos text[] DEFAULT '{}'::text[],
  p_materias text[] DEFAULT '{}'::text[],
  p_es_tutor boolean DEFAULT false,
  p_grupo_tutor text DEFAULT NULL,
  p_aprobador_id uuid DEFAULT NULL,
  p_auth_status text DEFAULT 'existing'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_solicitud public.solicitudes_alta_personal%ROWTYPE;
  v_aprobador_email text;
  v_aprobador_rol text;
  v_auth_email text;
  v_email text;
  v_nombre text;
  v_matricula text;
  v_roles text[];
  v_rol_principal text;
  v_permisos jsonb;
  v_grupos text[];
  v_materias text[];
  v_es_tutor boolean;
  v_grupo_tutor text;
BEGIN
  SELECT p.email, p.rol
    INTO v_aprobador_email, v_aprobador_rol
  FROM public.perfiles_usuario AS p
  WHERE p.id = p_aprobador_id
    AND p.estado_cuenta = 'activo'
    AND p.seguridad_status = 'active'
    AND p.rol IN ('directivo', 'subdireccion', 'developer', 'system_admin');

  IF NOT FOUND THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'El perfil institucional no puede aprobar personal.';
  END IF;

  SELECT *
    INTO v_solicitud
  FROM public.solicitudes_alta_personal
  WHERE id = p_solicitud_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'Solicitud no encontrada.';
  END IF;

  IF v_solicitud.estado NOT IN ('PENDIENTE', 'OBSERVACIONES') THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'La solicitud ya fue procesada.';
  END IF;

  IF p_auth_status NOT IN ('invited', 'existing') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Estado Auth inválido.';
  END IF;

  SELECT lower(email)
    INTO v_auth_email
  FROM auth.users
  WHERE id = p_usuario_auth_id;

  v_email := lower(btrim(v_solicitud.correo_institucional));
  IF v_email !~ '^[a-z0-9]+(\.[a-z0-9]+)+@sase\.mx$' THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'El correo institucional no cumple el formato SASE.';
  END IF;

  IF v_auth_email IS NULL OR v_auth_email <> v_email THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'El usuario Auth no corresponde al correo de la solicitud.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM unnest(v_solicitud.rol_solicitado) AS solicitado(rol)
    WHERE private.normalizar_rol_personal(solicitado.rol) IS NULL
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'La solicitud contiene un rol no aprobable.';
  END IF;

  SELECT COALESCE(
           array_agg(DISTINCT private.normalizar_rol_personal(solicitado.rol)
                     ORDER BY private.normalizar_rol_personal(solicitado.rol)),
           '{}'::text[]
         )
    INTO v_roles
  FROM unnest(v_solicitud.rol_solicitado) AS solicitado(rol);

  IF cardinality(v_roles) = 0 THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'La solicitud no contiene roles aprobables.';
  END IF;

  v_es_tutor := p_es_tutor OR 'docente_tutor' = ANY (v_roles);
  IF v_es_tutor
     AND NOT ('docente' = ANY (v_roles) OR 'docente_tutor' = ANY (v_roles)) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'La tutoría solo puede asignarse a personal docente.';
  END IF;

  IF v_es_tutor
     AND 'docente' = ANY (v_roles)
     AND NOT ('docente_tutor' = ANY (v_roles)) THEN
    v_roles := array_append(v_roles, 'docente_tutor');
  END IF;

  v_rol_principal := CASE
    WHEN 'docente_tutor' = ANY (v_roles) THEN 'docente_tutor'
    ELSE v_roles[1]
  END;

  IF cardinality(COALESCE(p_grupos, '{}'::text[])) > 50
     OR cardinality(COALESCE(p_materias, '{}'::text[])) > 50 THEN
    RAISE EXCEPTION USING
      ERRCODE = '22023',
      MESSAGE = 'La asignación académica excede el límite permitido.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM unnest(COALESCE(p_grupos, '{}'::text[])) AS grupo(valor)
    WHERE length(btrim(grupo.valor)) > 30
  ) OR EXISTS (
    SELECT 1 FROM unnest(COALESCE(p_materias, '{}'::text[])) AS materia(valor)
    WHERE length(btrim(materia.valor)) > 100
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '22023',
      MESSAGE = 'Una asignación académica excede la longitud permitida.';
  END IF;

  SELECT COALESCE(
           array_agg(DISTINCT upper(btrim(grupo.valor))
                     ORDER BY upper(btrim(grupo.valor))),
           '{}'::text[]
         )
    INTO v_grupos
  FROM unnest(COALESCE(p_grupos, '{}'::text[])) AS grupo(valor)
  WHERE btrim(grupo.valor) <> '';

  SELECT COALESCE(
           array_agg(DISTINCT btrim(materia.valor)
                     ORDER BY btrim(materia.valor)),
           '{}'::text[]
         )
    INTO v_materias
  FROM unnest(COALESCE(p_materias, '{}'::text[])) AS materia(valor)
  WHERE btrim(materia.valor) <> '';

  v_grupo_tutor := CASE
    WHEN v_es_tutor THEN NULLIF(upper(btrim(p_grupo_tutor)), '')
    ELSE NULL
  END;

  IF v_grupo_tutor IS NOT NULL AND length(v_grupo_tutor) > 30 THEN
    RAISE EXCEPTION USING
      ERRCODE = '22023',
      MESSAGE = 'El grupo de tutoría excede la longitud permitida.';
  END IF;

  v_matricula := upper(btrim(p_matricula_sase));
  IF v_matricula IS NULL OR v_matricula !~ '^[A-Z0-9-]{6,40}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Matrícula SASE inválida.';
  END IF;

  IF NULLIF(btrim(v_solicitud.matricula_sase), '') IS NOT NULL
     AND upper(btrim(v_solicitud.matricula_sase)) <> v_matricula THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'La matrícula no coincide con la asignada a la solicitud.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.perfiles_usuario AS p
    WHERE lower(p.email) = v_email
      AND p.id <> p_usuario_auth_id
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23505',
      MESSAGE = 'Existe otro perfil institucional para ese correo.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.perfiles_usuario AS p
    WHERE p.id = p_usuario_auth_id
      AND (
        (p.email IS NOT NULL AND lower(p.email) <> v_email)
        OR COALESCE(p.seguridad_status, 'active') <> 'active'
        OR COALESCE(p.estado_cuenta, 'pendiente')
           NOT IN ('pendiente', 'activo')
      )
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'El perfil existente no puede reactivarse mediante una aprobación.';
  END IF;

  v_nombre := regexp_replace(
    concat_ws(
      ' ',
      v_solicitud.nombres,
      v_solicitud.apellido_paterno,
      v_solicitud.apellido_materno
    ),
    '\s+',
    ' ',
    'g'
  );
  v_permisos := private.combinar_permisos_personal(v_roles);

  IF v_permisos = '{}'::jsonb THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'No se pudieron derivar permisos para los roles aprobados.';
  END IF;

  INSERT INTO public.perfiles_usuario (
    id,
    matricula_sase,
    rol,
    role,
    rol_solicitado,
    nombre_completo,
    curp,
    email,
    telefono,
    materias,
    grupos,
    turno,
    es_tutor,
    grupo_tutor,
    alcances,
    permisos,
    estado_cuenta,
    seguridad_status,
    blocked_until,
    fecha_validacion,
    validado_por,
    observaciones,
    updated_at
  ) VALUES (
    p_usuario_auth_id,
    v_matricula,
    v_rol_principal,
    v_rol_principal,
    array_to_string(v_roles, ','),
    v_nombre,
    v_solicitud.curp,
    v_email,
    v_solicitud.telefono,
    NULLIF(v_materias, '{}'::text[]),
    NULLIF(v_grupos, '{}'::text[]),
    v_solicitud.turno,
    v_es_tutor,
    v_grupo_tutor,
    v_permisos,
    v_permisos,
    'activo',
    'active',
    NULL,
    now(),
    p_aprobador_id,
    v_solicitud.observaciones,
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET matricula_sase = EXCLUDED.matricula_sase,
      rol = EXCLUDED.rol,
      role = EXCLUDED.role,
      rol_solicitado = EXCLUDED.rol_solicitado,
      nombre_completo = EXCLUDED.nombre_completo,
      curp = EXCLUDED.curp,
      email = EXCLUDED.email,
      telefono = EXCLUDED.telefono,
      materias = EXCLUDED.materias,
      grupos = EXCLUDED.grupos,
      turno = EXCLUDED.turno,
      es_tutor = EXCLUDED.es_tutor,
      grupo_tutor = EXCLUDED.grupo_tutor,
      alcances = EXCLUDED.alcances,
      permisos = EXCLUDED.permisos,
      estado_cuenta = EXCLUDED.estado_cuenta,
      seguridad_status = EXCLUDED.seguridad_status,
      blocked_until = EXCLUDED.blocked_until,
      fecha_validacion = EXCLUDED.fecha_validacion,
      validado_por = EXCLUDED.validado_por,
      observaciones = EXCLUDED.observaciones,
      updated_at = EXCLUDED.updated_at;

  UPDATE public.solicitudes_alta_personal
  SET estado = 'APROBADA',
      matricula_sase = v_matricula,
      es_tutor = v_es_tutor,
      grupo_tutor = v_grupo_tutor,
      materias = NULLIF(v_materias, '{}'::text[]),
      grupos = NULLIF(v_grupos, '{}'::text[]),
      rol_solicitado = v_roles,
      aprobado_por = p_aprobador_id,
      aprobado_en = now(),
      observaciones_validacion = NULL
  WHERE id = p_solicitud_id;

  INSERT INTO public.auditoria (
    usuario_id,
    email_usuario,
    rol_usuario,
    tipo_accion,
    descripcion_accion,
    tabla_objetivo,
    id_registro_objetivo,
    proposito,
    origen
  ) VALUES (
    p_aprobador_id,
    COALESCE(
      v_aprobador_email,
      (SELECT email FROM auth.users WHERE id = p_aprobador_id)
    ),
    v_aprobador_rol,
    'APROBACION_PERSONAL',
    format(
      'Aprobó la solicitud %s con rol principal %s; usuario Auth %s.',
      p_solicitud_id,
      v_rol_principal,
      CASE WHEN p_auth_status = 'invited' THEN 'invitado' ELSE 'existente' END
    ),
    'solicitudes_alta_personal',
    p_solicitud_id::text,
    'Autorizar y dejar trazabilidad del alta de personal institucional',
    'edge_function'
  );

  RETURN jsonb_build_object(
    'approved', true,
    'primaryRole', v_rol_principal,
    'approvedRoles', to_jsonb(v_roles),
    'userId', p_usuario_auth_id,
    'alreadyExisted', p_auth_status = 'existing'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.rechazar_solicitud_personal(
  p_solicitud_id uuid,
  p_motivo text,
  p_aprobador_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_solicitud public.solicitudes_alta_personal%ROWTYPE;
  v_aprobador_email text;
  v_aprobador_rol text;
  v_motivo text := btrim(p_motivo);
BEGIN
  SELECT p.email, p.rol
    INTO v_aprobador_email, v_aprobador_rol
  FROM public.perfiles_usuario AS p
  WHERE p.id = p_aprobador_id
    AND p.estado_cuenta = 'activo'
    AND p.seguridad_status = 'active'
    AND p.rol IN ('directivo', 'subdireccion', 'developer', 'system_admin');

  IF NOT FOUND THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'El perfil institucional no puede resolver personal.';
  END IF;

  IF length(v_motivo) < 10 OR length(v_motivo) > 1000 THEN
    RAISE EXCEPTION USING
      ERRCODE = '22023',
      MESSAGE = 'El motivo debe contener entre 10 y 1000 caracteres.';
  END IF;

  SELECT *
    INTO v_solicitud
  FROM public.solicitudes_alta_personal
  WHERE id = p_solicitud_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'Solicitud no encontrada.';
  END IF;

  IF v_solicitud.estado NOT IN ('PENDIENTE', 'OBSERVACIONES') THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'La solicitud ya fue procesada.';
  END IF;

  UPDATE public.solicitudes_alta_personal
  SET estado = 'RECHAZADA',
      observaciones_validacion = v_motivo,
      aprobado_por = p_aprobador_id,
      aprobado_en = now()
  WHERE id = p_solicitud_id;

  INSERT INTO public.auditoria (
    usuario_id,
    email_usuario,
    rol_usuario,
    tipo_accion,
    descripcion_accion,
    tabla_objetivo,
    id_registro_objetivo,
    proposito,
    origen
  ) VALUES (
    p_aprobador_id,
    COALESCE(
      v_aprobador_email,
      (SELECT email FROM auth.users WHERE id = p_aprobador_id)
    ),
    v_aprobador_rol,
    'RECHAZO_PERSONAL',
    format(
      'Rechazó la solicitud %s; el motivo quedó documentado en la solicitud.',
      p_solicitud_id
    ),
    'solicitudes_alta_personal',
    p_solicitud_id::text,
    'Resolver y dejar trazabilidad del rechazo de acceso institucional',
    'edge_function'
  );

  RETURN jsonb_build_object(
    'approved', false,
    'rejected', true,
    'requestId', p_solicitud_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.finalizar_aprobacion_personal(
  uuid, uuid, text, text[], text[], boolean, text, uuid, text
) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rechazar_solicitud_personal(
  uuid, text, uuid
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.finalizar_aprobacion_personal(
  uuid, uuid, text, text[], text[], boolean, text, uuid, text
) TO service_role;
GRANT EXECUTE ON FUNCTION public.rechazar_solicitud_personal(
  uuid, text, uuid
) TO service_role;

ALTER TABLE public.solicitudes_alta_personal ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  policy_row record;
BEGIN
  FOR policy_row IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'solicitudes_alta_personal'
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.solicitudes_alta_personal',
      policy_row.policyname
    );
  END LOOP;
END
$$;

REVOKE ALL ON TABLE public.solicitudes_alta_personal
  FROM anon, authenticated;

GRANT INSERT (
  rol_solicitado,
  turno,
  nombres,
  apellido_paterno,
  apellido_materno,
  curp,
  correo_institucional,
  telefono,
  materias,
  grupos,
  es_tutor,
  grupo_tutor,
  area_cobertura,
  observaciones,
  acepta_privacidad,
  acepta_etica,
  acepta_auditoria,
  estado,
  metadata
) ON public.solicitudes_alta_personal TO anon, authenticated;

GRANT SELECT ON public.solicitudes_alta_personal TO authenticated;

CREATE POLICY "Solicitudes nuevas quedan pendientes"
ON public.solicitudes_alta_personal
FOR INSERT
TO anon, authenticated
WITH CHECK (
  estado = 'PENDIENTE'
  AND aprobado_por IS NULL
  AND aprobado_en IS NULL
  AND observaciones_validacion IS NULL
  AND acepta_privacidad
  AND acepta_etica
  AND acepta_auditoria
);

CREATE POLICY "Supervision activa consulta solicitudes"
ON public.solicitudes_alta_personal
FOR SELECT
TO authenticated
USING (
  (SELECT private.puede_gestionar_personal())
);

COMMENT ON FUNCTION public.finalizar_aprobacion_personal(
  uuid, uuid, text, text[], text[], boolean, text, uuid, text
) IS
  'Finaliza perfil, solicitud y auditoria en una transaccion; solo service_role.';

COMMENT ON FUNCTION public.rechazar_solicitud_personal(uuid, text, uuid) IS
  'Rechaza una solicitud y registra auditoria en una transaccion; solo service_role.';
