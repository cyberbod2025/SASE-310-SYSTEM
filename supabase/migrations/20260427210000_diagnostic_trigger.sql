-- Diagnostic Trigger: Logs errors to public.debug_logs
CREATE OR REPLACE FUNCTION public.handle_new_user_v3()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    INSERT INTO public.perfiles_usuario (
        id, 
        email, 
        nombre_completo, 
        rol, 
        seguridad_status, 
        risk_score,
        estado_cuenta
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
        COALESCE(NEW.raw_app_meta_data ->> 'role', 'docente'),
        'active',
        0,
        'activo'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        nombre_completo = EXCLUDED.nombre_completo,
        rol = EXCLUDED.rol,
        updated_at = NOW();
        
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.debug_logs (message) VALUES ('SASE Trigger Error: ' || SQLERRM || ' [NEW.id=' || NEW.id || ']');
    RETURN NEW;
END;
$$;
