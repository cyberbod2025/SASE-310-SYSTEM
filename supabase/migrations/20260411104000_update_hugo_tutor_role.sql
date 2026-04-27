-- =============================================
-- SASE-310: Actualización de perfil Hugo (Docente Tutor) - MAESTRO COMPATIBILIDAD
-- Fecha: 2026-04-11
-- Descripción: Elimina dependencias de índices únicos usando lógica condicional pura.
-- =============================================

-- 1. Perfil Institucional
INSERT INTO public.perfiles_usuario (
    id, rol, nombre_completo, curp, email, materias, grupos, es_tutor, grupo_tutor, estatus
)
SELECT 
    u.id, 'docente_tutor', 'HUGO SANCHEZ RESENDIZ', 'SARH840603HDFNSG02', 
    lower('hugo.sanchezr@aefcm.gob.mx'), ARRAY['Matemáticas'], 
    ARRAY['2º A', '2º B', '2º C', '2º D', '1º D'], true, '2º B', 'aprobado'
FROM auth.users u
WHERE lower(u.email) = lower('hugo.sanchezr@aefcm.gob.mx')
ON CONFLICT (id) DO NOTHING;

/* -- Solicitud de Alta deshabilitada por incompatibilidad de esquema remoto
INSERT INTO public.solicitudes_alta_personal (
    nombres, apellido_paterno, apellido_materno, curp, correo_institucional, 
    rol_solicitado, turno, grupos, es_tutor, grupo_tutor, estado
)
SELECT 
    'HUGO', 'SANCHEZ', 'RESENDIZ', 'SARH840603HDFNSG02', lower('hugo.sanchezr@aefcm.gob.mx'), 
    ARRAY['docente_tutor'], 'matutino', ARRAY['2º A', '2º B', '2º C', '2º D', '1º D'], 
    true, '2º B', 'APROBADA'
WHERE NOT EXISTS (
    SELECT 1 FROM public.solicitudes_alta_personal 
    WHERE correo_institucional = lower('hugo.sanchezr@aefcm.gob.mx')
);
*/
