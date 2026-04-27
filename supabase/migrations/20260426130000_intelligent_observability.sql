-- Migration: SASE-310 Intelligent Observability and Audit
-- OBJETIVO: Sistema de observabilidad, auditoría inteligente y detección de anomalías.

-- 1. Crear tabla audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    actor_id TEXT,
    actor_role TEXT,
    module TEXT,
    action TEXT,
    result TEXT,
    environment TEXT, -- 'production' | 'simulation'
    details JSONB
);

-- 2. Crear tabla sase_alerts
CREATE TABLE IF NOT EXISTS public.sase_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    type TEXT, -- 'anomaly' | 'security' | 'system'
    severity TEXT, -- 'low' | 'medium' | 'high' | 'critical'
    message TEXT,
    actor_id TEXT,
    resolved BOOLEAN DEFAULT false,
    details JSONB
);

-- 3. Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sase_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas para audit_logs
CREATE POLICY "Audit logs are insertable by authenticated users" ON public.audit_logs
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Audit logs are viewable by directivos" ON public.audit_logs
FOR SELECT TO authenticated USING (
    (auth.jwt() ->> 'role')::text = 'directivo' OR 
    (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'directivo'
);

-- Políticas para sase_alerts
CREATE POLICY "Alerts are insertable by authenticated users" ON public.sase_alerts
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Alerts are viewable by all staff" ON public.sase_alerts
FOR SELECT TO authenticated USING (true);

-- 4. Función log_event()
-- Esta función decide si va a audit_logs o smoke_test_logs y detecta anomalías.
CREATE OR REPLACE FUNCTION public.log_event(
    p_module TEXT,
    p_action TEXT,
    p_result TEXT,
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_actor_id TEXT;
    v_actor_role TEXT;
    v_is_simulation BOOLEAN;
    v_env TEXT;
    v_log_id UUID;
    v_denied_count INT;
    v_login_count INT;
BEGIN
    v_actor_id := auth.uid()::text;
    v_is_simulation := (auth.jwt() -> 'app_metadata' ->> 'simulation_mode')::boolean IS TRUE;
    v_env := CASE WHEN v_is_simulation THEN 'simulation' ELSE 'production' END;
    
    -- Obtener rol del usuario
    v_actor_role := (auth.jwt() -> 'app_metadata' ->> 'role')::text;
    IF v_actor_role IS NULL THEN
        v_actor_role := (auth.jwt() ->> 'role')::text;
    END IF;

    -- Redirigir a smoke_test_logs si es simulación y es una acción de smoke
    IF v_is_simulation AND (p_details ->> 'scope' = 'smoke_test' OR p_module = 'SMOKE_TEST') THEN
        INSERT INTO public.smoke_test_logs (
            actor_email,
            action,
            module,
            result,
            details
        ) VALUES (
            (auth.jwt() ->> 'email'),
            p_action,
            p_module,
            p_result,
            p_details
        ) RETURNING id INTO v_log_id;
    ELSE
        INSERT INTO public.audit_logs (
            actor_id,
            actor_role,
            module,
            action,
            result,
            environment,
            details
        ) VALUES (
            v_actor_id,
            v_actor_role,
            p_module,
            p_action,
            p_result,
            v_env,
            p_details
        ) RETURNING id INTO v_log_id;
    END IF;

    -- 5. Detección de anomalías (Requirement 4)
    
    -- Regla: 3 denied seguidos en 5 min
    IF p_result = '403' OR p_result = 'DENIED' THEN
        -- Anti-spam: no generar alerta si ya hay una reciente del mismo tipo
        IF NOT EXISTS (
            SELECT 1 FROM public.sase_alerts 
            WHERE actor_id = v_actor_id 
            AND type = 'anomaly' 
            AND created_at > now() - interval '2 minutes'
        ) THEN
            SELECT count(*) INTO v_denied_count
            FROM public.audit_logs
            WHERE actor_id = v_actor_id
            AND (result = '403' OR result = 'DENIED')
            AND created_at > now() - interval '5 minutes';

            IF v_denied_count >= 3 THEN
                INSERT INTO public.sase_alerts (type, severity, message, actor_id, details)
                VALUES ('anomaly', 'high', 'Detección de 3 denegaciones seguidas en menos de 5 minutos.', v_actor_id, jsonb_build_object('count', v_denied_count));
            END IF;
        END IF;
    END IF;

    -- Regla: 5 intentos de login en 1 min (Fuerza Bruta)
    IF p_action = 'LOGIN' OR p_action = 'LOGIN_FAILURE' THEN
        -- Anti-spam
        IF NOT EXISTS (
            SELECT 1 FROM public.sase_alerts 
            WHERE (actor_id = v_actor_id OR (actor_id IS NULL AND v_actor_id IS NULL))
            AND type = 'security' 
            AND created_at > now() - interval '2 minutes'
        ) THEN
            SELECT count(*) INTO v_login_count
            FROM public.audit_logs
            WHERE (actor_id = v_actor_id OR (actor_id IS NULL AND v_actor_id IS NULL))
            AND (action = 'LOGIN' OR action = 'LOGIN_FAILURE')
            AND created_at > now() - interval '1 minute';

            IF v_login_count >= 5 THEN
                INSERT INTO public.sase_alerts (type, severity, message, actor_id, details)
                VALUES ('security', 'critical', 'Detección de 5 intentos de inicio de sesión en menos de 1 minuto (Fuerza Bruta).', v_actor_id, jsonb_build_object('count', v_login_count));
            END IF;
        END IF;
    END IF;

    -- Regla: acceso a módulo no autorizado
    IF p_action = 'UNAUTHORIZED_MODULE_ACCESS' THEN
        INSERT INTO public.sase_alerts (type, severity, message, actor_id, details)
        VALUES ('security', 'medium', 'Intento de acceso a módulo no autorizado: ' || p_module, v_actor_id, p_details);
    END IF;

    RETURN v_log_id;
END;
$$;

-- Dar permisos
GRANT EXECUTE ON FUNCTION public.log_event TO authenticated;
