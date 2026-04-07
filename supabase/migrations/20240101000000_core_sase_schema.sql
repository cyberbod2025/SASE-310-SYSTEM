-- =====================================================
-- SASE-310: MIGRACIÓN PRIMORDIAL (NACIMIENTO DEL SISTEMA)
-- Fecha: 2024-01-01 (Orden cronológico absoluto)
-- Versión: 5.0 (AUDIT HARDENING - ABSOLUTELY ZERO SURPRISES)
-- =====================================================

-- 1. ENUMS BÁSICOS
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('directivo', 'docente', 'docente_tutor', 'prefectura', 'orientacion', 'trabajo_social', 'enfermeria', 'secretaria', 'medico_escolar', 'udeii', 'promotora_lectura', 'subdireccion');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE estado_caso_alumno AS ENUM ('normal', 'observado', 'intervencion', 'seguimiento');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE tipo_incidencia AS ENUM ('retardo', 'conducta', 'uniforme', 'otro', 'asistencia', 'academica', 'socioemocional', 'salud');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. TABLA: ALUMNOS
CREATE TABLE IF NOT EXISTS public.alumnos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    curp TEXT UNIQUE NOT NULL,
    matricula TEXT UNIQUE NOT NULL,
    nombre_completo TEXT NOT NULL,
    grado INT NOT NULL DEFAULT 1,
    grupo TEXT NOT NULL DEFAULT 'A',
    estado_caso ESTADO_CASO_ALUMNO DEFAULT 'normal' NOT NULL,
    is_distancia BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. TABLA: PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role APP_ROLE NOT NULL DEFAULT 'docente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. TABLA: PROTOCOLOS
CREATE TABLE IF NOT EXISTS public.protocolos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT UNIQUE NOT NULL,
    tipo TEXT NOT NULL,
    objetivo TEXT NOT NULL,
    activacion TEXT NOT NULL,
    fuente TEXT NOT NULL,
    roles_responsables TEXT[],
    icono TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. TABLA: AUDITORIA
CREATE TABLE IF NOT EXISTS public.auditoria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID,
    email_usuario TEXT,
    rol_usuario TEXT,
    tipo_accion TEXT NOT NULL,
    descripcion_accion TEXT,
    tabla_objetivo TEXT,
    id_registro_objetivo TEXT,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLA: INCIDENCIAS
CREATE TABLE IF NOT EXISTS public.incidencias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE NOT NULL,
    reportado_por UUID REFERENCES public.profiles(id) NOT NULL,
    tipo TIPO_INCIDENCIA NOT NULL,
    descripcion TEXT NOT NULL,
    nivel_gravedad INT CHECK (nivel_gravedad BETWEEN 1 AND 3) NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. TABLAS DE SALUD Y ATENCION
CREATE TABLE IF NOT EXISTS public.salud (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE NOT NULL,
    padecimiento TEXT,
    alergias TEXT,
    medicamentos TEXT,
    ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.atenciones_medicas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE NOT NULL,
    atendido_por UUID REFERENCES public.profiles(id) NOT NULL,
    sintomas TEXT NOT NULL,
    tratamiento TEXT NOT NULL,
    hora TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 8. TABLAS DE SEGUIMIENTO Y LECTURA
CREATE TABLE IF NOT EXISTS public.registro_lectura (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE NOT NULL,
    proyecto_nombre TEXT,
    logro_alcanzado TEXT,
    observaciones TEXT,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    creado_por UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.seguimiento_bap (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE NOT NULL,
    tipo_bap TEXT,
    ajuste_razonable TEXT,
    estatus TEXT,
    creado_por UUID REFERENCES public.profiles(id),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.seguimiento_social (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE NOT NULL,
    motivo TEXT,
    seguimiento TEXT,
    acuerdos TEXT,
    estatus TEXT,
    es_sensible BOOLEAN DEFAULT FALSE,
    creado_por UUID REFERENCES public.profiles(id),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABLAS DE RRHH Y COLECTIVOS (Resolución de tablas fantasma)
CREATE TABLE IF NOT EXISTS public.personal (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre_completo TEXT NOT NULL,
    rol APP_ROLE NOT NULL,
    email TEXT,
    estatus TEXT DEFAULT 'activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.colectivo_personal (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    personal_id UUID REFERENCES public.personal(id) ON DELETE CASCADE,
    ciclo_escolar TEXT,
    datos JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.colectivo_alumnos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE,
    ciclo_escolar TEXT,
    evaluacion_general TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TABLA: EVENTOS (Agenda)
CREATE TABLE IF NOT EXISTS public.eventos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    tipo TEXT,
    fecha DATE,
    hora TIME,
    creado_por UUID REFERENCES public.profiles(id),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. TABLA: ESTUDIANTES (Gamificación)
CREATE TABLE IF NOT EXISTS public.estudiantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nickname TEXT UNIQUE,
    grado INTEGER,
    total_puntos INTEGER DEFAULT 0,
    escaneos_realizados INTEGER DEFAULT 0,
    alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. TABLAS SOCIOECONOMICAS
CREATE TABLE IF NOT EXISTS public.socioeconomico_general (
    alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE PRIMARY KEY,
    nivel_ingresos TEXT,
    situacion_familiar TEXT,
    observaciones_generales TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.socioeconomico_privado (
    alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE PRIMARY KEY,
    observaciones_restringidas TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 13. OTROS (Exámenes y Respuestas)
CREATE TABLE IF NOT EXISTS public.examenes_trimestre (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre_alumno TEXT NOT NULL,
    grupo TEXT NOT NULL,
    grado INT NOT NULL DEFAULT 1,
    calificacion_final NUMERIC,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.respuestas_docentes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pregunta_id TEXT,
    respuesta TEXT,
    creado_por UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.colectivo_respuestas_docentes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    docente_id UUID REFERENCES public.profiles(id),
    respuestas JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices institucionales de alta velocidad
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_alumnos_matricula ON public.alumnos(matricula);
CREATE INDEX IF NOT EXISTS idx_incidencias_alumno ON public.incidencias(alumno_id);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON public.eventos(fecha);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON public.auditoria(fecha DESC);
