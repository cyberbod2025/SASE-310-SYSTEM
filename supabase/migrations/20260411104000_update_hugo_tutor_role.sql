-- =============================================
-- SASE-310: Actualización de perfil Hugo (Docente Tutor)
-- Fecha: 2026-04-11
-- =============================================

-- Intentar insertar o actualizar el perfil de Hugo con su rol de tutor y grupos asignados
INSERT INTO public.perfiles_usuario (
    id,
    rol,
    nombre_completo,
    curp,
    email,
    materias,
    grupos,
    es_tutor,
    grupo_tutor,
    estatus
)
VALUES (
    gen_random_uuid(), -- Placeholder, se vincula con auth.uid() al registrarse si existe el trigger
    'docente_tutor',
    'HUGO SANCHEZ RESENDIZ',
    'SARH840603HDFNSG02',
    'hugo.sanchezr@aefcm.gob.mx',
    ARRAY['Matemáticas'],
    ARRAY['2º A', '2º B', '2º C', '2º D', '1º D'],
    true,
    '2º B',
    'aprobado'
)
ON CONFLICT (email) DO UPDATE SET
    rol = 'docente_tutor',
    nombre_completo = 'HUGO SANCHEZ RESENDIZ',
    curp = 'SARH840603HDFNSG02',
    materias = ARRAY['Matemáticas'],
    grupos = ARRAY['2º A', '2º B', '2º C', '2º D', '1º D'],
    es_tutor = true,
    grupo_tutor = '2º B',
    estatus = 'aprobado';

-- También asegurar que la solicitud de alta esté sincronizada
INSERT INTO public.solicitudes_alta_personal (
    nombres,
    apellido_paterno,
    apellido_materno,
    curp,
    correo_institucional,
    rol_solicitado,
    turno,
    grupos,
    es_tutor,
    grupo_tutor,
    estado
)
VALUES (
    'HUGO',
    'SANCHEZ',
    'RESENDIZ',
    'SARH840603HDFNSG02',
    'hugo.sanchezr@aefcm.gob.mx',
    ARRAY['DOCENTE_TUTOR'],
    'matutino',
    ARRAY['2º A', '2º B', '2º C', '2º D', '1º D'],
    true,
    '2º B',
    'APROBADA'
)
ON CONFLICT (correo_institucional) DO UPDATE SET
    estado = 'APROBADA',
    rol_solicitado = ARRAY['DOCENTE_TUTOR'],
    es_tutor = true,
    grupo_tutor = '2º B';
