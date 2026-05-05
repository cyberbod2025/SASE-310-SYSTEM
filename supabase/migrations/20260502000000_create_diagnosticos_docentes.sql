-- Tabla diagnosticos_colectivos_docentes: reemplaza a colectivo_respuestas_docentes
-- con esquema normalizado y escala unificada (bajo/medio/alto)

-- Enum para escala unificada
CREATE TYPE nivel_riesgo AS ENUM ('bajo', 'medio', 'alto');

CREATE TABLE IF NOT EXISTS public.diagnosticos_colectivos_docentes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    docente_id UUID REFERENCES public.profiles(id),
    docente_nombre TEXT,
    grupo TEXT NOT NULL,
    periodo TEXT DEFAULT 'T2-2026',
    asignatura TEXT,
    campo_formativo TEXT,

    -- Escala unificada: bajo / medio / alto
    conducta_general nivel_riesgo,
    aprovechamiento nivel_riesgo,
    asistencia nivel_riesgo,

    -- Ambiente de aula (escala unificada)
    ambiente_atencion nivel_riesgo,
    ambiente_respeto nivel_riesgo,
    ambiente_participacion nivel_riesgo,

    -- Métricas colectivas
    impacto_global nivel_riesgo,
    tiempo_conducta TEXT, -- ej. '<10%', '10-25%', etc.

    -- Factores externos detectados
    factores_externos TEXT[],

    -- JSONB para alumnos focalizados (lista de seguimiento)
    alumnos_reportados JSONB DEFAULT '[]'::jsonb,

    -- Estrategias aplicadas
    estrategias_aplicadas TEXT[],
    eficacia_intervencion nivel_riesgo,

    -- Comentarios libres
    comentarios TEXT,

    -- Metadatos
    fecha_diagnostico DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultas del dashboard
CREATE INDEX IF NOT EXISTS idx_diagnosticos_grupo ON public.diagnosticos_colectivos_docentes(grupo);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_docente ON public.diagnosticos_colectivos_docentes(docente_id);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_fecha ON public.diagnosticos_colectivos_docentes(fecha_diagnostico DESC);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_periodo ON public.diagnosticos_colectivos_docentes(periodo);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_conducta ON public.diagnosticos_colectivos_docentes(conducta_general);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_aprovechamiento ON public.diagnosticos_colectivos_docentes(aprovechamiento);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_asistencia ON public.diagnosticos_colectivos_docentes(asistencia);

-- RLS: Solo roles institucionales
ALTER TABLE public.diagnosticos_colectivos_docentes ENABLE ROW LEVEL SECURITY;

-- El docente solo ve/edita sus propios diagnósticos
CREATE POLICY "Docentes gestionan sus diagnósticos"
ON public.diagnosticos_colectivos_docentes
FOR ALL
TO authenticated
USING (
    docente_id = (SELECT id FROM public.profiles WHERE id = auth.uid())
    AND (SELECT role::text FROM public.profiles WHERE id = auth.uid()) IN ('docente', 'docente_tutor')
)
WITH CHECK (
    docente_id = (SELECT id FROM public.profiles WHERE id = auth.uid())
    AND (SELECT role::text FROM public.profiles WHERE id = auth.uid()) IN ('docente', 'docente_tutor')
);

-- Orientación y Dirección pueden leer todo
CREATE POLICY "Roles institucionales leen diagnósticos"
ON public.diagnosticos_colectivos_docentes
FOR SELECT
TO authenticated
USING (
    (SELECT role::text FROM public.profiles WHERE id = auth.uid()) IN (
        'orientacion', 'trabajo_social', 'directivo', 'subdireccion',
        'developer', 'system_admin'
    )
);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_diagnosticos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_diagnosticos_updated_at
BEFORE UPDATE ON public.diagnosticos_colectivos_docentes
FOR EACH ROW
EXECUTE FUNCTION public.update_diagnosticos_updated_at();
