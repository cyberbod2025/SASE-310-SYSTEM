-- ============================================
-- SASE-310: Sistema de Auditoría Completa
-- Migración: 20241227_create_audit_log
-- ============================================

-- 1. Crear tabla de bitácora de auditoría
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- ¿Quién realizó la acción?
  user_id UUID REFERENCES auth.users(id),  -- ID del usuario autenticado
  user_email TEXT,                          -- Email para referencia rápida
  user_role TEXT,                           -- Rol activo al momento de la acción
  
  -- ¿Qué hizo?
  action_type TEXT NOT NULL,                -- 'CONSULTA', 'ACTUALIZACION', 'CREACION', 'ELIMINACION'
  action_description TEXT,                  -- Descripción legible (ej: "Consultó expediente")
  
  -- ¿Sobre quién/qué?
  target_table TEXT,                        -- Tabla afectada (ej: 'alumnos', 'incidencias')
  target_record_id UUID,                    -- ID del registro afectado
  target_student_name TEXT,                 -- Nombre del alumno (para búsqueda rápida)
  
  -- ¿Qué cambió? (para actualizaciones)
  old_values JSONB,                         -- Valores anteriores
  new_values JSONB,                         -- Valores nuevos
  
  -- Metadatos
  ip_address TEXT,                          -- IP del cliente (si disponible)
  user_agent TEXT,                          -- Navegador/dispositivo
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_target_record ON public.audit_log(target_record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action_type ON public.audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);

-- 3. Habilitar RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de seguridad
-- Solo usuarios con rol 'directivo' o 'secretaria' pueden VER la bitácora
CREATE POLICY "Directivos pueden ver toda la bitácora"
ON public.audit_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('directivo', 'secretaria')
  )
);

-- Todos los usuarios autenticados pueden INSERTAR en la bitácora
CREATE POLICY "Usuarios autenticados pueden registrar acciones"
ON public.audit_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Vista para reportes de auditoría (opcional)
CREATE OR REPLACE VIEW public.audit_summary AS
SELECT 
  DATE(created_at) as fecha,
  user_email,
  user_role,
  action_type,
  COUNT(*) as total_acciones
FROM public.audit_log
GROUP BY DATE(created_at), user_email, user_role, action_type
ORDER BY fecha DESC;

-- 6. Función para registrar auditoría desde el frontend
CREATE OR REPLACE FUNCTION public.log_audit(
  p_action_type TEXT,
  p_action_description TEXT,
  p_target_table TEXT,
  p_target_record_id UUID,
  p_target_student_name TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_audit_id UUID;
BEGIN
  -- Obtener datos del usuario actual
  SELECT id, email INTO v_user_id, v_user_email
  FROM auth.users
  WHERE id = auth.uid();

  -- Insertar registro de auditoría
  INSERT INTO public.audit_log (
    user_id,
    user_email,
    user_role,
    action_type,
    action_description,
    target_table,
    target_record_id,
    target_student_name,
    old_values,
    new_values
  ) VALUES (
    v_user_id,
    v_user_email,
    (SELECT role FROM public.profiles WHERE id = v_user_id),
    p_action_type,
    p_action_description,
    p_target_table,
    p_target_record_id,
    p_target_student_name,
    p_old_values,
    p_new_values
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$;

-- Dar permisos de ejecución
GRANT EXECUTE ON FUNCTION public.log_audit TO authenticated;

COMMENT ON TABLE public.audit_log IS 'Bitácora de auditoría del sistema SASE-310. Registra todas las consultas y modificaciones a expedientes de alumnos.';
