-- =====================================================
-- SASE-310: Dashboard Data Extension
-- Tablas para Inventario y Asistencia Detallada
-- =====================================

-- 1. Tabla de Suministros (Enfermería)
CREATE TABLE IF NOT EXISTS public.suministros (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre text NOT NULL,
    cantidad integer NOT NULL DEFAULT 0,
    cantidad_maxima integer NOT NULL DEFAULT 100,
    categoria text, -- 'medicamentos', 'curacion', 'equipo'
    unidad text DEFAULT 'unidades',
    ultima_actualizacion timestamptz DEFAULT now(),
    actualizado_por uuid REFERENCES auth.users(id)
);

-- 2. Registro de Asistencia (Attendance Logs)
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    alumno_id uuid NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
    fecha date NOT NULL DEFAULT CURRENT_DATE,
    hora_entrada timestamptz DEFAULT now(),
    estado text NOT NULL CHECK (estado IN ('presente', 'falta', 'retardo', 'justificado')),
    registrado_por uuid REFERENCES auth.users(id),
    observaciones text,
    CONSTRAINT attendance_logs_unique_day UNIQUE(alumno_id, fecha)
);

-- 3. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_suministros_categoria ON public.suministros(categoria);
CREATE INDEX IF NOT EXISTS idx_attendance_fecha ON public.attendance_logs(fecha);
CREATE INDEX IF NOT EXISTS idx_attendance_alumno ON public.attendance_logs(alumno_id);

-- 4. RLS para Suministros
ALTER TABLE public.suministros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enfermeros y Directivos ven suministros" ON public.suministros
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.perfiles_usuario
        WHERE id = auth.uid()
        AND rol IN ('enfermeria', 'direccion', 'subdireccion', 'desarrollador')
    )
);

CREATE POLICY "Enfermería gestiona suministros" ON public.suministros
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.perfiles_usuario
        WHERE id = auth.uid()
        AND rol IN ('enfermeria', 'desarrollador')
    )
);

-- 5. RLS para Attendance Logs
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Personal ve asistencia" ON public.attendance_logs
FOR SELECT USING (true); -- Permiso general de lectura para personal autenticado

CREATE POLICY "Prefectura y Docentes registran asistencia" ON public.attendance_logs
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.perfiles_usuario
        WHERE id = auth.uid()
        AND rol IN ('prefectura', 'docente', 'direccion', 'desarrollador')
    )
);

-- 6. Seed Data inicial para Inventario
INSERT INTO public.suministros (nombre, cantidad, cantidad_maxima, categoria)
VALUES 
('Paracetamol 500mg', 12, 20, 'medicamentos'),
('Vendas elásticas', 4, 20, 'curacion'),
('Alcohol Etílico', 18, 20, 'curacion'),
('Gasas estériles', 8, 50, 'curacion')
ON CONFLICT DO NOTHING;
