-- FIX: Insecure Role Fallback (Detected by Jules Sentinel & Antigravity Audit)
-- Description: Replaces the 'Fail Open' logic in get_my_role() which defaulted to 'docente'.
-- Principle: Fail Closed. If no profile exists, return NULL.

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS app_role AS $$
DECLARE
  _role app_role;
BEGIN
  -- Intentamos obtener el rol de profiles (legacy) o perfiles_usuario (estándar)
  SELECT role INTO _role FROM public.profiles WHERE id = auth.uid();
  
  IF _role IS NULL THEN
     SELECT COALESCE(rol, role)::app_role INTO _role 
     FROM public.perfiles_usuario 
     WHERE id = auth.uid() 
     LIMIT 1;
  END IF;

  RETURN _role; -- Retorna NULL si no se encuentra perfil, denegando acceso por RLS
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auditoría de la corrección
INSERT INTO public.auditoria (tipo_accion, descripcion_accion, tabla_objetivo)
VALUES ('SECURITY_FIX', 'Función get_my_role corregida a FAIL_CLOSED (Sentinel Sync)', 'auth_system');
