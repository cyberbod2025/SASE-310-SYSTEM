-- Create an onboarding entry for Professor Hugo Sánchez Resendiz
-- This pre-approves his email/CURP so when he registers, he gets the correct Role/Groups immediately.
-- Or if user already exists, updates it.

-- NOTE: This assumes 'perfiles_usuario' or 'user_profiles' is the target table for permissions.
-- Based on previous context, 'perfiles_usuario' seems to be the main profile table.

INSERT INTO public.perfiles_usuario (
    id, -- This would ideally be the auth.users id, but if user doesn't exist yet, we might need a staging table or handle it upon registration trigger.
        -- For now, let's assume we are inserting into 'solicitudes_alta_personal' to be auto-approved 
        -- OR updating an existing profile if it matches the email.
    rol,
    nombre_completo,
    curp,
    email,
    materias,
    grupos,
    es_tutor,
    grupo_tutor,
    estatus -- Assuming there's a status field
)
VALUES (
    gen_random_uuid(), -- Placeholder, will be linked to auth.uid() upon registration if using a trigger, or we manually update later
    'docente_tutor', -- Combined role
    'HUGO SANCHEZ RESENDIZ',
    'SARH840603HDFNSG02',
    'hugo.sanchezr@aefcm.gob.mx',
    'Matemáticas',
    ARRAY['2º A', '2º B', '2º C', '2º D', '1º D'],
    true,
    '2º B',
    'aprobado'
)
ON CONFLICT (email) DO UPDATE SET
    rol = 'docente_tutor',
    nombre_completo = 'HUGO SANCHEZ RESENDIZ',
    curp = 'SARH840603HDFNSG02',
    materias = 'Matemáticas',
    grupos = ARRAY['2º A', '2º B', '2º C', '2º D', '1º D'],
    es_tutor = true,
    grupo_tutor = '2º B',
    estatus = 'aprobado';

-- Also insert into 'solicitudes_alta_personal' as 'APROBADA' to prevent duplicate requests
INSERT INTO public.solicitudes_alta_personal (
    nombres,
    apellido_paterno,
    apellido_materno,
    curp,
    correo_institucional,
    rol_solicitado,
    grupos,
    es_tutor,
    grupo_tutor,
    estado,
    observaciones_validacion
) VALUES (
    'HUGO',
    'SANCHEZ',
    'RESENDIZ',
    'SARH840603HDFNSG02',
    'hugo.sanchezr@aefcm.gob.mx',
    ARRAY['DOCENTE'],
    ARRAY['2º A', '2º B', '2º C', '2º D', '1º D'],
    true,
    '2º B',
    'APROBADA',
    'Pre-aprobado por sistema (Admin Founder)'
);
