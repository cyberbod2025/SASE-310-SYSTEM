-- Migration: feria_pilotos_table
-- Description: Table to store teachers invited to the Science Fair pilot.

CREATE TABLE IF NOT EXISTS public.feria_pilotos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

-- RLS
ALTER TABLE public.feria_pilotos ENABLE ROW LEVEL SECURITY;

-- Allow read for authenticated users (to check their own status or for the launcher)
CREATE POLICY "Anyone can check pilot status" ON public.feria_pilotos
    FOR SELECT TO authenticated USING (true);

-- Allow admins to manage
CREATE POLICY "Admins can manage feria pilots" ON public.feria_pilotos
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles_usuario
            WHERE id = auth.uid() AND rol IN ('admin', 'system_admin', 'directivo')
        )
    );

-- Seed some emails if needed, but usually we do this via UI or manual SQL.
-- For now, let's add the ones from the previous handler as initial seeds.
INSERT INTO public.feria_pilotos (email)
VALUES 
    ('docente@sase.mx'),
    ('maestro.piloto@gmail.com')
ON CONFLICT (email) DO NOTHING;
