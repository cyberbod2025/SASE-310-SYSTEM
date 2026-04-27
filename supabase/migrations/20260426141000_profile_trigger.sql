-- Migration: SASE-310 Profile Auto-Creation Trigger
-- OBJETIVO: Asegurar que cada usuario en auth.users tenga un perfil en perfiles_usuario.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    INSERT INTO public.perfiles_usuario (id, email, nombre_completo, role, rol, seguridad_status, risk_score)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
        COALESCE(NEW.raw_app_meta_data ->> 'role', 'guest'),
        COALESCE(NEW.raw_app_meta_data ->> 'role', 'guest'),
        'active',
        0
    );
    RETURN NEW;
END;
$$;

-- Borrar si ya existe para evitar duplicados
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
