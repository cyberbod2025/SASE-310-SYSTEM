-- Unified feedback table for SASE + Feria Alternativa
-- Allows public INSERT (anon key) for Feria Alternativa users
-- Allows SELECT for authenticated SASE staff

CREATE TABLE IF NOT EXISTS public.feedback_institucional (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  tipo TEXT NOT NULL CHECK (tipo IN ('sugerencia', 'error', 'felicitacion', 'otro')),
  mensaje TEXT NOT NULL,
  app_origen TEXT NOT NULL CHECK (app_origen IN ('sase', 'feria_alternativa')),
  modulo TEXT,
  ruta TEXT,
  nombre TEXT,
  grupo TEXT,
  rol TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.feedback_institucional ENABLE ROW LEVEL SECURITY;

-- Allow INSERT from anon key (Feria Alternativa public form)
CREATE POLICY "Insertar feedback anonimo"
  ON public.feedback_institucional
  FOR INSERT
  WITH CHECK (true);

-- Allow SELECT for authenticated users (SASE staff viewing feedback)
CREATE POLICY "Ver feedback autenticado"
  ON public.feedback_institucional
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Grant usage to anon and authenticated roles
GRANT INSERT ON public.feedback_institucional TO anon;
GRANT INSERT, SELECT ON public.feedback_institucional TO authenticated;
