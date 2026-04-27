-- Migration: Auth Helpers for SASE-310
-- OBJETIVO: Definir funciones auxiliares de seguridad para RLS.

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Intentar obtener el rol del JWT o de la tabla perfiles_usuario
  v_role := (auth.jwt() -> 'user_metadata' ->> 'role');
  
  IF v_role IS NULL THEN
    SELECT COALESCE(rol::text, role::text) INTO v_role
    FROM public.perfiles_usuario
    WHERE id = auth.uid();
  END IF;

  RETURN v_role IN (
    'directivo', 'docente', 'docente_tutor', 'prefectura', 
    'orientacion', 'trabajo_social', 'enfermeria', 'secretaria', 
    'medico_escolar', 'udeii', 'promotora_lectura', 'subdireccion', 
    'admin', 'system_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario institucional
COMMENT ON FUNCTION public.is_staff() IS 'Verifica si el usuario actual pertenece a la plantilla de personal institucional.';
