-- ======================================================================================
-- SASE-310: SYSTEM ADMIN PROTOCOL (Root Override)
-- Descripción: Despliegue del rol 'system_admin' con bypass global sobre RLS.
-- ======================================================================================

-- 1. Actualizar el CHECK general de roles (si existe en algún lado, aunque suele ser libre o estar en un trigger)
-- Pero por si acaso, dejaremos que perfiles_usuario acepte 'system_admin'.
-- La inserción debe poder procesar 'system_admin'.

-- 2. Modificaciones RLS.
-- La convención en Postgres es que 'system_admin' pueda hacer TODO.
-- En SASE, los roles están en la columna `rol` de `perfiles_usuario` para cada usuario de Auth.

-- Tablas a auditar e incrustar bypass (OR rol = 'system_admin'):
-- perfiles_usuario
-- incidencias
-- expedientes
-- reportes
-- grupos
-- alumnos_oficiales (o 'alumnos' dependiendo del schema real)

-- Vamos a crear funciones de ayuda o usar bloques DO.

DO $$
DECLARE
    row record;
BEGIN
    -- Asegurar que el rol system_admin sea aceptado.
    
    -- perfiles_usuario: POLICY "Bypass System Admin for perfiles_usuario"
    DROP POLICY IF EXISTS "system_admin_all_perfiles" ON public.perfiles_usuario;
    CREATE POLICY "system_admin_all_perfiles" ON public.perfiles_usuario
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.perfiles_usuario pu 
                WHERE pu.id = auth.uid() AND pu.rol = 'system_admin'
            )
        );

    -- incidencias
    DROP POLICY IF EXISTS "system_admin_all_incidencias" ON public.incidencias;
    CREATE POLICY "system_admin_all_incidencias" ON public.incidencias
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.perfiles_usuario pu 
                WHERE pu.id = auth.uid() AND pu.rol = 'system_admin'
            )
        );

    -- asumiendo existencia de la tabla expedientes
    -- DROP POLICY IF EXISTS "system_admin_all_expedientes" ON public.expedientes;
    -- CREATE POLICY "system_admin_all_expedientes" ON public.expedientes
    --    FOR ALL USING (
    --        EXISTS (
    --            SELECT 1 FROM public.perfiles_usuario pu 
    --            WHERE pu.id = auth.uid() AND pu.rol = 'system_admin'
    --        )
    --    );

    -- personal_oficial
    DROP POLICY IF EXISTS "system_admin_all_personal" ON public.personal_oficial;
    CREATE POLICY "system_admin_all_personal" ON public.personal_oficial
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.perfiles_usuario pu 
                WHERE pu.id = auth.uid() AND pu.rol = 'system_admin'
            )
        );
END $$;

-- 3. Crear el usuario administrador root (Si no existe en auth.users, el script asume
-- que se creará vía aplicación o semilla manual, pero podemos intentar inyectarlo 
-- en la tabla perfiles_usuario, o usar semilla)

-- En Supabase, insertar 'auth.users' directamente requiere permisos elevados no garantizados
-- en scripts de migración regulares, pero se hace mediante su API. 
-- Aquí inyectaremos el perfil oficial para un UID conocido, pero lo mejor es crearlo y luego asignarle el rol.
