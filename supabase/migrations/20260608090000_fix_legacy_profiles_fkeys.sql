-- =====================================================
-- SASE-310: FIX LEGACY PROFILES FOREIGN KEYS
-- Fecha: 2026-06-08 (Orden)
-- Objetivo: Migrar llaves foraneas de la tabla heredada "profiles" a la tabla unificada "perfiles_usuario"
-- Expediente: specs/008-foreign-key-perfiles-usuario
-- =====================================================

DO $$ 
BEGIN 
    -- 1. INCIDENCIAS
    ALTER TABLE IF EXISTS public.incidencias 
    DROP CONSTRAINT IF EXISTS incidencias_reportado_por_fkey;
    
    ALTER TABLE IF EXISTS public.incidencias 
    ADD CONSTRAINT incidencias_reportado_por_fkey 
    FOREIGN KEY (reportado_por) REFERENCES public.perfiles_usuario(id) ON DELETE CASCADE;

    -- 2. ATENCIONES MEDICAS
    ALTER TABLE IF EXISTS public.atenciones_medicas 
    DROP CONSTRAINT IF EXISTS atenciones_medicas_atendido_por_fkey;
    
    ALTER TABLE IF EXISTS public.atenciones_medicas 
    ADD CONSTRAINT atenciones_medicas_atendido_por_fkey 
    FOREIGN KEY (atendido_por) REFERENCES public.perfiles_usuario(id) ON DELETE CASCADE;

    -- 3. REGISTRO LECTURA
    ALTER TABLE IF EXISTS public.registro_lectura 
    DROP CONSTRAINT IF EXISTS registro_lectura_creado_por_fkey;
    
    ALTER TABLE IF EXISTS public.registro_lectura 
    ADD CONSTRAINT registro_lectura_creado_por_fkey 
    FOREIGN KEY (creado_por) REFERENCES public.perfiles_usuario(id) ON DELETE CASCADE;

    -- 4. SEGUIMIENTO BAP
    ALTER TABLE IF EXISTS public.seguimiento_bap 
    DROP CONSTRAINT IF EXISTS seguimiento_bap_creado_por_fkey;
    
    ALTER TABLE IF EXISTS public.seguimiento_bap 
    ADD CONSTRAINT seguimiento_bap_creado_por_fkey 
    FOREIGN KEY (creado_por) REFERENCES public.perfiles_usuario(id) ON DELETE CASCADE;

    -- 5. SEGUIMIENTO SOCIAL
    ALTER TABLE IF EXISTS public.seguimiento_social 
    DROP CONSTRAINT IF EXISTS seguimiento_social_creado_por_fkey;
    
    ALTER TABLE IF EXISTS public.seguimiento_social 
    ADD CONSTRAINT seguimiento_social_creado_por_fkey 
    FOREIGN KEY (creado_por) REFERENCES public.perfiles_usuario(id) ON DELETE CASCADE;

    -- 6. EVENTOS (Agenda)
    ALTER TABLE IF EXISTS public.eventos 
    DROP CONSTRAINT IF EXISTS eventos_creado_por_fkey;
    
    ALTER TABLE IF EXISTS public.eventos 
    ADD CONSTRAINT eventos_creado_por_fkey 
    FOREIGN KEY (creado_por) REFERENCES public.perfiles_usuario(id) ON DELETE CASCADE;

    -- 7. RESPUESTAS DOCENTES
    ALTER TABLE IF EXISTS public.respuestas_docentes 
    DROP CONSTRAINT IF EXISTS respuestas_docentes_creado_por_fkey;
    
    ALTER TABLE IF EXISTS public.respuestas_docentes 
    ADD CONSTRAINT respuestas_docentes_creado_por_fkey 
    FOREIGN KEY (creado_por) REFERENCES public.perfiles_usuario(id) ON DELETE CASCADE;

    -- 8. COLECTIVO RESPUESTAS DOCENTES
    ALTER TABLE IF EXISTS public.colectivo_respuestas_docentes 
    DROP CONSTRAINT IF EXISTS colectivo_respuestas_docentes_docente_id_fkey;
    
    ALTER TABLE IF EXISTS public.colectivo_respuestas_docentes 
    ADD CONSTRAINT colectivo_respuestas_docentes_docente_id_fkey 
    FOREIGN KEY (docente_id) REFERENCES public.perfiles_usuario(id) ON DELETE CASCADE;

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error al migrar FKeys: %', SQLERRM;
END $$;
