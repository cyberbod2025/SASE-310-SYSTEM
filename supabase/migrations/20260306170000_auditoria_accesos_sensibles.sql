-- =====================================================
-- SASE-310: AUDITORÍA DE ACCESOS A INFORMACIÓN SENSIBLE
-- Migración: 20260306_auditoria_accesos_sensibles.sql
-- =====================================================

-- 1) CREAR TABLA auditoria_accesos
CREATE TABLE IF NOT EXISTS public.auditoria_accesos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario UUID REFERENCES auth.users(id),
    rol TEXT NOT NULL,
    accion TEXT NOT NULL CHECK (accion IN (
        'consultar_expediente',
        'consultar_alerta_medica',
        'consultar_historial_disciplina',
        'consultar_trabajo_social',
        'abrir_panel_avanzado'
    )),
    alumno_id TEXT NOT NULL,
    pantalla TEXT NOT NULL DEFAULT 'StudentAdvancedPanel',
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    hora TIME NOT NULL DEFAULT CURRENT_TIME,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2) ÍNDICES para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_auditoria_accesos_usuario ON public.auditoria_accesos(usuario);
CREATE INDEX IF NOT EXISTS idx_auditoria_accesos_fecha ON public.auditoria_accesos(fecha);
CREATE INDEX IF NOT EXISTS idx_auditoria_accesos_accion ON public.auditoria_accesos(accion);
CREATE INDEX IF NOT EXISTS idx_auditoria_accesos_alumno ON public.auditoria_accesos(alumno_id);

-- 3) HABILITAR RLS
ALTER TABLE public.auditoria_accesos ENABLE ROW LEVEL SECURITY;

-- 4) POLÍTICAS RLS
-- Solo directivos y admin pueden VER los registros de acceso
DROP POLICY IF EXISTS "Directivos ven auditoria_accesos" ON public.auditoria_accesos;
CREATE POLICY "Directivos ven auditoria_accesos" ON public.auditoria_accesos
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role::text IN ('directivo', 'subdireccion', 'admin', 'developer')
    )
    OR
    EXISTS (
        SELECT 1 FROM public.perfiles_usuario p
        WHERE p.id = auth.uid()
        AND p.rol::text IN ('directivo', 'subdireccion', 'admin', 'developer')
    )
);

-- Cualquier usuario autenticado puede INSERTAR su propio registro
DROP POLICY IF EXISTS "Usuarios registran su acceso" ON public.auditoria_accesos;
CREATE POLICY "Usuarios registran su acceso" ON public.auditoria_accesos
FOR INSERT TO authenticated
WITH CHECK (usuario = auth.uid());

-- 5) REGISTRO DE AUDITORÍA
INSERT INTO public.auditoria (tipo_accion, descripcion_accion, tabla_objetivo)
VALUES ('NUEVA_TABLA', 'Creación de auditoria_accesos para registro de consultas sensibles.', 'auditoria_accesos');
