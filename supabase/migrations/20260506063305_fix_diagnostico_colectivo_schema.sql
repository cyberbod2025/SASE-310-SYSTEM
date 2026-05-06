-- 1. Default auth.uid() para integridad de auditoría
ALTER TABLE public.diagnosticos_colectivos_docentes
ALTER COLUMN docente_id SET DEFAULT auth.uid();

-- 2. Asegurar Row Level Security (RLS)
ALTER TABLE public.diagnosticos_colectivos_docentes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Docentes gestionan sus diagnósticos" ON public.diagnosticos_colectivos_docentes;
DROP POLICY IF EXISTS "Roles institucionales leen diagnósticos" ON public.diagnosticos_colectivos_docentes;

CREATE POLICY "Docente gestiona sus propios diagnosticos colectivos"
ON public.diagnosticos_colectivos_docentes
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  (public.get_my_role_text() = ANY (ARRAY['docente'::text, 'docente_tutor'::text]))
  AND (docente_id = (SELECT auth.uid()))
)
WITH CHECK (
  (public.get_my_role_text() = ANY (ARRAY['docente'::text, 'docente_tutor'::text]))
  AND (docente_id = (SELECT auth.uid()))
);

CREATE POLICY "Roles institucionales leen diagnosticos colectivos"
ON public.diagnosticos_colectivos_docentes
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  public.get_my_role_text() = ANY (ARRAY['orientacion'::text, 'trabajo_social'::text, 'directivo'::text, 'subdireccion'::text, 'developer'::text, 'system_admin'::text])
);

-- 3. Trigger anti-cambio de docente_id para evitar suplantación posterior
CREATE OR REPLACE FUNCTION public.prevent_diagnostico_docente_id_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.docente_id IS DISTINCT FROM OLD.docente_id THEN
    RAISE EXCEPTION 'No se permite modificar el docente_id de un diagnóstico colectivo existente.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_diagnostico_docente_id_change ON public.diagnosticos_colectivos_docentes;

CREATE TRIGGER trg_prevent_diagnostico_docente_id_change
BEFORE UPDATE ON public.diagnosticos_colectivos_docentes
FOR EACH ROW
EXECUTE FUNCTION public.prevent_diagnostico_docente_id_change();

-- 4. Re-crear Trigger para updated_at (por si faltaba en el esquema base o estaba obsoleto)
CREATE OR REPLACE FUNCTION public.update_diagnosticos_colectivos_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_diagnosticos_updated_at ON public.diagnosticos_colectivos_docentes;
DROP TRIGGER IF EXISTS trg_diagnosticos_colectivos_updated_at ON public.diagnosticos_colectivos_docentes;

CREATE TRIGGER trg_diagnosticos_colectivos_updated_at
BEFORE UPDATE ON public.diagnosticos_colectivos_docentes
FOR EACH ROW
EXECUTE FUNCTION public.update_diagnosticos_colectivos_updated_at();

-- 5. Índices de rendimiento para consultas comunes
CREATE INDEX IF NOT EXISTS idx_diagnosticos_colectivos_docente_id ON public.diagnosticos_colectivos_docentes USING btree (docente_id);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_colectivos_grupo ON public.diagnosticos_colectivos_docentes USING btree (grupo);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_colectivos_fecha ON public.diagnosticos_colectivos_docentes USING btree (fecha_diagnostico);
