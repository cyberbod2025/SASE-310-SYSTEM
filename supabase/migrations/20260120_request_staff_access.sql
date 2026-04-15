-- ============================================
-- SASE-310: Solicitudes de Alta de Personal
-- Migración: 20260120_request_staff_access
-- ============================================

-- 1. Crear tabla de solicitudes
CREATE TABLE IF NOT EXISTS public.solicitudes_alta_personal (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rol_solicitado TEXT[] NOT NULL,
    turno TEXT NOT NULL,
    nombres TEXT NOT NULL,
    apellido_paterno TEXT NOT NULL,
    apellido_materno TEXT NOT NULL,
    curp TEXT NOT NULL,
    correo_institucional TEXT NOT NULL,
    telefono TEXT,
    materias TEXT[],
    grupos TEXT[],
    es_tutor BOOLEAN DEFAULT false,
    grupo_tutor TEXT,
    area_cobertura TEXT,
    observaciones TEXT,
    acepta_privacidad BOOLEAN DEFAULT false,
    acepta_etica BOOLEAN DEFAULT false,
    acepta_auditoria BOOLEAN DEFAULT false,
    estado TEXT DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'OBSERVACIONES')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_solicitudes_curp ON public.solicitudes_alta_personal(curp);
CREATE INDEX IF NOT EXISTS idx_solicitudes_email ON public.solicitudes_alta_personal(correo_institucional);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON public.solicitudes_alta_personal(estado);

-- 3. RLS
ALTER TABLE public.solicitudes_alta_personal ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT a anonimos (registro publico)
CREATE POLICY "Publico puede crear solicitudes" 
ON public.solicitudes_alta_personal 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- No crear policy SELECT publica: las solicitudes contienen PII y el frontend actual inserta sin `.select()`.
-- No crear policy de auditoria anonima en `audit_log`: esa superficie se endurece en el flujo server-side.
