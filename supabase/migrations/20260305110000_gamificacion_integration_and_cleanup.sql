-- =====================================================
-- SASE-310: Gamificación (Islas del Saber) & Higiene
-- Migración: Integración de identidades y creación de vista integral
-- =====================================================

-- 1) ARCHIVADO DE TABLAS LEGACY (Limpieza de Esquema)
-- Siguiendo el plan de auditoría para eliminar ambigüedad
CREATE SCHEMA IF NOT EXISTS archive;

DO $$ 
BEGIN
  -- Mover 'students' (legacy)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'students') THEN
    BEGIN
      ALTER TABLE public.students SET SCHEMA archive;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'No se pudo mover students: %', SQLERRM;
    END;
  END IF;

  -- Mover 'incidents' (legacy)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'incidents') THEN
    BEGIN
      ALTER TABLE public.incidents SET SCHEMA archive;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'No se pudo mover incidents: %', SQLERRM;
    END;
  END IF;

  -- Mover 'sandbox_personas' (legacy)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sandbox_personas') THEN
    BEGIN
      ALTER TABLE public.sandbox_personas SET SCHEMA archive;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'No se pudo mover sandbox_personas: %', SQLERRM;
    END;
  END IF;

  -- Mover 'sandbox_incidencias' (legacy)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sandbox_incidencias') THEN
    BEGIN
      ALTER TABLE public.sandbox_incidencias SET SCHEMA archive;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'No se pudo mover sandbox_incidencias: %', SQLERRM;
    END;
  END IF;
END $$;

-- 2) INTEGRACIÓN GAMIFICACIÓN (Vínculo Estudiante <-> Alumno)
-- Añadir columna de relación si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estudiantes' AND column_name='alumno_id') THEN
    ALTER TABLE public.estudiantes ADD COLUMN alumno_id uuid REFERENCES public.alumnos(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Vincular registros existentes por nombre (coincidencia aproximada de nickname)
UPDATE public.estudiantes e
SET alumno_id = a.id
FROM public.alumnos a
WHERE e.alumno_id IS NULL 
AND (
    LOWER(e.nickname) = LOWER(SPLIT_PART(a.nombre_completo, ' ', 1)) -- Miguel == Miguel Morales
    OR LOWER(e.nickname) = LOWER(a.nombre_completo) 
);

-- 3) VISTA CONSOLIDADA: expediente_integral_alumno
-- Consolida los módulos de SASE-310 en una sola vista de lectura rápida
CREATE OR REPLACE VIEW public.expediente_integral_alumno AS
SELECT 
    a.id AS alumno_id,
    a.nombre_completo AS nombre,
    a.grupo,
    a.grado,
    a.estado_caso,
    -- Conteo de módulos SASE
    (SELECT count(*) FROM public.incidencias WHERE alumno_id = a.id) AS total_incidencias,
    (SELECT count(*) FROM public.atenciones_medicas WHERE alumno_id = a.id) AS total_atenciones_medicas,
    (SELECT count(*) FROM public.justificantes WHERE alumno_id = a.id) AS total_justificantes,
    (SELECT count(*) FROM public.calificaciones WHERE alumno_id = a.id) AS total_calificaciones,
    (SELECT count(*) FROM public.documentos_institucionales WHERE alumno_id = a.id) AS total_documentos,
    
    -- Datos de Gamificación (Islas del Saber)
    COALESCE(e.total_puntos, 0) AS puntos_gamificacion,
    COALESCE(e.escaneos_realizados, 0) AS escaneos_gamificacion,
    e.nickname AS nickname_gamificacion,
    
    -- Socioeconómico (Boolean de existencia)
    EXISTS (SELECT 1 FROM public.socioeconomico_general WHERE alumno_id = a.id) AS tiene_ficha_social
FROM public.alumnos a
LEFT JOIN public.estudiantes e ON e.alumno_id = a.id;

-- 4) AUDITORÍA DE CAMBIOS
INSERT INTO public.auditoria (tipo_accion, descripcion_accion, tabla_objetivo)
VALUES (
    'ACTUALIZACION_ESQUEMA', 
    'Integración de Gamificación (estudiantes -> alumnos) y creación de vista integral. Archivado de tablas legacy (students, incidents, sandbox).', 
    'alumnos'
);

COMMENT ON VIEW public.expediente_integral_alumno IS 'Vista consolidada para reportes institucionales y dashboards de dirección.';
