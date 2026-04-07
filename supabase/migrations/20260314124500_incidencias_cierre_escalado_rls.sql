-- ======================================================================================
-- SASE-310: RLS CIERRE DE INCIDENCIAS ESCALADAS
-- Fecha: 2026-03-14
-- Descripcion: Restringe el cierre de incidencias escaladas a roles autorizados.
-- ======================================================================================

DO $$
BEGIN
  ALTER TABLE public.incidencias
    ADD COLUMN IF NOT EXISTS reportado_por_docente uuid;
  DROP POLICY IF EXISTS "Prefectura edit and escalate incidencias" ON public.incidencias;
  DROP POLICY IF EXISTS "Incidencias update control" ON public.incidencias;
END $$;

CREATE POLICY "Incidencias update control" ON public.incidencias
FOR UPDATE
USING (
  public.get_my_role() IN ('directivo', 'subdireccion', 'orientacion', 'trabajo_social', 'system_admin')
  OR (
    public.get_my_role() = 'prefectura'
    AND lower(coalesce(estado, '')) NOT IN ('escalado', 'escalada', 'cerrado', 'cerrada', 'cerrado_por_direccion')
  )
  OR (
    public.get_my_role() IN ('docente', 'docente_tutor')
    AND lower(coalesce(estado, '')) NOT IN ('escalado', 'escalada', 'cerrado', 'cerrada', 'cerrado_por_direccion')
    AND (reportado_por = auth.uid() OR reportado_por_docente = auth.uid())
  )
)
WITH CHECK (
  public.get_my_role() IN ('directivo', 'subdireccion', 'orientacion', 'trabajo_social', 'system_admin')
  OR (
    public.get_my_role() = 'prefectura'
    AND lower(coalesce(estado, '')) NOT IN ('cerrado', 'cerrada', 'cerrado_por_direccion')
  )
  OR (
    public.get_my_role() IN ('docente', 'docente_tutor')
    AND lower(coalesce(estado, '')) NOT IN ('escalado', 'escalada', 'cerrado', 'cerrada', 'cerrado_por_direccion')
    AND (reportado_por = auth.uid() OR reportado_por_docente = auth.uid())
  )
);

INSERT INTO public.auditoria (tipo_accion, descripcion_accion, tabla_objetivo)
VALUES (
  'RLS_HARDENING_INCIDENTES',
  'Restriccion de cierre y edicion de incidencias escaladas por rol institucional.',
  'incidencias'
);
