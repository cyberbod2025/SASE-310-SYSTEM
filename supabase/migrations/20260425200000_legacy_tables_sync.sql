-- Migration to add legacy/missing tables requested by the user
-- to ensure they are preserved in type generation and official schema

-- evidence_log
CREATE TABLE IF NOT EXISTS public.evidence_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    file_type TEXT,
    impacto_estimado NUMERIC,
    link TEXT,
    notes TEXT,
    proyecto_nombre TEXT,
    role TEXT,
    title TEXT,
    user_id UUID REFERENCES auth.users(id)
);

-- activities_log
CREATE TABLE IF NOT EXISTS public.activities_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    date DATE,
    description TEXT,
    group_id TEXT,
    role TEXT,
    type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id)
);

-- system_feedback
CREATE TABLE IF NOT EXISTS public.system_feedback (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    comment TEXT NOT NULL,
    email TEXT,
    resolved BOOLEAN DEFAULT false,
    type TEXT,
    url TEXT,
    user_agent TEXT,
    user_id UUID REFERENCES auth.users(id)
);

-- user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    role TEXT
);

-- citas_padres
CREATE TABLE IF NOT EXISTS public.citas_padres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    alumno_id UUID REFERENCES public.alumnos(id) NOT NULL,
    creado_por UUID REFERENCES auth.users(id),
    estado TEXT DEFAULT 'pendiente',
    fecha_cita TIMESTAMPTZ NOT NULL,
    motivo TEXT NOT NULL,
    observaciones TEXT
);

-- contacts_log
CREATE TABLE IF NOT EXISTS public.contacts_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    method TEXT,
    notes TEXT,
    outcome TEXT,
    student_id UUID REFERENCES public.alumnos(id),
    user_id UUID REFERENCES auth.users(id)
);

-- interventions_log
CREATE TABLE IF NOT EXISTS public.interventions_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    reason TEXT,
    result TEXT,
    notes TEXT,
    student_id UUID REFERENCES public.alumnos(id),
    user_id UUID REFERENCES auth.users(id)
);

-- Re-enable RLS for these tables (basic)
ALTER TABLE public.evidence_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas_padres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventions_log ENABLE ROW LEVEL SECURITY;
