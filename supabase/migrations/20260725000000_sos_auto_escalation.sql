-- ============================================================================
-- FASE 1.5: Motor de Auto-Escalamiento de Alertas SOS
-- 
-- Regla SASE: Si nadie responde, el sistema escala solo.
--
-- Cadena de escalamiento:
--   T+0    → SOS creado, Prefectura notificada
--   T+1min → Si no hay ACK → Orientacion notificada
--   T+2min → Si no hay ACK → Direccion notificada
--   T+3min → Si no hay ACK → BROADCAST a todos los roles criticos
-- ============================================================================

-- 1. Tabla de alertas SOS con estado de escalamiento
CREATE TABLE IF NOT EXISTS public.sos_alerts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by      UUID REFERENCES auth.users(id),
    reporter_name   TEXT NOT NULL DEFAULT 'Sistema SASE',
    reporter_role   TEXT NOT NULL DEFAULT 'SISTEMA',
    student_id      UUID REFERENCES public.alumnos(id),
    student_name    TEXT,
    context         TEXT,
    
    -- Estado de escalamiento
    escalation_level INTEGER NOT NULL DEFAULT 0,
    -- 0 = creado (Prefectura notificada)
    -- 1 = escalado a Orientacion
    -- 2 = escalado a Direccion  
    -- 3 = broadcast institucional
    
    acknowledged_at  TIMESTAMPTZ,
    acknowledged_by  UUID REFERENCES auth.users(id),
    resolved_at      TIMESTAMPTZ,
    resolved_by      UUID REFERENCES auth.users(id),
    resolution_notes TEXT,
    
    -- Timestamps de cada escalamiento
    escalated_to_orientacion_at TIMESTAMPTZ,
    escalated_to_direccion_at   TIMESTAMPTZ,
    broadcast_at                TIMESTAMPTZ
);

-- Indices para consultas del cron
CREATE INDEX IF NOT EXISTS idx_sos_alerts_pending 
    ON public.sos_alerts (acknowledged_at) 
    WHERE acknowledged_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sos_alerts_created 
    ON public.sos_alerts (created_at DESC);

-- RLS
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;

-- Politica: roles institucionales pueden ver alertas
CREATE POLICY "sos_alerts_read_institutional" ON public.sos_alerts
    FOR SELECT
    USING (true);

-- Politica: usuarios autenticados pueden crear alertas
CREATE POLICY "sos_alerts_insert_authenticated" ON public.sos_alerts
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Politica: roles institucionales pueden actualizar (ACK/resolver)
CREATE POLICY "sos_alerts_update_institutional" ON public.sos_alerts
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- 2. Funcion de auto-escalamiento
CREATE OR REPLACE FUNCTION public.auto_escalate_sos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    alert_record RECORD;
    elapsed_seconds INTEGER;
    notification_title TEXT;
    notification_message TEXT;
BEGIN
    FOR alert_record IN
        SELECT *
        FROM public.sos_alerts
        WHERE acknowledged_at IS NULL
          AND resolved_at IS NULL
        ORDER BY created_at ASC
    LOOP
        elapsed_seconds := EXTRACT(EPOCH FROM (now() - alert_record.created_at))::INTEGER;

        -- Nivel 1: +60s sin ACK → Orientacion
        IF elapsed_seconds >= 60 
           AND alert_record.escalation_level < 1 
           AND alert_record.escalated_to_orientacion_at IS NULL 
        THEN
            notification_title := 'SOS SIN RESPUESTA - ESCALAMIENTO AUTOMATICO';
            notification_message := format(
                'ALERTA SOS de %s sin atender (%s seg). Alumno: %s. Contexto: %s',
                alert_record.reporter_name,
                elapsed_seconds,
                COALESCE(alert_record.student_name, 'No especificado'),
                COALESCE(alert_record.context, 'Sin contexto')
            );

            INSERT INTO public.notificaciones (titulo, mensaje, tipo, rol_destino)
            VALUES (notification_title, notification_message, 'error', 'ORIENTACION');

            UPDATE public.sos_alerts 
            SET escalation_level = 1,
                escalated_to_orientacion_at = now()
            WHERE id = alert_record.id;
        END IF;

        -- Nivel 2: +120s sin ACK → Direccion
        IF elapsed_seconds >= 120 
           AND alert_record.escalation_level < 2 
           AND alert_record.escalated_to_direccion_at IS NULL 
        THEN
            notification_title := 'ALERTA CRITICA - DIRECCION REQUERIDA';
            notification_message := format(
                'SOS ACTIVO %s min sin respuesta. Reporto: %s (%s). Alumno: %s. ACCION INMEDIATA REQUERIDA.',
                (elapsed_seconds / 60),
                alert_record.reporter_name,
                alert_record.reporter_role,
                COALESCE(alert_record.student_name, 'No especificado')
            );

            INSERT INTO public.notificaciones (titulo, mensaje, tipo, rol_destino)
            VALUES (notification_title, notification_message, 'error', 'DIRECTIVO');

            UPDATE public.sos_alerts 
            SET escalation_level = 2,
                escalated_to_direccion_at = now()
            WHERE id = alert_record.id;
        END IF;

        -- Nivel 3: +180s sin ACK → BROADCAST a todos
        IF elapsed_seconds >= 180 
           AND alert_record.escalation_level < 3 
           AND alert_record.broadcast_at IS NULL 
        THEN
            notification_title := 'BROADCAST INSTITUCIONAL - SOS NO ATENDIDO';
            notification_message := format(
                'EMERGENCIA: SOS de %s lleva %s min sin respuesta. Alumno: %s. TODOS LOS DEPARTAMENTOS DEBEN VERIFICAR.',
                alert_record.reporter_name,
                (elapsed_seconds / 60),
                COALESCE(alert_record.student_name, 'No especificado')
            );

            INSERT INTO public.notificaciones (titulo, mensaje, tipo, rol_destino)
            VALUES 
                (notification_title, notification_message, 'error', 'PREFECTURA'),
                (notification_title, notification_message, 'error', 'ORIENTACION'),
                (notification_title, notification_message, 'error', 'DIRECTIVO'),
                (notification_title, notification_message, 'error', 'TRABAJO_SOCIAL'),
                (notification_title, notification_message, 'error', 'MEDICO_ESCOLAR'),
                (notification_title, notification_message, 'error', 'SUBDIRECCION');

            UPDATE public.sos_alerts 
            SET escalation_level = 3,
                broadcast_at = now()
            WHERE id = alert_record.id;
        END IF;
    END LOOP;
END;
$$;

-- 3. Activar pg_cron para ejecutar cada minuto
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
    ) THEN
        PERFORM cron.unschedule('sase_sos_auto_escalate');
        
        PERFORM cron.schedule(
            'sase_sos_auto_escalate',
            '* * * * *',
            'SELECT public.auto_escalate_sos()'
        );
    END IF;
END;
$$;

-- 4. Trigger: auto-resolver alertas previas del mismo estudiante cuando llega un ACK
CREATE OR REPLACE FUNCTION public.auto_resolve_previous_sos()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.acknowledged_at IS NOT NULL AND OLD.acknowledged_at IS NULL THEN
        UPDATE public.sos_alerts
        SET resolved_at = now(),
            resolved_by = NEW.acknowledged_by,
            resolution_notes = 'Auto-resuelto: SOS posterior fue atendido'
        WHERE student_id = NEW.student_id
          AND id != NEW.id
          AND resolved_at IS NULL
          AND acknowledged_at IS NULL;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_resolve_sos
    AFTER UPDATE ON public.sos_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_resolve_previous_sos();

-- 5. Restricciones de ejecucion
REVOKE ALL ON FUNCTION public.auto_escalate_sos() FROM anon, public;
REVOKE ALL ON FUNCTION public.auto_resolve_previous_sos() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.auto_escalate_sos() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auto_resolve_previous_sos() TO authenticated;

-- 6. Comentarios
COMMENT ON TABLE public.sos_alerts IS 'Registro de alertas SOS con escalamiento automatico progresivo';
COMMENT ON FUNCTION public.auto_escalate_sos() IS 'Motor de auto-escalamiento: verifica SOS sin ACK y genera notificaciones progresivas cada minuto';
