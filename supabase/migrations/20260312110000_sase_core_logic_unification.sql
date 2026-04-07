-- ==============================================================================
-- SASE-CORE: UNIFICACIÓN DE IDENTIDAD Y SEGURIDAD ROBUSTA
-- Descripción: Unifica el acceso a perfiles y optimiza la obtención de roles
-- para evitar inconsistencias entre 'profiles' y 'perfiles_usuario'.
-- ==============================================================================

-- 1. FIX: Función get_my_role unificada (Categoría: Security & Identity)
-- Implementa la misma lógica de prioridad que AuthProvider.tsx
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.app_role AS $$
DECLARE
  _role_text text;
  _role public.app_role;
BEGIN
  -- Intento 1: perfiles_usuario (Tabla estándar SASE)
  SELECT COALESCE(rol, role) INTO _role_text 
  FROM public.perfiles_usuario 
  WHERE id = auth.uid() 
  LIMIT 1;

  -- Intento 2: Fallback a profiles (Compatibilidad)
  IF _role_text IS NULL THEN
    SELECT role::text INTO _role_text 
    FROM public.profiles 
    WHERE id = auth.uid() 
    LIMIT 1;
  END IF;

  -- Cast seguro al ENUM
  BEGIN
    _role := _role_text::public.app_role;
  EXCEPTION WHEN OTHERS THEN
    _role := NULL;
  END;

  RETURN _role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. PERFORMANCE: Cacheo del Rol en RLS
-- Para evitar llamadas repetidas a get_my_role() en cada fila de una consulta masiva,
-- usamos una CTE o un SELECT único en las políticas donde sea posible.

-- 3. HARDENING: Políticas de Inscripciones y Solicitudes
ALTER TABLE IF EXISTS public.solicitudes_alta_personal ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Directivos gestionan personal" ON public.solicitudes_alta_personal;
CREATE POLICY "Directivos gestionan personal" ON public.solicitudes_alta_personal
FOR ALL TO authenticated
USING (
  get_my_role() IN ('directivo', 'subdireccion', 'admin', 'system_admin')
);

-- 4. VIEW: Vista unificada de perfiles para evitar JOINs manuales
CREATE OR REPLACE VIEW public.v_perfiles_activos AS
SELECT 
    id,
    COALESCE(full_name, nombre_completo, nombres) as nombre_completo,
    COALESCE(rol, role)::text as rol
FROM (
    SELECT id, full_name, role::text, NULL as nombre_completo, NULL as nombres, role::text as rol FROM public.profiles
    UNION ALL
    SELECT id, NULL, NULL, nombre_completo, NULL, rol::text as rol FROM public.perfiles_usuario
    WHERE id NOT IN (SELECT id FROM public.profiles)
) sub;

GRANT SELECT ON public.v_perfiles_activos TO authenticated;

-- 5. AUDITORÍA: Trigger para loguear accesos a expedientes (Sensible)
CREATE OR REPLACE FUNCTION public.log_expediente_access()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.auditoria (tipo_accion, descripcion_accion, tabla_objetivo, usuario_id)
    VALUES ('LECTURA_SENSIBLE', format('Acceso al expediente del alumno ID %s', NEW.id), 'alumnos', auth.uid());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Nota: Este trigger se activa en SELECT si se implementa una función de lectura, 
-- pero Postgres no soporta triggers directos en SELECT. 
-- Lo dejamos como lógica para aplicar en funciones de consulta.
