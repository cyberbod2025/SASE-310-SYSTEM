-- =====================================================
-- SASE-310: Hardening inicial de solicitudes y auditoria
-- Fecha: 2026-04-13
-- Objetivo:
--   1) Cerrar lectura publica de solicitudes de alta.
--   2) Eliminar insercion anonima insegura en audit_log si la tabla sigue viva.
--   3) Normalizar estados canonicos de solicitudes para compatibilidad.
-- =====================================================

DO $$
DECLARE
  constraint_row RECORD;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'solicitudes_alta_personal'
  ) THEN
    -- Normaliza estados legacy antes de reforzar el check.
    UPDATE public.solicitudes_alta_personal
    SET estado = 'APROBADA'
    WHERE estado = 'APROBADO';

    UPDATE public.solicitudes_alta_personal
    SET estado = 'RECHAZADA'
    WHERE estado = 'RECHAZADO';

    -- Reemplaza cualquier check heredado sobre estado por el canon vigente.
    FOR constraint_row IN
      SELECT c.conname
      FROM pg_constraint c
      WHERE c.conrelid = 'public.solicitudes_alta_personal'::regclass
        AND c.contype = 'c'
        AND pg_get_constraintdef(c.oid) ILIKE '%estado%'
    LOOP
      EXECUTE format(
        'ALTER TABLE public.solicitudes_alta_personal DROP CONSTRAINT IF EXISTS %I',
        constraint_row.conname
      );
    END LOOP;

    ALTER TABLE public.solicitudes_alta_personal
      ADD CONSTRAINT solicitudes_alta_personal_estado_check
      CHECK (estado IN ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'OBSERVACIONES'));

    -- El frontend actual inserta sin .select(), por lo que esta policy abierta ya no es necesaria.
    DROP POLICY IF EXISTS "Publico puede ver su propia solicitud insertada"
      ON public.solicitudes_alta_personal;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'audit_log'
  ) THEN
    DROP POLICY IF EXISTS "Anon puede registrar auditoria de alta"
      ON public.audit_log;
  END IF;
END $$;

INSERT INTO public.auditoria (
  tipo_accion,
  descripcion_accion,
  tabla_objetivo
) VALUES (
  'MIGRACION_SEGURIDAD',
  'Hardening inicial de solicitudes_alta_personal: cierre de SELECT publico, cierre de auditoria anonima y normalizacion de estados.',
  'solicitudes_alta_personal'
);
