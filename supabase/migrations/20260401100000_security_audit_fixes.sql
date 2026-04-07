-- ==============================================================================
-- SASE-310: AUDIT SECURITY HARDENING (Supabase Linter Fixes)
-- Fecha: 2026-04-01
-- Objetivo: Resolver vulnerabilidades críticas detectadas por el auditor de Supabase.
-- ==============================================================================

-- 0. IDEMPOTENCIA DE TABLAS DEPENDIENTES
-- Asegurar que 'estudiantes' exista para que la vista integral no falle.
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'estudiantes') THEN
        CREATE TABLE public.estudiantes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            nickname TEXT UNIQUE,
            grado INTEGER,
            total_puntos INTEGER DEFAULT 0,
            escaneos_realizados INTEGER DEFAULT 0,
            alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE
        );
        COMMENT ON TABLE public.estudiantes IS 'Tabla de gamificación (Islas del Saber) creada por el auditor de seguridad para integridad de vistas.';
    END IF;
END $$;

-- 1. HARDENING DE VISTAS (SECURITY DEFINER -> SECURITY INVOKER)
-- PG15+ requiere security_invoker para que las vistas respeten RLS del usuario.

-- 1.1 Expediente Integral del Alumno
DROP VIEW IF EXISTS public.expediente_integral_alumno CASCADE;
CREATE VIEW public.expediente_integral_alumno 
WITH (security_invoker = true) AS
SELECT 
    a.id AS alumno_id,
    a.nombre_completo AS nombre,
    a.grupo,
    a.grado,
    a.estado_caso,
    (SELECT count(*) FROM public.incidencias WHERE alumno_id = a.id) AS total_incidencias,
    (SELECT count(*) FROM public.atenciones_medicas WHERE alumno_id = a.id) AS total_atenciones_medicas,
    (SELECT count(*) FROM public.justificantes WHERE alumno_id = a.id) AS total_justificantes,
    (SELECT count(*) FROM public.calificaciones WHERE alumno_id = a.id) AS total_calificaciones,
    (SELECT count(*) FROM public.seguimiento_social WHERE alumno_id = a.id) AS total_social,
    (SELECT count(*) FROM public.registro_lectura WHERE alumno_id = a.id) AS total_lectura,
    (SELECT count(*) FROM public.seguimiento_bap WHERE alumno_id = a.id) AS total_bap,
    COALESCE(e.total_puntos, 0) AS puntos_gamificacion,
    COALESCE(e.escaneos_realizados, 0) AS escaneos_gamificacion,
    e.nickname AS nickname_gamificacion,
    EXISTS (SELECT 1 FROM public.socioeconomico_general WHERE alumno_id = a.id) AS tiene_ficha_social
FROM public.alumnos a
LEFT JOIN public.estudiantes e ON e.alumno_id = a.id;

-- 1.1b Alumnos en Riesgo (Restablecer después de CASCADE)
-- Se re-crea con security_invoker para mantener la consistencia del blindaje
DROP VIEW IF EXISTS public.alumnos_en_riesgo;
CREATE VIEW public.alumnos_en_riesgo 
WITH (security_invoker = true) AS
SELECT 
    alumno_id,
    nombre,
    grupo,
    total_incidencias,
    total_social,
    total_bap,
    total_calificaciones,
    CASE
        WHEN total_incidencias >= 5 THEN 'ALERTA_CRITICA'
        WHEN total_incidencias >= 3 THEN 'ALERTA_MEDIA'
        WHEN total_social > 0 THEN 'SEGUIMIENTO_SOCIAL'
        WHEN total_bap > 0 THEN 'SEGUIMIENTO_BAP'
        ELSE 'NORMAL'
    END AS nivel_alerta
FROM public.expediente_integral_alumno
WHERE total_incidencias >= 3 
   OR total_social > 0 
   OR total_bap > 0;

-- 1.2 Perfiles Activos
DROP VIEW IF EXISTS public.v_perfiles_activos;
CREATE VIEW public.v_perfiles_activos 
WITH (security_invoker = true) AS
SELECT id,
    COALESCE(full_name, nombre_completo, nombres) AS nombre_completo,
    COALESCE(rol, role) AS rol
FROM ( 
    SELECT profiles.id,
           profiles.full_name,
           profiles.role::text AS role,
           NULL::text AS nombre_completo,
           NULL::text AS nombres,
           profiles.role::text AS rol
    FROM profiles
    UNION ALL
    SELECT perfiles_usuario.id,
           NULL::text,
           NULL::text,
           perfiles_usuario.nombre_completo,
           NULL::text,
           perfiles_usuario.rol
    FROM perfiles_usuario
    WHERE NOT (perfiles_usuario.id IN (SELECT profiles.id FROM profiles))
) sub;

-- 1.3 Data Engine (AI Feed)
DROP VIEW IF EXISTS public.v_data_engine;
CREATE VIEW public.v_data_engine 
WITH (security_invoker = true) AS
SELECT 
    alumno_id,
    COALESCE(fecha, creado_en) AS fecha,
    tipo AS tipo_evento,
    CASE 
        WHEN lower(tipo::text) LIKE '%asistencia%' OR lower(tipo::text) LIKE '%retardo%' THEN 'asistencia'
        WHEN lower(tipo::text) LIKE '%acad%' THEN 'academico'
        WHEN lower(tipo::text) LIKE '%salud%' OR lower(tipo::text) LIKE '%socioemocional%' THEN 'socioemocional'
        ELSE 'disciplina'
    END AS dimension,
    gravedad,
    CASE gravedad
        WHEN 'leve' THEN 1.0
        WHEN 'media' THEN 3.0
        WHEN 'grave' THEN 5.0
        WHEN 'critica' THEN 8.0
        ELSE 1.0
    END AS puntaje_base
FROM public.incidencias;


-- 2. HARDENING DE TABLAS (ENABLE RLS & POLICIES)

-- 2.1 Documentos Institucionales
ALTER TABLE public.documentos_institucionales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Docentes/Staff manage documentos" ON public.documentos_institucionales;
CREATE POLICY "Docentes/Staff manage documentos" 
ON public.documentos_institucionales FOR ALL
TO authenticated
USING (public.get_my_role() IN ('directivo', 'docente', 'docente_tutor', 'prefectura', 'orientacion', 'trabajo_social', 'secretaria'))
WITH CHECK (public.get_my_role() IN ('directivo', 'docente', 'docente_tutor', 'prefectura', 'orientacion', 'trabajo_social', 'secretaria'));

-- 2.2 Colectivo Respuestas Docentes
ALTER TABLE public.colectivo_respuestas_docentes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Docentes/Staff manage colectivo responses" ON public.colectivo_respuestas_docentes;
CREATE POLICY "Docentes/Staff manage colectivo responses" 
ON public.colectivo_respuestas_docentes FOR ALL
TO authenticated
USING (public.get_my_role() IN ('directivo', 'docente', 'docente_tutor', 'prefectura', 'orientacion', 'trabajo_social', 'secretaria'))
WITH CHECK (public.get_my_role() IN ('directivo', 'docente', 'docente_tutor', 'prefectura', 'orientacion', 'trabajo_social', 'secretaria'));

-- 2.3 Personal y Colectivo Personal
ALTER TABLE public.personal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colectivo_personal ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Directivos manage personal" ON public.personal;
CREATE POLICY "Directivos manage personal" 
ON public.personal FOR ALL
TO authenticated
USING (public.get_my_role() IN ('directivo', 'secretaria', 'subdireccion'))
WITH CHECK (public.get_my_role() IN ('directivo', 'secretaria', 'subdireccion'));

DROP POLICY IF EXISTS "Staff view personal" ON public.personal;
CREATE POLICY "Staff view personal" 
ON public.personal FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Directivos manage colectivo personal" ON public.colectivo_personal;
CREATE POLICY "Directivos manage colectivo personal" 
ON public.colectivo_personal FOR ALL
TO authenticated
USING (public.get_my_role() IN ('directivo', 'secretaria', 'subdireccion'))
WITH CHECK (public.get_my_role() IN ('directivo', 'secretaria', 'subdireccion'));


-- 3. AUDITORÍA DEL HARDENING
INSERT INTO public.auditoria (tipo_accion, descripcion_accion, tabla_objetivo)
VALUES ('SECURITY_HARDENING', 'Corrección de vistas SECURITY DEFINER y activación de RLS en tablas institucionales (Lint fixes)', 'database_schema');
