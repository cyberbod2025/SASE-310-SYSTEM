CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.perfiles_usuario
    WHERE id = (SELECT auth.uid())
      AND rol::text IN (
        'admin',
        'directivo',
        'subdireccion',
        'orientacion',
        'trabajo_social',
        'enfermeria',
        'medico_escolar',
        'developer',
        'system_admin'
      )
  );
$$;

REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;
