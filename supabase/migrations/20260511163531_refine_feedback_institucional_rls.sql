-- Refine feedback_institucional: add constraints, controlled INSERT policy, staff-only SELECT

-- 1. Add estado column with constraint
ALTER TABLE public.feedback_institucional
  ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'revisado', 'resuelto', 'archivado'));

-- 2. Add check constraint on mensaje length (only apply if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'feedback_institucional_mensaje_length_check'
  ) THEN
    ALTER TABLE public.feedback_institucional
      ADD CONSTRAINT feedback_institucional_mensaje_length_check
      CHECK (char_length(mensaje) BETWEEN 5 AND 2000);
  END IF;
END $$;

-- 3. Drop the old permissive policies
DROP POLICY IF EXISTS "Insertar feedback anonimo" ON public.feedback_institucional;
DROP POLICY IF EXISTS "Ver feedback autenticado" ON public.feedback_institucional;

-- 4. Controlled INSERT policy: anon + authenticated can insert, but only valid data
CREATE POLICY "feedback_insert_public_controlado"
  ON public.feedback_institucional
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    app_origen IN ('sase', 'feria_alternativa')
    AND tipo IN ('sugerencia', 'error', 'felicitacion', 'otro')
    AND char_length(mensaje) BETWEEN 5 AND 2000
    AND estado = 'pendiente'
  );

-- 5. Staff-only SELECT policy using existing is_staff() helper
CREATE POLICY "feedback_select_staff"
  ON public.feedback_institucional
  FOR SELECT
  TO authenticated
  USING (public.is_staff());

-- 6. Ensure proper grants
GRANT INSERT ON public.feedback_institucional TO anon, authenticated;
GRANT SELECT ON public.feedback_institucional TO authenticated;
