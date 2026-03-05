-- =====================================================
-- SASE-310: Sistema de Alertas de Riesgo Escolar
-- Migración: Actualización de vista integral y creación de vista de riesgo
-- =====================================================

-- 1) ACTUALIZAR VISTA: expediente_integral_alumno
-- Asegurar que incluya todos los indicadores de vulnerabilidad
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
    (SELECT count(*) FROM public.seguimiento_social WHERE alumno_id = a.id) AS total_social,
    (SELECT count(*) FROM public.registro_lectura WHERE alumno_id = a.id) AS total_lectura,
    (SELECT count(*) FROM public.seguimiento_bap WHERE alumno_id = a.id) AS total_bap,
    
    -- Datos de Gamificación (Islas del Saber)
    COALESCE(e.total_puntos, 0) AS puntos_gamificacion,
    COALESCE(e.escaneos_realizados, 0) AS escaneos_gamificacion,
    e.nickname AS nickname_gamificacion,
    
    -- Socioeconómico (Boolean de existencia)
    EXISTS (SELECT 1 FROM public.socioeconomico_general WHERE alumno_id = a.id) AS tiene_ficha_social
FROM public.alumnos a
LEFT JOIN public.estudiantes e ON e.alumno_id = a.id;

-- 2) CREAR VISTA: alumnos_en_riesgo
-- Filtra y clasifica según la severidad del riesgo
CREATE OR REPLACE VIEW public.alumnos_en_riesgo AS
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

-- 3) AUDITORÍA DE CAMBIOS
INSERT INTO public.auditoria (tipo_accion, descripcion_accion, tabla_objetivo)
VALUES (
    'CREACION_SISTEMA_ALERTAS', 
    'Implementación de lógica de riesgo escolar mediante vistas consolidadas para Dashboard de Dirección.', 
    'alumnos_en_riesgo'
);

COMMENT ON VIEW public.alumnos_en_riesgo IS 'Vista filtrada para detección temprana de alumnos en riesgo institucional.';
