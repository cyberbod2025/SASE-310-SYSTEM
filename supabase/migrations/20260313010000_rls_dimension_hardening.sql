-- ======================================================================================
-- SASE-310: RLS HARDENING & DIMENSION VISIBILITY
-- Descripción: Asegura que Orientación y Trabajo Social puedan ver a los alumnos 
-- para monitorear el semáforo de riesgo y sus nuevas dimensiones.
-- ======================================================================================

DO $$
BEGIN
    -- 1. Actualizar política de lectura de Alumnos para incluir Orientación y Trabajo Social
    -- Estas figuras necesitan visibilidad global para seguimiento preventivo.
    DROP POLICY IF EXISTS "Directivos ven todo" ON public.alumnos;
    CREATE POLICY "Staff Institucional ve todo" ON public.alumnos
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role::text IN (
            'directivo', 'subdireccion', 'secretaria', 'prefectura', 
            'orientacion', 'trabajo_social', 'admin', 'developer', 'system_admin'
        )
      )
      OR
      EXISTS (
        SELECT 1 FROM public.perfiles_usuario
        WHERE perfiles_usuario.id = auth.uid() 
        AND (
            perfiles_usuario.rol::text IN (
                'directivo', 'subdireccion', 'secretaria', 'prefectura', 
                'orientacion', 'trabajo_social', 'admin', 'developer', 'system_admin'
            )
            OR perfiles_usuario.role::text IN (
                'directivo', 'subdireccion', 'secretaria', 'prefectura', 
                'orientacion', 'trabajo_social', 'admin', 'developer', 'system_admin'
            )
        )
      )
    );

    -- 2. Asegurar que INCIDENCIAS sea visible para los mismos roles
    -- (Nota: Ya existía pero reforzamos consistencia)
    DROP POLICY IF EXISTS "Staff ve incidencias" ON public.incidencias;
    CREATE POLICY "Staff Institucional ve incidencias" ON public.incidencias
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role::text IN (
            'directivo', 'subdireccion', 'secretaria', 'prefectura', 
            'orientacion', 'trabajo_social', 'admin', 'developer', 'system_admin'
        )
      )
      OR
      EXISTS (
        SELECT 1 FROM public.perfiles_usuario p
        WHERE p.id = auth.uid() 
        AND (
            p.rol::text IN (
                'directivo', 'subdireccion', 'secretaria', 'prefectura', 
                'orientacion', 'trabajo_social', 'admin', 'developer', 'system_admin'
            )
            OR p.role::text IN (
                'directivo', 'subdireccion', 'secretaria', 'prefectura', 
                'orientacion', 'trabajo_social', 'admin', 'developer', 'system_admin'
            )
        )
      )
      OR (reportado_por = auth.uid())
    );

END $$;

-- 3. Log de auditoría del hardening
INSERT INTO public.auditoria (tipo_accion, descripcion_accion, tabla_objetivo)
VALUES ('RLS_HARDENING_V2', 'Visibilidad global extendida a Orientación y Trabajo Social para semáforo.', 'alumnos');
