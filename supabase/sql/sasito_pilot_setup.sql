-- ==============================================================================
-- SASE-310: Preparación de datos para piloto Sasito
-- Archivo manual para ejecutar en Supabase SQL Editor.
-- Uso recomendado: entorno de prueba o piloto controlado.
-- No agregar este script al flujo automático de migraciones porque abre lectura
-- general sobre tablas específicas para facilitar validación funcional.
-- ==============================================================================

-- 0. Validaciones de prerrequisitos base
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'alumnos'
  ) THEN
    RAISE EXCEPTION
      'No existe public.alumnos. Ejecuta primero las migraciones base de SASE-310 antes de habilitar el piloto Sasito.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
  ) THEN
    RAISE EXCEPTION
      'No existe public.profiles. El piloto Sasito requiere el esquema institucional de perfiles.';
  END IF;
END $$;

-- 1. Compatibilidad estructural de incidencias
CREATE TABLE IF NOT EXISTS public.incidencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id uuid REFERENCES public.alumnos(id) ON DELETE CASCADE,
  reportado_por uuid REFERENCES public.profiles(id),
  tipo text NOT NULL DEFAULT 'otro',
  descripcion text NOT NULL DEFAULT 'Registro piloto Sasito',
  nivel_gravedad integer DEFAULT 1,
  gravedad text DEFAULT 'leve',
  fecha timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  creado_en timestamptz DEFAULT now()
);

ALTER TABLE public.incidencias
  ADD COLUMN IF NOT EXISTS alumno_id uuid REFERENCES public.alumnos(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS reportado_por uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS tipo text DEFAULT 'otro',
  ADD COLUMN IF NOT EXISTS descripcion text DEFAULT 'Registro piloto Sasito',
  ADD COLUMN IF NOT EXISTS nivel_gravedad integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS gravedad text DEFAULT 'leve',
  ADD COLUMN IF NOT EXISTS fecha timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS creado_en timestamptz DEFAULT now();

ALTER TABLE public.incidencias
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN creado_en SET DEFAULT now(),
  ALTER COLUMN fecha SET DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'incidencias_gravedad_check'
      AND conrelid = 'public.incidencias'::regclass
  ) THEN
    ALTER TABLE public.incidencias
      ADD CONSTRAINT incidencias_gravedad_check
      CHECK (gravedad IN ('leve', 'media', 'grave', 'critica'));
  END IF;
END $$;

UPDATE public.incidencias
SET gravedad = CASE
  WHEN nivel_gravedad IS NULL THEN 'leve'
  WHEN nivel_gravedad <= 1 THEN 'leve'
  WHEN nivel_gravedad = 2 THEN 'media'
  WHEN nivel_gravedad = 3 THEN 'grave'
  ELSE 'critica'
END
WHERE gravedad IS NULL;

UPDATE public.incidencias
SET nivel_gravedad = CASE lower(COALESCE(gravedad, 'leve'))
  WHEN 'leve' THEN 1
  WHEN 'media' THEN 2
  WHEN 'grave' THEN 3
  WHEN 'critica' THEN 3
  ELSE 1
END
WHERE nivel_gravedad IS NULL;

UPDATE public.incidencias
SET fecha = COALESCE(fecha, created_at, creado_en, now())
WHERE fecha IS NULL;

UPDATE public.incidencias
SET created_at = COALESCE(created_at, fecha, creado_en, now())
WHERE created_at IS NULL;

UPDATE public.incidencias
SET creado_en = COALESCE(creado_en, created_at, fecha, now())
WHERE creado_en IS NULL;

-- 2. Compatibilidad estructural de calificaciones
CREATE TABLE IF NOT EXISTS public.calificaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id uuid REFERENCES public.alumnos(id) ON DELETE CASCADE,
  materia text NOT NULL,
  promedio numeric(5,2),
  trimestre1 numeric(5,2),
  trimestre2 numeric(5,2),
  trimestre3 numeric(5,2),
  promedio_final numeric(5,2),
  ciclo_escolar text,
  created_at timestamptz DEFAULT now(),
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now(),
  UNIQUE (alumno_id, materia)
);

ALTER TABLE public.calificaciones
  ADD COLUMN IF NOT EXISTS alumno_id uuid REFERENCES public.alumnos(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS materia text,
  ADD COLUMN IF NOT EXISTS promedio numeric(5,2),
  ADD COLUMN IF NOT EXISTS trimestre1 numeric(5,2),
  ADD COLUMN IF NOT EXISTS trimestre2 numeric(5,2),
  ADD COLUMN IF NOT EXISTS trimestre3 numeric(5,2),
  ADD COLUMN IF NOT EXISTS promedio_final numeric(5,2),
  ADD COLUMN IF NOT EXISTS ciclo_escolar text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS creado_en timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS actualizado_en timestamptz DEFAULT now();

ALTER TABLE public.calificaciones
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN creado_en SET DEFAULT now(),
  ALTER COLUMN actualizado_en SET DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.calificaciones'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) ILIKE '%UNIQUE (alumno_id, materia)%'
  ) THEN
    ALTER TABLE public.calificaciones
      ADD CONSTRAINT calificaciones_alumno_materia_unique
      UNIQUE (alumno_id, materia);
  END IF;
END $$;

UPDATE public.calificaciones
SET promedio = COALESCE(
  promedio,
  promedio_final,
  ROUND(
    (
      COALESCE(trimestre1, 0) +
      COALESCE(trimestre2, 0) +
      COALESCE(trimestre3, 0)
    ) /
    NULLIF(
      (CASE WHEN trimestre1 IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN trimestre2 IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN trimestre3 IS NOT NULL THEN 1 ELSE 0 END),
      0
    ),
    2
  )
)
WHERE promedio IS NULL;

UPDATE public.calificaciones
SET promedio_final = COALESCE(
  promedio_final,
  promedio,
  ROUND(
    (
      COALESCE(trimestre1, 0) +
      COALESCE(trimestre2, 0) +
      COALESCE(trimestre3, 0)
    ) /
    NULLIF(
      (CASE WHEN trimestre1 IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN trimestre2 IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN trimestre3 IS NOT NULL THEN 1 ELSE 0 END),
      0
    ),
    2
  )
)
WHERE promedio_final IS NULL;

UPDATE public.calificaciones
SET created_at = COALESCE(created_at, creado_en, actualizado_en, now())
WHERE created_at IS NULL;

UPDATE public.calificaciones
SET creado_en = COALESCE(creado_en, created_at, now())
WHERE creado_en IS NULL;

UPDATE public.calificaciones
SET actualizado_en = COALESCE(actualizado_en, created_at, creado_en, now())
WHERE actualizado_en IS NULL;

-- 3. Sincronizadores defensivos para compatibilidad de campos
CREATE OR REPLACE FUNCTION public.fn_sasito_sync_incidencias_compat()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.gravedad IS NULL THEN
    NEW.gravedad := CASE
      WHEN COALESCE(NEW.nivel_gravedad, 1) <= 1 THEN 'leve'
      WHEN NEW.nivel_gravedad = 2 THEN 'media'
      WHEN NEW.nivel_gravedad = 3 THEN 'grave'
      ELSE 'critica'
    END;
  END IF;

  IF NEW.nivel_gravedad IS NULL THEN
    NEW.nivel_gravedad := CASE lower(COALESCE(NEW.gravedad, 'leve'))
      WHEN 'leve' THEN 1
      WHEN 'media' THEN 2
      WHEN 'grave' THEN 3
      WHEN 'critica' THEN 3
      ELSE 1
    END;
  END IF;

  IF NEW.tipo IS NULL OR btrim(NEW.tipo::text) = '' THEN
    NEW.tipo := 'otro';
  END IF;

  IF NEW.descripcion IS NULL OR btrim(NEW.descripcion) = '' THEN
    NEW.descripcion := 'Registro piloto Sasito';
  END IF;

  NEW.fecha := COALESCE(NEW.fecha, NEW.created_at, NEW.creado_en, now());
  NEW.created_at := COALESCE(NEW.created_at, NEW.fecha, NEW.creado_en, now());
  NEW.creado_en := COALESCE(NEW.creado_en, NEW.created_at, NEW.fecha, now());

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sasito_sync_incidencias_compat ON public.incidencias;
CREATE TRIGGER tr_sasito_sync_incidencias_compat
BEFORE INSERT OR UPDATE ON public.incidencias
FOR EACH ROW
EXECUTE FUNCTION public.fn_sasito_sync_incidencias_compat();

CREATE OR REPLACE FUNCTION public.fn_sasito_sync_calificaciones_compat()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_suma numeric(8,2) := 0;
  v_conteo integer := 0;
  v_promedio numeric(5,2);
BEGIN
  IF NEW.trimestre1 IS NOT NULL THEN
    v_suma := v_suma + NEW.trimestre1;
    v_conteo := v_conteo + 1;
  END IF;

  IF NEW.trimestre2 IS NOT NULL THEN
    v_suma := v_suma + NEW.trimestre2;
    v_conteo := v_conteo + 1;
  END IF;

  IF NEW.trimestre3 IS NOT NULL THEN
    v_suma := v_suma + NEW.trimestre3;
    v_conteo := v_conteo + 1;
  END IF;

  IF v_conteo > 0 THEN
    v_promedio := ROUND(v_suma / v_conteo, 2);
  END IF;

  IF NEW.promedio IS NULL AND NEW.promedio_final IS NULL AND v_promedio IS NOT NULL THEN
    NEW.promedio := v_promedio;
    NEW.promedio_final := v_promedio;
  ELSIF NEW.promedio IS NULL AND NEW.promedio_final IS NOT NULL THEN
    NEW.promedio := ROUND(NEW.promedio_final, 2);
  ELSIF NEW.promedio_final IS NULL AND NEW.promedio IS NOT NULL THEN
    NEW.promedio_final := ROUND(NEW.promedio, 2);
  ELSIF NEW.promedio IS NOT NULL AND NEW.promedio_final IS NOT NULL THEN
    NEW.promedio := ROUND(NEW.promedio, 2);
    NEW.promedio_final := ROUND(NEW.promedio_final, 2);
  ELSIF v_promedio IS NOT NULL THEN
    NEW.promedio := COALESCE(NEW.promedio, v_promedio);
    NEW.promedio_final := COALESCE(NEW.promedio_final, NEW.promedio, v_promedio);
  END IF;

  NEW.created_at := COALESCE(NEW.created_at, NEW.creado_en, now());
  NEW.creado_en := COALESCE(NEW.creado_en, NEW.created_at, now());
  NEW.actualizado_en := now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sasito_sync_calificaciones_compat ON public.calificaciones;
CREATE TRIGGER tr_sasito_sync_calificaciones_compat
BEFORE INSERT OR UPDATE ON public.calificaciones
FOR EACH ROW
EXECUTE FUNCTION public.fn_sasito_sync_calificaciones_compat();

-- 4. Datos piloto mínimos para Sasito
DO $$
DECLARE
  v_actor_id uuid;
  v_role_expr text;
  v_name_column text;
  v_alumno_1 uuid;
  v_alumno_2 uuid;
  v_alumno_3 uuid;
BEGIN
  SELECT p.id
  INTO v_actor_id
  FROM public.profiles p
  ORDER BY p.created_at NULLS LAST, p.id
  LIMIT 1;

  IF v_actor_id IS NULL THEN
    SELECT CASE
      WHEN data_type = 'USER-DEFINED' AND udt_name = 'app_role' THEN '''prefectura''::public.app_role'
      ELSE quote_literal('prefectura')
    END
    INTO v_role_expr
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'role';

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'full_name'
    ) THEN
      v_name_column := 'full_name';
    ELSIF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'nombre'
    ) THEN
      v_name_column := 'nombre';
    ELSE
      v_name_column := NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
      IF v_name_column IS NULL THEN
        EXECUTE format(
          'INSERT INTO public.profiles (id, role)
           SELECT id, %s
           FROM auth.users
           ORDER BY created_at NULLS LAST, id
           LIMIT 1
           ON CONFLICT (id) DO NOTHING',
          COALESCE(v_role_expr, quote_literal('prefectura'))
        );
      ELSE
        EXECUTE format(
          'INSERT INTO public.profiles (id, %1$I, role)
           SELECT id,
                  COALESCE(NULLIF(raw_user_meta_data->>''full_name'', ''''), email, ''SASITO PILOTO''),
                  %2$s
           FROM auth.users
           ORDER BY created_at NULLS LAST, id
           LIMIT 1
           ON CONFLICT (id) DO UPDATE
           SET %1$I = EXCLUDED.%1$I,
               role = EXCLUDED.role',
          v_name_column,
          COALESCE(v_role_expr, quote_literal('prefectura'))
        );
      END IF;
    END IF;

    SELECT p.id
    INTO v_actor_id
    FROM public.profiles p
    ORDER BY p.created_at NULLS LAST, p.id
    LIMIT 1;
  END IF;

  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION
      'No fue posible encontrar ni derivar un perfil institucional para sembrar incidencias piloto. Crea al menos un usuario en auth.users o un perfil en public.profiles.';
  END IF;

  INSERT INTO public.alumnos (
    curp,
    matricula,
    nombre_completo,
    grado,
    grupo,
    estado_caso
  ) VALUES
    ('SAPA100101HDFRLA01', 'SASITO-0001', 'ALMA PILOTO SASITO', 2, 'A', 'observado'),
    ('SAPB100102MDFRLB02', 'SASITO-0002', 'BRUNO PILOTO SASITO', 2, 'B', 'seguimiento'),
    ('SAPC100103HDFRLC03', 'SASITO-0003', 'CARLA PILOTO SASITO', 3, 'A', 'observado')
  ON CONFLICT (matricula) DO UPDATE
  SET
    curp = EXCLUDED.curp,
    nombre_completo = EXCLUDED.nombre_completo,
    grado = EXCLUDED.grado,
    grupo = EXCLUDED.grupo,
    estado_caso = EXCLUDED.estado_caso;

  SELECT id INTO v_alumno_1 FROM public.alumnos WHERE matricula = 'SASITO-0001';
  SELECT id INTO v_alumno_2 FROM public.alumnos WHERE matricula = 'SASITO-0002';
  SELECT id INTO v_alumno_3 FROM public.alumnos WHERE matricula = 'SASITO-0003';

  INSERT INTO public.incidencias (
    id,
    alumno_id,
    reportado_por,
    tipo,
    descripcion,
    nivel_gravedad,
    gravedad,
    fecha,
    created_at,
    creado_en
  ) VALUES
    (
      '0d55c4f8-02f4-4d0d-8d8d-2a5fe7fd1001',
      v_alumno_1,
      v_actor_id,
      'retardo',
      'Registro piloto Sasito: retardo reiterado para validar lectura básica de incidencias.',
      1,
      'leve',
      now() - interval '5 days',
      now() - interval '5 days',
      now() - interval '5 days'
    ),
    (
      '0d55c4f8-02f4-4d0d-8d8d-2a5fe7fd1002',
      v_alumno_1,
      v_actor_id,
      'conducta',
      'Registro piloto Sasito: incidente conductual de severidad media para pruebas analíticas.',
      2,
      'media',
      now() - interval '3 days',
      now() - interval '3 days',
      now() - interval '3 days'
    ),
    (
      '0d55c4f8-02f4-4d0d-8d8d-2a5fe7fd1003',
      v_alumno_2,
      v_actor_id,
      'academica',
      'Registro piloto Sasito: bajo rendimiento persistente en dos asignaturas.',
      3,
      'grave',
      now() - interval '2 days',
      now() - interval '2 days',
      now() - interval '2 days'
    ),
    (
      '0d55c4f8-02f4-4d0d-8d8d-2a5fe7fd1004',
      v_alumno_2,
      v_actor_id,
      'socioemocional',
      'Registro piloto Sasito: alerta crítica para verificar clasificación máxima de riesgo.',
      3,
      'critica',
      now() - interval '1 day',
      now() - interval '1 day',
      now() - interval '1 day'
    ),
    (
      '0d55c4f8-02f4-4d0d-8d8d-2a5fe7fd1005',
      v_alumno_3,
      v_actor_id,
      'uniforme',
      'Registro piloto Sasito: reincidencia grave para análisis comparativo entre alumnos.',
      3,
      'grave',
      now(),
      now(),
      now()
    )
  ON CONFLICT (id) DO UPDATE
  SET
    alumno_id = EXCLUDED.alumno_id,
    reportado_por = EXCLUDED.reportado_por,
    tipo = EXCLUDED.tipo,
    descripcion = EXCLUDED.descripcion,
    nivel_gravedad = EXCLUDED.nivel_gravedad,
    gravedad = EXCLUDED.gravedad,
    fecha = EXCLUDED.fecha,
    created_at = EXCLUDED.created_at,
    creado_en = EXCLUDED.creado_en;

  INSERT INTO public.calificaciones (
    alumno_id,
    materia,
    promedio,
    trimestre1,
    trimestre2,
    trimestre3,
    promedio_final,
    ciclo_escolar,
    created_at,
    creado_en,
    actualizado_en
  ) VALUES
    (v_alumno_1, 'Matemáticas', 5.20, 5.00, 5.10, 5.50, 5.20, '2025-2026', now(), now(), now()),
    (v_alumno_1, 'Español', 5.80, 5.50, 5.80, 6.10, 5.80, '2025-2026', now(), now(), now()),
    (v_alumno_1, 'Ciencias', 7.10, 7.00, 7.20, 7.10, 7.10, '2025-2026', now(), now(), now()),
    (v_alumno_2, 'Matemáticas', 4.90, 4.80, 5.00, 4.90, 4.90, '2025-2026', now(), now(), now()),
    (v_alumno_2, 'Inglés', 5.60, 5.40, 5.70, 5.70, 5.60, '2025-2026', now(), now(), now()),
    (v_alumno_2, 'Historia', 6.80, 6.70, 6.80, 6.90, 6.80, '2025-2026', now(), now(), now()),
    (v_alumno_3, 'Física', 5.50, 5.30, 5.60, 5.60, 5.50, '2025-2026', now(), now(), now()),
    (v_alumno_3, 'Química', 4.70, 4.50, 4.80, 4.80, 4.70, '2025-2026', now(), now(), now()),
    (v_alumno_3, 'Formación Cívica', 7.20, 7.00, 7.30, 7.30, 7.20, '2025-2026', now(), now(), now())
  ON CONFLICT (alumno_id, materia) DO UPDATE
  SET
    promedio = EXCLUDED.promedio,
    trimestre1 = EXCLUDED.trimestre1,
    trimestre2 = EXCLUDED.trimestre2,
    trimestre3 = EXCLUDED.trimestre3,
    promedio_final = EXCLUDED.promedio_final,
    ciclo_escolar = EXCLUDED.ciclo_escolar,
    actualizado_en = now();
END $$;

-- 5. RLS de lectura abierta para entorno de prueba
ALTER TABLE public.incidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calificaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read all" ON public.incidencias;
CREATE POLICY "Allow read all"
ON public.incidencias
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow read all" ON public.calificaciones;
CREATE POLICY "Allow read all"
ON public.calificaciones
FOR SELECT
USING (true);

-- 6. Validación final visible en SQL Editor
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    (table_name = 'incidencias' AND column_name IN ('id', 'alumno_id', 'gravedad', 'created_at')) OR
    (table_name = 'calificaciones' AND column_name IN ('id', 'alumno_id', 'materia', 'promedio'))
  )
ORDER BY table_name, ordinal_position;

SELECT
  'incidencias' AS tabla,
  COUNT(*) AS total_registros,
  COUNT(*) FILTER (WHERE gravedad = 'leve') AS total_leves,
  COUNT(*) FILTER (WHERE gravedad = 'media') AS total_medias,
  COUNT(*) FILTER (WHERE gravedad = 'grave') AS total_graves,
  COUNT(*) FILTER (WHERE gravedad = 'critica') AS total_criticas
FROM public.incidencias
WHERE id IN (
  '0d55c4f8-02f4-4d0d-8d8d-2a5fe7fd1001',
  '0d55c4f8-02f4-4d0d-8d8d-2a5fe7fd1002',
  '0d55c4f8-02f4-4d0d-8d8d-2a5fe7fd1003',
  '0d55c4f8-02f4-4d0d-8d8d-2a5fe7fd1004',
  '0d55c4f8-02f4-4d0d-8d8d-2a5fe7fd1005'
);

SELECT
  a.matricula,
  a.nombre_completo,
  c.materia,
  c.promedio,
  c.promedio_final
FROM public.calificaciones c
JOIN public.alumnos a
  ON a.id = c.alumno_id
WHERE a.matricula IN ('SASITO-0001', 'SASITO-0002', 'SASITO-0003')
ORDER BY a.matricula, c.materia;
