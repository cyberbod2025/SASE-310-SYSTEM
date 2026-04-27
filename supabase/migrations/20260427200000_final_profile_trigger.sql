-- Final Fix: SASE-310 Profile Auto-Creation Trigger
-- Unifies identity creation and ensures resilience

-- 1. Unify trigger function
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
    -- Prevent failing the user creation if profile creation fails
    -- But log it if possible (Notices are visible in some logs)
    RAISE NOTICE 'SASE Trigger Error: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 2. Cleanup old triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS tr_sase_profile_creation ON auth.users;

-- 3. Create fresh trigger
CREATE TRIGGER tr_sase_profile_creation
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_v3();
