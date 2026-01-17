-- ==============================================================================
-- BOOTSTRAP SUPER ADMIN (EJECUTAR UNA SOLA VEZ EN SUPABASE SQL EDITOR)
-- ==============================================================================

-- 1. Primero crea el usuario en AUTH > USERS manualmente o usa la funcion admin si tienes acceso.
--    Supongamos que el ID generado es el que pondrás abajo.

-- 2. Define tus variables aqui:
\set admin_uid 'COLOCA_AQUI_EL_UUID_DE_SUPABASE_AUTH'
\set admin_email 'TU_EMAIL_REAL@DOMINIO.COM'

-- 3. Insercion en Tabla Principal (perfiles_usuario)
INSERT INTO public.perfiles_usuario (
    id, 
    email, 
    rol, 
    nombre_completo, 
    matricula_sase,
    estado_cuenta,
    creado_en
) VALUES (
    :'admin_uid',
    :'admin_email',
    'DEVELOPER', -- Este rol activa el acceso Super Admin
    'Super Admin Inicial',
    'SYS-ROOT-001',
    'activo',
    NOW()
) ON CONFLICT (id) DO UPDATE 
SET rol = 'DEVELOPER', estado_cuenta = 'activo';

-- 4. Insercion en Tabla Legacy (profiles) - Solo si el sistema la sigue consultando
INSERT INTO public.profiles (
    id,
    email,
    role,
    full_name
) VALUES (
    :'admin_uid',
    :'admin_email',
    'DEVELOPER',
    'Super Admin Inicial'
) ON CONFLICT (id) DO UPDATE 
SET role = 'DEVELOPER';

-- 5. Confirmación
SELECT * FROM public.perfiles_usuario WHERE id = :'admin_uid';
