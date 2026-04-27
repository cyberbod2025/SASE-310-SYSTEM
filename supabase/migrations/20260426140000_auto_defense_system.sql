-- Migration: SASE-310 Auto-Defense System
-- OBJETIVO: Respuesta automática ante anomalías detectadas.

-- 1. Ampliar perfiles_usuario con métricas de riesgo y estado de seguridad
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfiles_usuario' AND column_name = 'seguridad_status') THEN
        ALTER TABLE public.perfiles_usuario ADD COLUMN seguridad_status TEXT DEFAULT 'active' CHECK (seguridad_status IN ('active', 'restricted', 'blocked'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfiles_usuario' AND column_name = 'risk_score') THEN
        ALTER TABLE public.perfiles_usuario ADD COLUMN risk_score INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfiles_usuario' AND column_name = 'blocked_until') THEN
        ALTER TABLE public.perfiles_usuario ADD COLUMN blocked_until TIMESTAMPTZ;
    END IF;
END $$;

-- 2. Función handle_anomaly_response()
CREATE OR REPLACE FUNCTION public.handle_anomaly_response(
    p_type TEXT,
    p_actor_id TEXT,
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public, auth
AS $$
DECLARE
    v_new_status TEXT;
    v_risk_increment INTEGER;
    v_blocked_until TIMESTAMPTZ := NULL;
    v_user_uuid UUID;
BEGIN
    -- Convertir actor_id a UUID
    IF p_actor_id IS NULL THEN
        RETURN;
    END IF;

    BEGIN
        v_user_uuid := p_actor_id::uuid;
    EXCEPTION WHEN others THEN
        RETURN;
    END;

    -- Lógica de penalización
    CASE p_type
        WHEN 'BRUTE_FORCE' THEN
            v_new_status := 'restricted';
            v_risk_increment := 50;
            v_blocked_until := now() + interval '10 minutes';
        
        WHEN 'anomaly' THEN 
            v_new_status := 'restricted';
            v_risk_increment := 30;
            
        WHEN 'security' THEN 
            v_new_status := 'restricted';
            v_risk_increment := 40;

        WHEN 'UNAUTHORIZED_MODULE_ACCESS' THEN
            v_new_status := 'restricted';
            v_risk_increment := 20;

        ELSE
            v_new_status := NULL;
            v_risk_increment := 5;
    END CASE;

    -- Aplicar cambios
    UPDATE public.perfiles_usuario
    SET 
        seguridad_status = COALESCE(v_new_status, seguridad_status),
        risk_score = LEAST(risk_score + v_risk_increment, 100),
        blocked_until = COALESCE(v_blocked_until, blocked_until),
        updated_at = now()
    WHERE id = v_user_uuid;

    UPDATE public.perfiles_usuario
    SET seguridad_status = 'blocked'
    WHERE id = v_user_uuid AND risk_score >= 100;
    
    -- Registrar en auditoría
    INSERT INTO public.audit_logs (
        actor_id,
        module,
        action,
        result,
        details
    ) VALUES (
        p_actor_id,
        'SECURITY_ENGINE',
        'AUTO_DEFENSE_ACTION',
        'SUCCESS',
        jsonb_build_object(
            'type', p_type,
            'new_status', v_new_status,
            'risk_increment', v_risk_increment,
            'blocked_until', v_blocked_until
        )
    );
END;
$$;

-- 3. Integrar en log_event() con resolución de identidad anónima
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
    v_email TEXT;
BEGIN
    v_actor_id := auth.uid()::text;
    
    -- Resolución de identidad para ataques anónimos (si hay email en details)
    IF v_actor_id IS NULL AND p_details ? 'email' THEN
        v_email := p_details ->> 'email';
        SELECT id::text INTO v_actor_id FROM auth.users WHERE email = v_email;
    END IF;

    v_is_simulation := (auth.jwt() -> 'app_metadata' ->> 'simulation_mode')::boolean IS TRUE;
    v_env := CASE WHEN v_is_simulation THEN 'simulation' ELSE 'production' END;
    
    -- Obtener rol
    v_actor_role := (auth.jwt() -> 'app_metadata' ->> 'role')::text;
    IF v_actor_role IS NULL THEN
        v_actor_role := (auth.jwt() ->> 'role')::text;
    END IF;

    -- Redirigir a smoke_test_logs
    IF v_is_simulation AND (p_details ->> 'scope' = 'smoke_test' OR p_module = 'SMOKE_TEST') THEN
        INSERT INTO public.smoke_test_logs (
            actor_email,
            action,
            module,
            result,
            details
        ) VALUES (
            COALESCE(auth.jwt() ->> 'email', v_email),
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

    -- Detección de anomalías
    
    -- Regla: 3 denied en 5 min
    IF p_result = '403' OR p_result = 'DENIED' THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.sase_alerts 
            WHERE (actor_id = v_actor_id OR (actor_id IS NULL AND v_actor_id IS NULL))
            AND type = 'anomaly' 
            AND created_at > now() - interval '2 minutes'
        ) THEN
            SELECT count(*) INTO v_denied_count
            FROM public.audit_logs
            WHERE (actor_id = v_actor_id OR (actor_id IS NULL AND v_actor_id IS NULL))
            AND (result = '403' OR result = 'DENIED')
            AND created_at > now() - interval '5 minutes';

            IF v_denied_count >= 3 THEN
                INSERT INTO public.sase_alerts (type, severity, message, actor_id, details)
                VALUES ('anomaly', 'high', 'Detección de 3 denegaciones seguidas en menos de 5 minutos.', v_actor_id, jsonb_build_object('count', v_denied_count));
                PERFORM public.handle_anomaly_response('anomaly', v_actor_id, p_details);
            END IF;
        END IF;
    END IF;

    -- Regla: 5 intentos de login en 1 min (Fuerza Bruta)
    IF p_action = 'LOGIN' OR p_action = 'LOGIN_FAILURE' THEN
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
                PERFORM public.handle_anomaly_response('BRUTE_FORCE', v_actor_id, p_details);
            END IF;
        END IF;
    END IF;

    RETURN v_log_id;
END;
$$;
