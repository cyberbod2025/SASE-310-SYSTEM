-- =====================================================
-- SASE-310: MIGRACIÓN PRIMORDIAL (NACIMIENTO DEL SISTEMA)
-- Fecha: 2024-01-01 (Orden cronológico absoluto)
-- =====================================================

-- 1. ENUMS BÁSICOS
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('directivo', 'docente', 'docente_tutor', 'prefectura', 'orientacion', 'trabajo_social', 'enfermeria', 'secretaria');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. TABLA: ALUMNOS (Cimiento Institucional)
CREATE TABLE IF NOT EXISTS public.alumnos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    curp TEXT UNIQUE NOT NULL,
    matricula TEXT UNIQUE NOT NULL,
    nombre_completo TEXT NOT NULL,
    grado INT NOT NULL DEFAULT 1,
    grupo TEXT NOT NULL DEFAULT 'A',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. TABLA: PROFILES (Requerida para referencias)
-- Se crea con IF NOT EXISTS para ser compatible con otras migraciones
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role APP_ROLE NOT NULL DEFAULT 'docente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. TABLA: PROTOCOLOS (Recuperación de Tabla Perdida)
-- Deducida de la migración 20240130
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

-- Índices básicos para performance institucional
CREATE INDEX IF NOT EXISTS idx_alumnos_matricula ON public.alumnos(matricula);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
