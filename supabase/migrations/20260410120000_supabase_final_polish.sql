-- ==============================================================================
-- SASE-310: UNIFICACIÓN Y AUTOMATIZACIÓN DE AUDITORÍA (BITÁCORA)
-- Fecha: 2026-04-10
-- Objetivo: Unificar los sistemas de auditoría redundantes, automatizar la bitácora
--           mediante triggers y asegurar sincronía en los estados del semáforo.
-- ==============================================================================

-- 1. UNIFICACIÓN DE TABLAS DE AUDITORÍA
-- Migramos la capacidad de 'audit_log' a 'auditoria' para evitar fragmentación.
DO $$ 
DECLARE
    v_has_ip BOOLEAN;
    v_has_ua BOOLEAN;
    v_has_val BOOLEAN;
BEGIN
    -- Asegurar que la columna 'fecha' existe (algunas implementaciones usan 'created_at')
    ALTER TABLE public.auditoria ADD COLUMN IF NOT EXISTS fecha TIMESTAMPTZ DEFAULT NOW();
    
    ALTER TABLE public.auditoria 
        ADD COLUMN IF NOT EXISTS old_values JSONB,
        ADD COLUMN IF NOT EXISTS new_values JSONB,
        ADD COLUMN IF NOT EXISTS ip_address TEXT,
        ADD COLUMN IF NOT EXISTS user_agent TEXT;

    -- Si existe la tabla redundante 'audit_log', mover registros y eliminarla
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_log') THEN
        -- Construir consulta dinámica basada en las columnas que realmente existen en audit_log
        v_has_ip := EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_log' AND column_name = 'ip_address');
        v_has_ua := EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_log' AND column_name = 'user_agent');
        v_has_val := EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_log' AND column_name = 'old_values');

        EXECUTE format('INSERT INTO public.auditoria (
            usuario_id, email_usuario, rol_usuario, tipo_accion, 
            descripcion_accion, tabla_objetivo, id_registro_objetivo, 
            fecha, old_values, new_values, ip_address, user_agent
        )
        SELECT 
            user_id, user_email, user_role, action_type, 
            action_description, target_table, target_record_id::text, 
            COALESCE(created_at, NOW()), %s, %s, %s, %s
        FROM public.audit_log',
        CASE WHEN v_has_val THEN 'old_values' ELSE 'NULL' END,
        CASE WHEN v_has_val THEN 'new_values' ELSE 'NULL' END,
        CASE WHEN v_has_ip THEN 'ip_address' ELSE 'NULL' END,
        CASE WHEN v_has_ua THEN 'user_agent' ELSE 'NULL' END
        );

        DROP TABLE public.audit_log CASCADE;
    END IF;
END $$;

-- 2. FUNCIÓN DE AUDITORÍA AUTOMÁTICA (TRIGGER)
-- Esta función registra cambios de forma transparente en la bitácora.
CREATE OR REPLACE FUNCTION public.fn_automatic_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_user_email TEXT;
    v_user_role TEXT;
    v_action TEXT;
    v_old_data JSONB := NULL;
    v_new_data JSONB := NULL;
BEGIN
    -- Determinar tipo de acción
    IF (TG_OP = 'INSERT') THEN
        v_action := 'CREACION';
        v_new_data := to_jsonb(NEW);
    ELSIF (TG_OP = 'UPDATE') THEN
        v_action := 'ACTUALIZACION';
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
    ELSIF (TG_OP = 'DELETE') THEN
        v_action := 'ELIMINACION';
        v_old_data := to_jsonb(OLD);
    END IF;

    -- Obtener identidad del usuario (si está autenticado)
    IF v_user_id IS NOT NULL THEN
        SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
        v_user_role := public.get_my_role();
    ELSE
        v_user_email := 'SYSTEM/ANONYMOUS';
        v_user_role := 'system';
    END IF;

    -- Insertar en bitácora
    INSERT INTO public.auditoria (
        usuario_id, email_usuario, rol_usuario, tipo_accion, 
        descripcion_accion, tabla_objetivo, id_registro_objetivo, 
        old_values, new_values
    ) VALUES (
        v_user_id, v_user_email, v_user_role, v_action,
        format('%s en tabla %s por %s', v_action, TG_TABLE_NAME, v_user_email),
        TG_TABLE_NAME, 
        CASE WHEN TG_OP = 'DELETE' THEN OLD.id::text ELSE NEW.id::text END,
        v_old_data, v_new_data
    );

    IF (TG_OP = 'DELETE') THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. APLICACIÓN DE TRIGGERS DE BITÁCORA A TABLAS CRÍTICAS
-- Aplicar a Alumnos
DROP TRIGGER IF EXISTS tr_audit_alumnos ON public.alumnos;
CREATE TRIGGER tr_audit_alumnos AFTER INSERT OR UPDATE OR DELETE ON public.alumnos
FOR EACH ROW EXECUTE FUNCTION public.fn_automatic_audit_trigger();

-- Aplicar a Perfiles
DROP TRIGGER IF EXISTS tr_audit_perfiles ON public.perfiles_usuario;
CREATE TRIGGER tr_audit_perfiles AFTER INSERT OR UPDATE OR DELETE ON public.perfiles_usuario
FOR EACH ROW EXECUTE FUNCTION public.fn_automatic_audit_trigger();

-- Aplicar a Incidencias (Unificado)
DROP TRIGGER IF EXISTS trigger_audit_incidencias ON public.incidencias;
CREATE TRIGGER tr_audit_incidencias AFTER INSERT OR UPDATE OR DELETE ON public.incidencias
FOR EACH ROW EXECUTE FUNCTION public.fn_automatic_audit_trigger();

-- Aplicar a Atenciones Médicas
DROP TRIGGER IF EXISTS tr_audit_salud ON public.atenciones_medicas;
CREATE TRIGGER tr_audit_salud AFTER INSERT OR UPDATE OR DELETE ON public.atenciones_medicas
FOR EACH ROW EXECUTE FUNCTION public.fn_automatic_audit_trigger();

-- Aplicar a Seguimientos (Social/BAP)
DROP TRIGGER IF EXISTS tr_audit_social ON public.seguimiento_social;
CREATE TRIGGER tr_audit_social AFTER INSERT OR UPDATE OR DELETE ON public.seguimiento_social
FOR EACH ROW EXECUTE FUNCTION public.fn_automatic_audit_trigger();

-- 4. SINCRONIZACIÓN DE ESTADOS DEL SEMÁFORO
-- Asegura que 'estado_caso' (Enum legado) refleje el 'estado_semaforo' (Text moderno).
CREATE OR REPLACE FUNCTION public.fn_sync_semaphore_states()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado_semaforo IS DISTINCT FROM OLD.estado_semaforo THEN
        CASE NEW.estado_semaforo
            WHEN 'CERRADO' THEN NEW.estado_caso := 'normal'::public.estado_caso_alumno;
            WHEN 'OBSERVADO' THEN NEW.estado_caso := 'observado'::public.estado_caso_alumno;
            WHEN 'INTERVENCION' THEN NEW.estado_caso := 'intervencion'::public.estado_caso_alumno;
            ELSE NEW.estado_caso := 'seguimiento'::public.estado_caso_alumno;
        END CASE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_sync_alumnos_state ON public.alumnos;
CREATE TRIGGER tr_sync_alumnos_state 
    BEFORE UPDATE OF estado_semaforo ON public.alumnos
    FOR EACH ROW EXECUTE FUNCTION public.fn_sync_semaphore_states();

-- 5. SEGURIDAD FINAL: GET_MY_ROLE OPTIMIZADA
-- Asegurar que la función de identidad sea inmutable durante la transacción para performance.
ALTER FUNCTION public.get_my_role() STABLE;

-- 6. COMENTARIOS INSTITUCIONALES
COMMENT ON TABLE public.auditoria IS 'Bitácora central de seguridad SASE-310. Registra automáticamente cambios en entidades críticas.';
COMMENT ON FUNCTION public.calculate_student_risk IS 'Motor de riesgo institucional. No debe ser invocado desde el cliente; se activa por disparadores de incidencias.';
