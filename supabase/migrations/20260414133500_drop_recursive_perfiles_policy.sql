-- =====================================================
-- SASE-310: Eliminar policy recursiva en perfiles_usuario
-- Fecha: 2026-04-14
-- Objetivo:
--   Quitar la policy system_admin_all_perfiles que se autorreferencia
--   sobre public.perfiles_usuario y provoca recursion en RLS.
-- =====================================================

DROP POLICY IF EXISTS system_admin_all_perfiles ON public.perfiles_usuario;

INSERT INTO public.auditoria (
  tipo_accion,
  descripcion_accion,
  tabla_objetivo
) VALUES (
  'MIGRACION_SEGURIDAD',
  'Se eliminó la policy recursiva system_admin_all_perfiles sobre public.perfiles_usuario para evitar recursion en RLS.',
  'perfiles_usuario'
);
