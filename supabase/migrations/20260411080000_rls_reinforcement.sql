-- ==============================================================================
-- SASE-310: REFUERZO DE SEGURIDAD RLS (Fase Final)
-- Fecha: 2026-04-11
-- Objetivo: Activar RLS en todas las tablas que carecen de blindaje y establecer
--           políticas de acceso basadas en roles institucionales.
-- ==============================================================================

-- 1. REFUERZO DE TABLAS BASE
DO $$ 
BEGIN
    -- 1.1 Perfiles de Usuario
    BEGIN
        ALTER TABLE public.perfiles_usuario ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Usuarios ven su propio perfil" ON public.perfiles_usuario;
        CREATE POLICY "Usuarios ven su propio perfil" ON public.perfiles_usuario
            FOR SELECT TO authenticated USING (auth.uid() = id);
        
        DROP POLICY IF EXISTS "Staff ve todos los perfiles" ON public.perfiles_usuario;
        CREATE POLICY "Staff ve todos los perfiles" ON public.perfiles_usuario
            FOR SELECT TO authenticated USING (public.get_my_role() IN ('directivo', 'subdireccion', 'secretaria', 'system_admin'));
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Table perfiles_usuario does not exist, skipping RLS reinforcement.';
    END;

    -- 1.2 Sandbox Alertas
    BEGIN
        ALTER TABLE public.sandbox_alertas ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Staff manage sandbox" ON public.sandbox_alertas;
        CREATE POLICY "Staff manage sandbox" ON public.sandbox_alertas
            FOR ALL TO authenticated USING (public.get_my_role() IS NOT NULL);
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Table sandbox_alertas does not exist, skipping RLS reinforcement.';
    END;

    -- 1.3 Justificantes
    BEGIN
        ALTER TABLE public.justificantes ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Staff manage justificantes" ON public.justificantes;
        CREATE POLICY "Staff manage justificantes" ON public.justificantes
            FOR ALL TO authenticated USING (public.get_my_role() IN ('directivo', 'orientacion', 'docente_tutor', 'secretaria'));
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Table justificantes does not exist, skipping RLS reinforcement.';
    END;

    -- 1.4 Roles y Permisos (Diccionario del sistema)
    BEGIN
        ALTER TABLE public.roles_permisos ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Solo lectura para autenticados" ON public.roles_permisos;
        CREATE POLICY "Solo lectura para autenticados" ON public.roles_permisos
            FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Table roles_permisos does not exist, skipping RLS reinforcement.';
    END;

    -- 1.5 Objetos Retenidos (Prefectura)
    BEGIN
        ALTER TABLE public.objetos_retenidos ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Prefectura manage objetos" ON public.objetos_retenidos;
        CREATE POLICY "Prefectura manage objetos" ON public.objetos_retenidos
            FOR ALL TO authenticated USING (public.get_my_role() IN ('prefectura', 'directivo'));
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Table objetos_retenidos does not exist, skipping RLS reinforcement.';
    END;

    -- 1.6 Estudiantes (Gamificación)
    BEGIN
        ALTER TABLE public.estudiantes ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Staff manage gamificacion" ON public.estudiantes;
        CREATE POLICY "Staff manage gamificacion" ON public.estudiantes
            FOR ALL TO authenticated USING (public.get_my_role() IS NOT NULL);
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Table estudiantes does not exist, skipping RLS reinforcement.';
    END;
END $$;

-- 2. AUDITORÍA DEL REFUERZO
INSERT INTO public.auditoria (tipo_accion, descripcion_accion, tabla_objetivo)
VALUES ('SECURITY_REINFORCEMENT', 'Activación de RLS y políticas base en tablas huérfanas detectadas en auditoría 2026-04-11', 'database_schema');

COMMENT ON TABLE public.perfiles_usuario IS 'Perfiles extendidos de personal SASE. Protegido por RLS.';
COMMENT ON TABLE public.justificantes IS 'Registro de inasistencias justificadas. Solo personal autorizado.';
