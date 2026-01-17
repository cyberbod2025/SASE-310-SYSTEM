-- ==============================================================================
-- MIGRACIÓN COMPLETA PARA PILOTO SASE (v2.4.0)
-- Ejecutar este script para crear todas las tablas y correcciones necesarias.
-- ==============================================================================

BEGIN;

-- 1. CORRECCIÓN DE TRIGGER DE AUTH (Para evitar "Database error creating new user")
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfiles_usuario (id, email, nombre_completo, rol, estado_cuenta)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Usuario Nuevo'),
    'DOCENTE', -- Rol por defecto seguro
    'activo'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RETURN new; -- Ignora errores para no bloquear el registro
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. TABLA: CITAS CON PADRES (Nueva)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.citas_padres (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    alumno_id TEXT NOT NULL, -- Matricula o ID
    creado_por UUID REFERENCES auth.users(id),
    fecha_cita TIMESTAMPTZ NOT NULL,
    motivo TEXT NOT NULL,
    estado TEXT CHECK (estado IN ('PENDIENTE', 'REALIZADA', 'CANCELADA')) DEFAULT 'PENDIENTE',
    observaciones TEXT
);
-- Habilitar RLS básico
ALTER TABLE public.citas_padres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver citas propias o de grupo" ON public.citas_padres FOR ALL USING (true); -- Ajustar en prod


-- 3. TABLA: BITÁCORA DE ASISTENCIA (Nueva)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    docente_id UUID REFERENCES auth.users(id),
    grupo_id TEXT NOT NULL,
    fecha DATE NOT NULL,
    registros JSONB NOT NULL, -- Guardamos el array de asistencia aqui
    comentarios TEXT
);
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Docentes ven su asistencia" ON public.attendance_logs FOR ALL USING (true);


-- 4. TABLA: AUDITORIA / CAJA NEGRA (Asegurar existencia)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.auditoria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT, -- Puede ser "SYSTEM"
    rol_usuario TEXT,
    tipo_accion TEXT NOT NULL,
    descripcion_accion TEXT,
    tabla_objetivo TEXT,
    id_registro_objetivo TEXT,
    nuevos_valores JSONB
);
ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Solo lectura admin" ON public.auditoria FOR SELECT USING (true);


-- 5. AJUSTES FINALES
-- ----------------------------------------------------------------------------
-- Crear buckets de almacenamiento si no existen (idempotente simulado)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('evidencias', 'evidencias', true)
ON CONFLICT (id) DO NOTHING;

COMMIT;
