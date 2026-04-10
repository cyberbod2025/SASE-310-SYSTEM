-- Semilla/garantía: si el usuario ya existe en auth.users, se actualiza o crea su perfil institucional.
-- Usamos el id de auth.users para no violar FK; si aún no se ha registrado, no insertamos nada aquí.
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
SELECT
    u.id,
    'docente_tutor',
    'HUGO SANCHEZ RESENDIZ',
    'SARH840603HDFNSG02',
    lower('hugo.sanchezr@aefcm.gob.mx'),
    ARRAY['Matemáticas'],
    ARRAY['2º A', '2º B', '2º C', '2º D', '1º D'],
    true,
    '2º B',
    'aprobado'
FROM auth.users u
WHERE lower(u.email) = lower('hugo.sanchezr@aefcm.gob.mx')
ON CONFLICT (id) DO UPDATE SET
    rol = EXCLUDED.rol,
    nombre_completo = EXCLUDED.nombre_completo,
    curp = EXCLUDED.curp,
    email = EXCLUDED.email,
    materias = EXCLUDED.materias,
    grupos = EXCLUDED.grupos,
    es_tutor = EXCLUDED.es_tutor,
    grupo_tutor = EXCLUDED.grupo_tutor,
    estatus = EXCLUDED.estatus;

-- Preaprobar la solicitud institucional para evitar duplicados manuales.
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
    estado,
    observaciones_validacion
)
SELECT
    'HUGO',
    'SANCHEZ',
    'RESENDIZ',
    'SARH840603HDFNSG02',
    lower('hugo.sanchezr@aefcm.gob.mx'),
    ARRAY['DOCENTE'],
    'matutino',
    ARRAY['2º A', '2º B', '2º C', '2º D', '1º D'],
    true,
    '2º B',
    'APROBADA',
    'Pre-aprobado por sistema (Admin Founder)'
WHERE NOT EXISTS (
    SELECT 1 FROM public.solicitudes_alta_personal s
    WHERE lower(s.correo_institucional) = lower('hugo.sanchezr@aefcm.gob.mx')
      AND s.curp = 'SARH840603HDFNSG02'
);
