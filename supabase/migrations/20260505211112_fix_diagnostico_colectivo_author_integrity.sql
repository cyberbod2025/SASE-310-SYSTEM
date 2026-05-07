-- fix(rls): enforce diagnostico colectivo author integrity
-- Refuerza el blindaje de autoría en diagnosticos_colectivos_docentes.

-- 1. Asegurar NOT NULL y DEFAULT seguro
ALTER TABLE public.diagnosticos_colectivos_docentes
ALTER COLUMN docente_id SET NOT NULL,
ALTER COLUMN docente_id SET DEFAULT auth.uid();

-- 2. Asegurar integridad referencial con perfiles_usuario
-- Primero removemos cualquier constraint vieja si existe
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'diagnosticos_colectivos_docentes_docente_id_fkey') THEN
        ALTER TABLE public.diagnosticos_colectivos_docentes DROP CONSTRAINT diagnosticos_colectivos_docentes_docente_id_fkey;
    END IF;
END $$;

ALTER TABLE public.diagnosticos_colectivos_docentes
ADD CONSTRAINT diagnosticos_colectivos_docentes_docente_id_fkey
FOREIGN KEY (docente_id) REFERENCES public.perfiles_usuario(id)
ON DELETE RESTRICT;

-- 3. Refuerzo de RLS con InitPlan y Author Integrity
DROP POLICY IF EXISTS "Docentes gestionan sus diagnósticos" ON public.diagnosticos_colectivos_docentes;
DROP POLICY IF EXISTS "Roles institucionales leen diagnósticos" ON public.diagnosticos_colectivos_docentes;

-- Política para Docentes (Propietarios)
CREATE POLICY "Docentes gestionan sus propios diagnósticos"
ON public.diagnosticos_colectivos_docentes
FOR ALL
TO authenticated
USING (
  docente_id = (SELECT auth.uid())
)
WITH CHECK (
  docente_id = (SELECT auth.uid())
);

-- Política para Roles Institucionales (Lectura)
CREATE POLICY "Roles institucionales leen diagnósticos colectivos"
ON public.diagnosticos_colectivos_docentes
FOR SELECT
TO authenticated
USING (
  (SELECT public.get_my_role_text()) IN ('directivo', 'subdireccion', 'trabajo_social', 'orientacion', 'admin')
);

-- 4. Trigger para impedir el cambio de docente_id después del insert (anti-suplantación)
CREATE OR REPLACE FUNCTION public.fn_prevent_diagnostico_docente_id_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.docente_id IS DISTINCT FROM OLD.docente_id THEN
    RAISE EXCEPTION 'No se permite cambiar el docente_id de un diagnóstico ya registrado.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_diagnostico_docente_id_change ON public.diagnosticos_colectivos_docentes;
CREATE TRIGGER trg_prevent_diagnostico_docente_id_change
BEFORE UPDATE ON public.diagnosticos_colectivos_docentes
FOR EACH ROW
EXECUTE FUNCTION public.fn_prevent_diagnostico_docente_id_change();

-- 5. Garantizar que no hay permisos para anon
REVOKE ALL ON public.diagnosticos_colectivos_docentes FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.diagnosticos_colectivos_docentes TO authenticated;
-- No se otorga DELETE a nadie, ni siquiera a authenticated.

-- 6. Auditoría de índices
CREATE INDEX IF NOT EXISTS idx_diagnosticos_colectivos_docente_id ON public.diagnosticos_colectivos_docentes(docente_id);
