-- 0) ASEGURAR ROLES INSTITUCIONALES (Fix app_role enum error)
DO $$ 
BEGIN 
    -- A) Si el tipo ENUM app_role existe, añadimos 'subdireccion'
    IF EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'app_role' AND n.nspname = 'public') THEN
        BEGIN
            ALTER TYPE public.app_role ADD VALUE 'subdireccion';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    END IF;

    -- B) Si profiles.role es TEXT con CHECK constraint, lo actualizamos
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role' AND data_type = 'text') THEN
        ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('directivo', 'subdireccion', 'docente', 'docente_tutor', 'prefectura', 'orientacion', 'trabajo_social', 'enfermeria', 'secretaria', 'admin', 'developer'));
    END IF;
END $$;

-- 1) ASEGURAR RLS EN TODAS LAS TABLAS CRÍTICAS
ALTER TABLE IF EXISTS public.alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.incidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.atenciones_medicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.justificantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.calificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seguimiento_social ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.registro_lectura ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seguimiento_bap ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.socioeconomico_general ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.solicitudes_alta_personal ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.auditoria ENABLE ROW LEVEL SECURITY;

-- 2) POLÍTICAS DE LECTURA (Select) - Resilientes a perfiles/perfiles_usuario
-- Dirección, Subdirección y Secretarios pueden ver todo.
DROP POLICY IF EXISTS "Directivos ven todo" ON public.alumnos;
CREATE POLICY "Directivos ven todo" ON public.alumnos
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role::text IN ('directivo', 'subdireccion', 'secretaria', 'prefectura', 'admin', 'developer')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.perfiles_usuario
    WHERE perfiles_usuario.id = auth.uid() 
    AND (perfiles_usuario.rol::text IN ('directivo', 'subdireccion', 'secretaria', 'prefectura', 'admin', 'developer')
         OR perfiles_usuario.role::text IN ('directivo', 'subdireccion', 'secretaria', 'prefectura', 'admin', 'developer'))
  )
);

-- Docentes ven alumnos de sus grupos (Usamos perfiles_usuario por columna 'grupos')
DROP POLICY IF EXISTS "Docentes ven sus grupos" ON public.alumnos;
CREATE POLICY "Docentes ven sus grupos" ON public.alumnos
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.perfiles_usuario p
    WHERE p.id = auth.uid() 
    AND (p.rol::text IN ('docente', 'docente_tutor') OR p.role::text IN ('docente', 'docente_tutor'))
    AND alumnos.grupo = ANY(COALESCE(p.grupos, ARRAY[]::text[]))
  )
);

-- 4) POLÍTICA: INCIDENCIAS
DROP POLICY IF EXISTS "Staff ve incidencias" ON public.incidencias;
CREATE POLICY "Staff ve incidencias" ON public.incidencias
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role::text IN ('directivo', 'subdireccion', 'secretaria', 'prefectura', 'orientacion', 'trabajo_social', 'admin')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.perfiles_usuario p
    WHERE p.id = auth.uid() 
    AND p.rol::text IN ('directivo', 'subdireccion', 'secretaria', 'prefectura', 'orientacion', 'trabajo_social', 'admin')
  )
  OR (reportado_por = auth.uid()) -- El que reportó puede verla (Corregido: reportado_por)
);

-- 5) REGISTRO DE AUDITORÍA
INSERT INTO public.auditoria (tipo_accion, descripcion_accion, tabla_objetivo)
VALUES ('SUCCESS_RLS_V5', 'Seguridad RLS activa. Columna reportado_por corregida.', 'global_security');

-- ✅ Migración de Seguridad Completada
