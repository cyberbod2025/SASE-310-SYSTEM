-- SASE-310: notificaciones a tutores con estado durable y autoridad de servidor.

CREATE TABLE public.notificaciones_whatsapp (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  incidencia_id uuid NOT NULL
    REFERENCES public.incidencias(id) ON DELETE CASCADE,
  alumno_id uuid NOT NULL
    REFERENCES public.alumnos(id) ON DELETE CASCADE,
  solicitado_por uuid NOT NULL
    REFERENCES public.perfiles_usuario(id),
  rol_solicitante text NOT NULL,
  proposito text NOT NULL,
  estado text NOT NULL DEFAULT 'PENDIENTE',
  destinatario_ultimos4 text NOT NULL,
  proveedor text NOT NULL DEFAULT 'meta',
  proveedor_mensaje_id text,
  error_codigo text,
  error_detalle text,
  creado_en timestamptz NOT NULL DEFAULT pg_catalog.now(),
  resuelto_en timestamptz,
  CONSTRAINT notificaciones_whatsapp_estado_check
    CHECK (estado IN ('PENDIENTE', 'ENVIADO', 'SIMULADO', 'FALLIDO')),
  CONSTRAINT notificaciones_whatsapp_ultimos4_check
    CHECK (destinatario_ultimos4 ~ '^[0-9]{4}$'),
  CONSTRAINT notificaciones_whatsapp_proposito_check
    CHECK (pg_catalog.length(pg_catalog.btrim(proposito)) BETWEEN 5 AND 240),
  CONSTRAINT notificaciones_whatsapp_resolucion_check
    CHECK (
      (estado = 'PENDIENTE' AND resuelto_en IS NULL)
      OR (estado <> 'PENDIENTE' AND resuelto_en IS NOT NULL)
    ),
  CONSTRAINT notificaciones_whatsapp_proveedor_id_check
    CHECK (
      estado <> 'ENVIADO'
      OR (
        proveedor_mensaje_id IS NOT NULL
        AND pg_catalog.length(pg_catalog.btrim(proveedor_mensaje_id))
          BETWEEN 3 AND 240
      )
    ),
  CONSTRAINT notificaciones_whatsapp_error_check
    CHECK (
      error_codigo IS NULL
      OR pg_catalog.length(error_codigo) <= 80
    ),
  CONSTRAINT notificaciones_whatsapp_error_detalle_check
    CHECK (
      error_detalle IS NULL
      OR pg_catalog.length(error_detalle) <= 500
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS
  idx_notificaciones_whatsapp_incidencia_pendiente
ON public.notificaciones_whatsapp (incidencia_id)
WHERE estado = 'PENDIENTE';

CREATE INDEX IF NOT EXISTS idx_notificaciones_whatsapp_incidencia_fecha
ON public.notificaciones_whatsapp (incidencia_id, creado_en DESC);

CREATE INDEX IF NOT EXISTS idx_notificaciones_whatsapp_actor_fecha
ON public.notificaciones_whatsapp (solicitado_por, creado_en DESC);

ALTER TABLE public.notificaciones_whatsapp ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION private.puede_consultar_notificacion_whatsapp(
  p_solicitado_por uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.perfiles_usuario AS perfil
    WHERE perfil.id = (SELECT auth.uid())
      AND perfil.estado_cuenta = 'activo'
      AND perfil.seguridad_status = 'active'
      AND (
        perfil.id = p_solicitado_por
        OR perfil.rol IN (
          'directivo',
          'subdireccion',
          'orientacion',
          'system_admin',
          'developer'
        )
      )
  )
$$;

REVOKE ALL ON FUNCTION private.puede_consultar_notificacion_whatsapp(uuid)
  FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE
  ON FUNCTION private.puede_consultar_notificacion_whatsapp(uuid)
  TO authenticated;

DROP POLICY IF EXISTS "Personal autorizado consulta intentos WhatsApp"
  ON public.notificaciones_whatsapp;

CREATE POLICY "Personal autorizado consulta intentos WhatsApp"
ON public.notificaciones_whatsapp
FOR SELECT
TO authenticated
USING (
  (SELECT private.puede_consultar_notificacion_whatsapp(solicitado_por))
);

REVOKE ALL ON public.notificaciones_whatsapp FROM anon, authenticated;
GRANT SELECT ON public.notificaciones_whatsapp TO authenticated;

CREATE OR REPLACE FUNCTION public.iniciar_notificacion_whatsapp(
  p_incidencia_id uuid,
  p_solicitante_id uuid,
  p_proposito text
)
RETURNS TABLE (
  intento_id uuid,
  destinatario text,
  alumno_nombre text,
  incidencia_tipo text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rol text;
  v_email text;
  v_alumno_id uuid;
  v_alumno_nombre text;
  v_tipo text;
  v_telefono text;
  v_telefono_digitos text;
  v_intento_id uuid;
  v_proposito text := pg_catalog.btrim(p_proposito);
  v_notificado boolean;
BEGIN
  SELECT perfil.rol, perfil.email
    INTO v_rol, v_email
  FROM public.perfiles_usuario AS perfil
  WHERE perfil.id = p_solicitante_id
    AND perfil.estado_cuenta = 'activo'
    AND perfil.seguridad_status = 'active'
    AND perfil.rol IN (
      'directivo',
      'subdireccion',
      'prefectura',
      'orientacion',
      'trabajo_social',
      'docente_tutor',
      'medico_escolar',
      'system_admin',
      'developer'
    );

  IF v_rol IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'El perfil no puede solicitar notificaciones a tutores.';
  END IF;

  IF v_proposito IS NULL OR pg_catalog.length(v_proposito) NOT BETWEEN 5 AND 240
  THEN
    RAISE EXCEPTION USING
      ERRCODE = '22023',
      MESSAGE = 'El propósito de la notificación no es válido.';
  END IF;

  SELECT
    incidencia.alumno_id,
    alumno.nombre_completo,
    incidencia.tipo::text,
    COALESCE(
      alumno.datos_tutor ->> 'phonePrimary',
      alumno.datos_tutor ->> 'telefono_principal'
    ),
    COALESCE(incidencia.notificado_whatsapp, false)
  INTO
    v_alumno_id,
    v_alumno_nombre,
    v_tipo,
    v_telefono,
    v_notificado
  FROM public.incidencias AS incidencia
  JOIN public.alumnos AS alumno ON alumno.id = incidencia.alumno_id
  WHERE incidencia.id = p_incidencia_id
  FOR UPDATE OF incidencia;

  IF v_alumno_id IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = 'P0002',
      MESSAGE = 'La incidencia no existe.';
  END IF;

  IF v_notificado THEN
    RAISE EXCEPTION USING
      ERRCODE = '23505',
      MESSAGE = 'La incidencia ya tiene una entrega confirmada.';
  END IF;

  v_telefono_digitos := pg_catalog.regexp_replace(
    COALESCE(v_telefono, ''),
    '[^0-9]',
    '',
    'g'
  );
  IF pg_catalog.length(v_telefono_digitos) NOT BETWEEN 10 AND 15 THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'El tutor no tiene un teléfono institucional válido.';
  END IF;

  INSERT INTO public.notificaciones_whatsapp (
    incidencia_id,
    alumno_id,
    solicitado_por,
    rol_solicitante,
    proposito,
    estado,
    destinatario_ultimos4
  ) VALUES (
    p_incidencia_id,
    v_alumno_id,
    p_solicitante_id,
    v_rol,
    v_proposito,
    'PENDIENTE',
    pg_catalog.right(v_telefono_digitos, 4)
  )
  RETURNING id INTO v_intento_id;

  INSERT INTO public.auditoria (
    usuario_id,
    email_usuario,
    rol_usuario,
    tipo_accion,
    descripcion_accion,
    tabla_objetivo,
    id_registro_objetivo,
    alumno_id,
    proposito,
    origen,
    new_values
  ) VALUES (
    p_solicitante_id,
    v_email,
    v_rol,
    'NOTIFICACION_WHATSAPP_SOLICITADA',
    'Se inició un intento de notificación al tutor.',
    'notificaciones_whatsapp',
    v_intento_id::text,
    v_alumno_id,
    v_proposito,
    'servidor',
    pg_catalog.jsonb_build_object(
      'estado', 'PENDIENTE',
      'incidencia_id', p_incidencia_id
    )
  );

  RETURN QUERY SELECT
    v_intento_id,
    v_telefono_digitos,
    v_alumno_nombre,
    v_tipo;
END;
$$;

CREATE OR REPLACE FUNCTION public.resolver_notificacion_whatsapp(
  p_intento_id uuid,
  p_estado text,
  p_proveedor_mensaje_id text DEFAULT NULL,
  p_error_codigo text DEFAULT NULL,
  p_error_detalle text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_intento public.notificaciones_whatsapp%ROWTYPE;
  v_estado text := pg_catalog.upper(pg_catalog.btrim(p_estado));
  v_mensaje_id text := NULLIF(pg_catalog.btrim(p_proveedor_mensaje_id), '');
  v_error_codigo text := NULLIF(pg_catalog.btrim(p_error_codigo), '');
  v_error_detalle text := NULLIF(pg_catalog.btrim(p_error_detalle), '');
  v_email text;
BEGIN
  IF v_estado NOT IN ('ENVIADO', 'SIMULADO', 'FALLIDO') THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'El estado final de la notificación no es válido.';
  END IF;

  IF v_estado = 'ENVIADO'
     AND (
       v_mensaje_id IS NULL
       OR pg_catalog.length(v_mensaje_id) NOT BETWEEN 3 AND 240
     ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'La entrega requiere identificador del proveedor.';
  END IF;

  IF pg_catalog.length(COALESCE(v_error_codigo, '')) > 80
     OR pg_catalog.length(COALESCE(v_error_detalle, '')) > 500 THEN
    RAISE EXCEPTION USING
      ERRCODE = '22023',
      MESSAGE = 'El detalle de resolución excede el límite permitido.';
  END IF;

  SELECT intento.*
    INTO v_intento
  FROM public.notificaciones_whatsapp AS intento
  WHERE intento.id = p_intento_id
  FOR UPDATE;

  IF v_intento.id IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = 'P0002',
      MESSAGE = 'El intento de notificación no existe.';
  END IF;

  IF v_intento.estado <> 'PENDIENTE' THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'El intento de notificación ya fue resuelto.';
  END IF;

  SELECT perfil.email
    INTO v_email
  FROM public.perfiles_usuario AS perfil
  WHERE perfil.id = v_intento.solicitado_por;

  UPDATE public.notificaciones_whatsapp
  SET estado = v_estado,
      proveedor_mensaje_id = CASE
        WHEN v_estado = 'ENVIADO' THEN v_mensaje_id
        ELSE NULL
      END,
      error_codigo = CASE
        WHEN v_estado IN ('SIMULADO', 'FALLIDO') THEN v_error_codigo
        ELSE NULL
      END,
      error_detalle = CASE
        WHEN v_estado IN ('SIMULADO', 'FALLIDO') THEN v_error_detalle
        ELSE NULL
      END,
      resuelto_en = pg_catalog.now()
  WHERE id = p_intento_id;

  IF v_estado = 'ENVIADO' THEN
    UPDATE public.incidencias
    SET notificado_whatsapp = true
    WHERE id = v_intento.incidencia_id;
  END IF;

  INSERT INTO public.auditoria (
    usuario_id,
    email_usuario,
    rol_usuario,
    tipo_accion,
    descripcion_accion,
    tabla_objetivo,
    id_registro_objetivo,
    alumno_id,
    proposito,
    origen,
    old_values,
    new_values
  ) VALUES (
    v_intento.solicitado_por,
    v_email,
    v_intento.rol_solicitante,
    'NOTIFICACION_WHATSAPP_' || v_estado,
    CASE v_estado
      WHEN 'ENVIADO' THEN 'El proveedor confirmó la entrega al tutor.'
      WHEN 'SIMULADO' THEN 'El canal no estaba configurado; no hubo entrega.'
      ELSE 'El proveedor no confirmó la entrega al tutor.'
    END,
    'notificaciones_whatsapp',
    p_intento_id::text,
    v_intento.alumno_id,
    v_intento.proposito,
    'servidor',
    pg_catalog.jsonb_build_object('estado', 'PENDIENTE'),
    pg_catalog.jsonb_build_object(
      'estado', v_estado,
      'incidencia_id', v_intento.incidencia_id,
      'entregado', v_estado = 'ENVIADO'
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'attemptId', p_intento_id,
    'incidentId', v_intento.incidencia_id,
    'status', pg_catalog.lower(v_estado),
    'delivered', v_estado = 'ENVIADO'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.iniciar_notificacion_whatsapp(
  uuid,
  uuid,
  text
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.iniciar_notificacion_whatsapp(
  uuid,
  uuid,
  text
) TO service_role;

REVOKE ALL ON FUNCTION public.resolver_notificacion_whatsapp(
  uuid,
  text,
  text,
  text,
  text
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.resolver_notificacion_whatsapp(
  uuid,
  text,
  text,
  text,
  text
) TO service_role;

INSERT INTO public.auditoria (
  tipo_accion,
  descripcion_accion,
  tabla_objetivo,
  proposito,
  origen
) VALUES (
  'MIGRACION_NOTIFICACIONES_TUTORES',
  'Creó memoria durable y resolución honesta para notificaciones a tutores.',
  'notificaciones_whatsapp',
  'Asegurar trazabilidad y evitar falsos positivos de entrega',
  'migracion'
);
