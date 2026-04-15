-- =====================================================
-- SASE-310: Fix handle_new_user para schema actual de profiles
-- Fecha: 2026-04-14
-- Objetivo:
--   Alinear el trigger de alta Auth con la tabla public.profiles,
--   que hoy usa full_name y role en lugar de nombre.
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    'docente',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO UPDATE
  SET
    role = EXCLUDED.role,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);

  RETURN NEW;
END;
$function$;

INSERT INTO public.auditoria (
  tipo_accion,
  descripcion_accion,
  tabla_objetivo
) VALUES (
  'MIGRACION_SEGURIDAD',
  'Se corrigió public.handle_new_user para insertar full_name en public.profiles y dejar de usar la columna inexistente nombre.',
  'profiles'
);
