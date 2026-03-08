-- Extend events table for new institutional requirements
ALTER TABLE public.eventos DROP CONSTRAINT IF EXISTS eventos_tipo_check;
ALTER TABLE public.eventos ADD CONSTRAINT eventos_tipo_check CHECK (tipo IN ('reunion', 'entrega', 'evento', 'evaluacion', 'festivo', 'cita_padres', 'jct', 'institucional'));

ALTER TABLE public.eventos ADD COLUMN IF NOT EXISTS alumno_id uuid REFERENCES public.alumnos(id);
ALTER TABLE public.eventos ADD COLUMN IF NOT EXISTS para_todos_maestros boolean DEFAULT false;

-- Add comments for clarity
COMMENT ON COLUMN public.eventos.alumno_id IS 'ID del alumno relacionado (para citas con padres)';
COMMENT ON COLUMN public.eventos.para_todos_maestros IS 'Indica si el evento es una notificación para toda la plantilla docente';
