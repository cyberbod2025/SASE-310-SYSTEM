-- =====================================================
-- SASE-310: Compatibilidad de log_audit con auditoria
-- Fecha: 2026-04-13
-- Objetivo:
--   Reapuntar la función legacy public.log_audit al modelo canonico
--   public.auditoria despues de la unificacion que eliminó audit_log.
-- =====================================================

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
  v_user_role TEXT;
  v_audit_id UUID;
BEGIN
  SELECT id, email
  INTO v_user_id, v_user_email
  FROM auth.users
  WHERE id = auth.uid();

  SELECT COALESCE(
    (SELECT rol FROM public.perfiles_usuario WHERE id = v_user_id),
    (SELECT role::text FROM public.profiles WHERE id = v_user_id),
    'authenticated'
  )
  INTO v_user_role;

  INSERT INTO public.auditoria (
    usuario_id,
    email_usuario,
    rol_usuario,
    tipo_accion,
    descripcion_accion,
    tabla_objetivo,
    id_registro_objetivo,
    old_values,
    new_values
  ) VALUES (
    v_user_id,
    v_user_email,
    v_user_role,
    p_action_type,
    CASE
      WHEN p_target_student_name IS NULL THEN p_action_description
      ELSE p_action_description || ' [ALUMNO: ' || p_target_student_name || ']'
    END,
    p_target_table,
    p_target_record_id::text,
    p_old_values,
    p_new_values
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$;

INSERT INTO public.auditoria (
  tipo_accion,
  descripcion_accion,
  tabla_objetivo
) VALUES (
  'MIGRACION_SEGURIDAD',
  'La función legacy public.log_audit fue reapuntada al modelo canonico public.auditoria.',
  'auditoria'
);
