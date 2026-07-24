-- SASE-310: minimización y bloqueo de secretos en solicitudes de personal.

UPDATE public.solicitudes_alta_personal
SET metadata = metadata - ARRAY[
  'password',
  'confirm_password',
  'confirmPassword',
  'contrasena',
  'contraseña',
  'preguntas_seguridad',
  'respuesta_seguridad',
  'respuestas_seguridad',
  'security_questions',
  'security_answers',
  'fecha_nacimiento',
  'rfc_parcial',
  'matricula'
]
WHERE metadata ?| ARRAY[
  'password',
  'confirm_password',
  'confirmPassword',
  'contrasena',
  'contraseña',
  'preguntas_seguridad',
  'respuesta_seguridad',
  'respuestas_seguridad',
  'security_questions',
  'security_answers',
  'fecha_nacimiento',
  'rfc_parcial',
  'matricula'
];

ALTER TABLE public.solicitudes_alta_personal
  DROP CONSTRAINT IF EXISTS solicitudes_metadata_sin_secretos;

ALTER TABLE public.solicitudes_alta_personal
  ADD CONSTRAINT solicitudes_metadata_sin_secretos
  CHECK (
    metadata::text !~*
      '"(password|confirm_?password|confirmpassword|contrasena|contraseña|preguntas?_seguridad|respuestas?_seguridad|security_questions?|security_answers?)"[[:space:]]*:'
  );

ALTER TABLE public.solicitudes_alta_personal
  VALIDATE CONSTRAINT solicitudes_metadata_sin_secretos;

ALTER TABLE public.solicitudes_alta_personal
  DROP CONSTRAINT IF EXISTS solicitudes_correo_institucional_sase;

-- NOT VALID evita bloquear la migración por solicitudes históricas con otro
-- dominio, pero PostgreSQL sí aplica el check a cada alta o actualización nueva.
ALTER TABLE public.solicitudes_alta_personal
  ADD CONSTRAINT solicitudes_correo_institucional_sase
  CHECK (
    correo_institucional ~*
      '^[a-z0-9]+(\.[a-z0-9]+)+@sase\.mx$'
  ) NOT VALID;

DROP POLICY IF EXISTS "Solicitudes nuevas quedan pendientes"
  ON public.solicitudes_alta_personal;

REVOKE INSERT ON public.solicitudes_alta_personal
  FROM anon, authenticated;

REVOKE INSERT (
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
) ON public.solicitudes_alta_personal
  FROM anon, authenticated;

CREATE OR REPLACE FUNCTION private.normalizar_nombre_personal(p_valor text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT pg_catalog.regexp_replace(
    pg_catalog.translate(
      pg_catalog.upper(pg_catalog.btrim(COALESCE(p_valor, ''))),
      'ÁÉÍÓÚÜÑ',
      'AEIOUUN'
    ),
    '[[:space:]]+',
    ' ',
    'g'
  )
$$;

REVOKE ALL ON FUNCTION private.normalizar_nombre_personal(text)
  FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.registrar_solicitud_personal(
  p_rol_declarado text,
  p_turno text,
  p_nombres text,
  p_apellido_paterno text,
  p_apellido_materno text,
  p_curp text,
  p_correo_institucional text,
  p_cct text,
  p_acepta_privacidad boolean,
  p_acepta_etica boolean,
  p_acepta_auditoria boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rol_declarado text :=
    private.normalizar_rol_personal(p_rol_declarado);
  v_roles_oficiales text[];
  v_rol_oficial text;
  v_turno text := pg_catalog.lower(pg_catalog.btrim(p_turno));
  v_nombres text := pg_catalog.upper(pg_catalog.btrim(p_nombres));
  v_apellido_paterno text :=
    pg_catalog.upper(pg_catalog.btrim(p_apellido_paterno));
  v_apellido_materno text :=
    pg_catalog.upper(pg_catalog.btrim(COALESCE(p_apellido_materno, '')));
  v_curp text := pg_catalog.upper(pg_catalog.btrim(p_curp));
  v_correo text :=
    pg_catalog.lower(pg_catalog.btrim(p_correo_institucional));
  v_nombre_orden_directo text;
  v_nombre_orden_nomina text;
  v_folio text;
  v_solicitud_id uuid;
BEGIN
  IF v_rol_declarado IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'La función declarada no admite registro público.';
  END IF;

  IF pg_catalog.length(v_nombres) NOT BETWEEN 1 AND 120
     OR pg_catalog.length(v_apellido_paterno) NOT BETWEEN 1 AND 120
     OR pg_catalog.length(v_apellido_materno) > 120 THEN
    RAISE EXCEPTION USING
      ERRCODE = '22023',
      MESSAGE = 'Los datos de nombre no son válidos.';
  END IF;

  IF v_turno NOT IN ('matutino', 'vespertino', 'mixto') THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'El turno no es válido.';
  END IF;

  IF v_curp !~ '^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$' THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'La CURP no tiene un formato válido.';
  END IF;

  IF v_correo !~ '^[a-z0-9]+(\.[a-z0-9]+)+@sase\.mx$' THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'El correo institucional no tiene un formato válido.';
  END IF;

  IF pg_catalog.upper(pg_catalog.btrim(p_cct)) <> '09DES4310M' THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'La CCT no corresponde a la Secundaria 310.';
  END IF;

  IF NOT COALESCE(p_acepta_privacidad, false)
     OR NOT COALESCE(p_acepta_etica, false)
     OR NOT COALESCE(p_acepta_auditoria, false) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'Faltan consentimientos obligatorios.';
  END IF;

  v_nombre_orden_directo := private.normalizar_nombre_personal(
    v_nombres || ' ' || v_apellido_paterno || ' ' || v_apellido_materno
  );
  v_nombre_orden_nomina := private.normalizar_nombre_personal(
    v_apellido_paterno || ' ' || v_apellido_materno || ' ' || v_nombres
  );

  SELECT pg_catalog.array_agg(
           DISTINCT private.normalizar_rol_personal(oficial.role)
         )
    INTO v_roles_oficiales
  FROM public.personal_oficial AS oficial
  WHERE oficial.is_active
    AND oficial.full_name_normalized = ANY (
      ARRAY[v_nombre_orden_directo, v_nombre_orden_nomina]
    )
    AND private.normalizar_rol_personal(oficial.role) IS NOT NULL;

  IF pg_catalog.cardinality(COALESCE(v_roles_oficiales, '{}'::text[])) <> 1 THEN
    RAISE EXCEPTION USING
      ERRCODE = 'P0001',
      MESSAGE = 'No fue posible validar una adscripción única en la nómina.';
  END IF;

  v_rol_oficial := v_roles_oficiales[1];
  IF v_rol_declarado <> v_rol_oficial THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'La función seleccionada no coincide con la nómina oficial.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.solicitudes_alta_personal AS solicitud
    WHERE solicitud.estado = 'PENDIENTE'
      AND (
        solicitud.curp = v_curp
        OR pg_catalog.lower(solicitud.correo_institucional) = v_correo
      )
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23505',
      MESSAGE = 'Ya existe una solicitud pendiente para estos datos.';
  END IF;

  v_folio := 'REQ-'
    || pg_catalog.to_char(pg_catalog.clock_timestamp(), 'YYYY')
    || '-'
    || pg_catalog.upper(
         pg_catalog.left(
           pg_catalog.replace(pg_catalog.gen_random_uuid()::text, '-', ''),
           12
         )
       );

  INSERT INTO public.solicitudes_alta_personal (
    rol_solicitado,
    turno,
    nombres,
    apellido_paterno,
    apellido_materno,
    curp,
    correo_institucional,
    acepta_privacidad,
    acepta_etica,
    acepta_auditoria,
    estado,
    metadata
  ) VALUES (
    ARRAY[v_rol_oficial],
    v_turno,
    v_nombres,
    v_apellido_paterno,
    v_apellido_materno,
    v_curp,
    v_correo,
    true,
    true,
    true,
    'PENDIENTE',
    pg_catalog.jsonb_build_object(
      'folio_solicitud', v_folio,
      'cct', '09DES4310M',
      'origen', 'WEB_WIZARD',
      'version_registro', '3.11'
    )
  )
  RETURNING id INTO v_solicitud_id;

  INSERT INTO public.auditoria (
    tipo_accion,
    descripcion_accion,
    tabla_objetivo,
    id_registro_objetivo,
    new_values,
    proposito,
    origen
  ) VALUES (
    'SOLICITUD_ALTA_PERSONAL_CREADA',
    'Se creó una solicitud de acceso pendiente de validación institucional.',
    'solicitudes_alta_personal',
    v_solicitud_id::text,
    pg_catalog.jsonb_build_object(
      'estado', 'PENDIENTE',
      'rol_solicitado', v_rol_oficial
    ),
    'Solicitar acceso institucional',
    'servidor'
  );

  RETURN pg_catalog.jsonb_build_object(
    'folio', v_folio,
    'estado', 'PENDIENTE'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.registrar_solicitud_personal(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  boolean,
  boolean,
  boolean
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.registrar_solicitud_personal(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  boolean,
  boolean,
  boolean
) TO service_role;

INSERT INTO public.auditoria (
  tipo_accion,
  descripcion_accion,
  tabla_objetivo,
  proposito,
  origen
) VALUES (
  'MIGRACION_SEGURIDAD',
  'Eliminó secretos legados y reforzó el payload mínimo del registro de personal.',
  'solicitudes_alta_personal',
  'Minimizar datos y evitar secretos de recuperación en solicitudes de acceso',
  'migracion'
);
