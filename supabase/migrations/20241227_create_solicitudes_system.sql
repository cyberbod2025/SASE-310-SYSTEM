-- ============================================
-- SASE-310: Sistema de Solicitudes y Comunicados
-- Migración: 20241227_create_solicitudes_system
-- ============================================

-- 1. Tabla de Comunicados/Eventos (Dirección → Personal)
CREATE TABLE IF NOT EXISTS public.comunicados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Quién envía
  creado_por UUID REFERENCES auth.users(id),
  creado_por_nombre TEXT,
  creado_por_rol TEXT,
  
  -- Tipo y contenido
  tipo TEXT NOT NULL CHECK (tipo IN ('evento', 'comunicado', 'recordatorio', 'urgente')),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_evento DATE,          -- Para eventos con fecha específica
  hora_evento TIME,
  
  -- Audiencia objetivo
  audiencia TEXT[] NOT NULL,  -- Array de roles: ['docente', 'directivo', 'todos']
  audiencia_especifica UUID[], -- IDs específicos de usuarios (opcional)
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Solicitudes de Documentos (Dirección → Secretaría)
CREATE TABLE IF NOT EXISTS public.solicitudes_documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Quién solicita
  solicitante_id UUID REFERENCES auth.users(id),
  solicitante_nombre TEXT,
  
  -- A quién se solicita
  asignado_a UUID REFERENCES auth.users(id),
  asignado_nombre TEXT,  -- "Dulce", "Jorge", "Gaby", etc.
  
  -- Detalles de la solicitud
  tipo_documento TEXT NOT NULL CHECK (tipo_documento IN (
    'constancia_inasistencias',
    'dias_economicos', 
    'constancia_laboral',
    'oficio_comision',
    'boleta_calificaciones',
    'historial_academico',
    'otro'
  )),
  descripcion TEXT,
  alumno_id UUID REFERENCES public.alumnos(id),  -- Si aplica
  alumno_nombre TEXT,
  
  -- Prioridad y fechas
  prioridad TEXT DEFAULT 'normal' CHECK (prioridad IN ('baja', 'normal', 'alta', 'urgente')),
  fecha_limite DATE,
  
  -- Estado del flujo
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'completado', 'cancelado')),
  notas_seguimiento TEXT,
  documento_url TEXT,  -- URL del documento generado
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completado_at TIMESTAMPTZ
);

-- 3. Tabla de Recordatorios (Secretaría General → Dirección)
CREATE TABLE IF NOT EXISTS public.recordatorios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Quién crea el recordatorio
  creado_por UUID REFERENCES auth.users(id),
  creado_por_nombre TEXT,
  
  -- Para quién es
  destinatario_id UUID REFERENCES auth.users(id),
  destinatario_rol TEXT,  -- 'directivo'
  
  -- Contenido
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_recordatorio DATE NOT NULL,
  hora_recordatorio TIME,
  
  -- Estado
  visto BOOLEAN DEFAULT false,
  completado BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Índices
CREATE INDEX IF NOT EXISTS idx_comunicados_audiencia ON public.comunicados USING GIN (audiencia);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON public.solicitudes_documentos(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_asignado ON public.solicitudes_documentos(asignado_a);
CREATE INDEX IF NOT EXISTS idx_recordatorios_fecha ON public.recordatorios(fecha_recordatorio);

-- 5. Habilitar RLS
ALTER TABLE public.comunicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordatorios ENABLE ROW LEVEL SECURITY;

-- 6. Políticas básicas (permitir a usuarios autenticados)
CREATE POLICY "Usuarios autenticados pueden ver comunicados"
ON public.comunicados FOR SELECT TO authenticated USING (true);

CREATE POLICY "Directivos pueden crear comunicados"
ON public.comunicados FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'directivo'
  )
);

CREATE POLICY "Ver solicitudes propias o asignadas"
ON public.solicitudes_documentos FOR SELECT TO authenticated
USING (solicitante_id = auth.uid() OR asignado_a = auth.uid());

CREATE POLICY "Directivos pueden crear solicitudes"
ON public.solicitudes_documentos FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'directivo'
  )
);

CREATE POLICY "Secretarios pueden actualizar solicitudes asignadas"
ON public.solicitudes_documentos FOR UPDATE TO authenticated
USING (asignado_a = auth.uid());

CREATE POLICY "Ver recordatorios propios"
ON public.recordatorios FOR SELECT TO authenticated
USING (destinatario_id = auth.uid() OR creado_por = auth.uid());

CREATE POLICY "Secretarios pueden crear recordatorios"
ON public.recordatorios FOR INSERT TO authenticated WITH CHECK (true);

COMMENT ON TABLE public.comunicados IS 'Eventos y comunicados de Dirección al personal';
COMMENT ON TABLE public.solicitudes_documentos IS 'Solicitudes de documentos de Dirección a Secretaría';
COMMENT ON TABLE public.recordatorios IS 'Recordatorios de Secretaría General a Dirección';
