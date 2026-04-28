-- Migration: Modo Emergencia SASE-310
-- Objetivo: Implementar sistema de alerta inmediata para crisis escolares.

-- 1. Tabla de Alertas de Emergencia
CREATE TABLE IF NOT EXISTS public.alertas_emergencia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_alerta TEXT NOT NULL CHECK (tipo_alerta IN ('medica', 'seguridad', 'violencia', 'emocional', 'otros')),
    descripcion_opcional TEXT,
    grupo TEXT,
    aula TEXT,
    docente_id UUID NOT NULL REFERENCES auth.users(id),
    docente_nombre TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'atendida', 'cancelada')),
    prioridad TEXT NOT NULL DEFAULT 'alta' CHECK (prioridad IN ('media', 'alta', 'critica')),
    protocolo_activado TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    atendida_at TIMESTAMPTZ,
    cerrada_at TIMESTAMPTZ
);

-- 2. Tabla de Respuestas a Emergencias
CREATE TABLE IF NOT EXISTS public.respuestas_alerta_emergencia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alerta_id UUID NOT NULL REFERENCES public.alertas_emergencia(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES auth.users(id),
    usuario_nombre TEXT NOT NULL,
    rol TEXT NOT NULL,
    respuesta TEXT NOT NULL CHECK (respuesta IN ('enterado', 'voy_en_camino', 'no_disponible', 'atendida')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar RLS
ALTER TABLE public.alertas_emergencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas_alerta_emergencia ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para alertas_emergencia

-- Docentes pueden crear alertas
CREATE POLICY "Docentes pueden crear alertas de emergencia" ON public.alertas_emergencia
FOR INSERT TO authenticated WITH CHECK (auth.uid() = docente_id);

-- Docentes pueden ver sus propias alertas
CREATE POLICY "Docentes ven sus propias alertas" ON public.alertas_emergencia
FOR SELECT TO authenticated USING (auth.uid() = docente_id);

-- Staff autorizado puede ver todas las alertas activas e históricas
-- Roles: directivo, subdireccion, prefectura, medico_escolar, system_admin, developer
CREATE POLICY "Staff autorizado ve todas las alertas" ON public.alertas_emergencia
FOR SELECT TO authenticated USING (
    (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() ->> 'role'))::text 
    IN ('directivo', 'subdireccion', 'prefectura', 'medico_escolar', 'system_admin', 'developer')
);

-- Solo el docente o staff puede cerrar/actualizar la alerta
CREATE POLICY "Actualizacion de alertas" ON public.alertas_emergencia
FOR UPDATE TO authenticated USING (
    auth.uid() = docente_id OR 
    (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() ->> 'role'))::text 
    IN ('directivo', 'subdireccion', 'prefectura', 'medico_escolar', 'system_admin', 'developer')
);

-- 5. Políticas para respuestas_alerta_emergencia

-- Solo staff autorizado puede responder
CREATE POLICY "Staff responde alertas" ON public.respuestas_alerta_emergencia
FOR INSERT TO authenticated WITH CHECK (
    (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() ->> 'role'))::text 
    IN ('directivo', 'subdireccion', 'prefectura', 'medico_escolar', 'system_admin', 'developer')
);

-- Cualquiera que pueda ver la alerta puede ver las respuestas
CREATE POLICY "Ver respuestas de alertas" ON public.respuestas_alerta_emergencia
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.alertas_emergencia a 
        WHERE a.id = alerta_id AND (
            a.docente_id = auth.uid() OR 
            (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() ->> 'role'))::text 
            IN ('directivo', 'subdireccion', 'prefectura', 'medico_escolar', 'system_admin', 'developer')
        )
    )
);

-- 6. Auditoría (Caja Negra)
-- Función para loggear emergencias si existe el sistema de auditoria
CREATE OR REPLACE FUNCTION public.fn_audit_emergency_alert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.auditoria (
        usuario_id,
        accion,
        tabla,
        registro_id,
        detalle,
        metadata
    ) VALUES (
        auth.uid(),
        CASE WHEN TG_OP = 'INSERT' THEN 'EMERGENCIA_CREADA' ELSE 'EMERGENCIA_ACTUALIZADA' END,
        'alertas_emergencia',
        NEW.id,
        'Alerta tipo ' || NEW.tipo_alerta || ' en estado ' || NEW.estado,
        jsonb_build_object('tipo', NEW.tipo_alerta, 'prioridad', NEW.prioridad)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_audit_emergency_alert
AFTER INSERT OR UPDATE ON public.alertas_emergencia
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_emergency_alert();

-- Comentarios Institucionales
COMMENT ON TABLE public.alertas_emergencia IS 'Tabla central de alertas de crisis SASE-310.';
COMMENT ON COLUMN public.alertas_emergencia.tipo_alerta IS 'Clasificación de la crisis: medica, seguridad, violencia, emocional.';
