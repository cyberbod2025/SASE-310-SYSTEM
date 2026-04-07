-- MIGRACIÓN DE REPARACIÓN: Sincronización de esquema Institucional v4
-- Objetivo: Asegurar que todas las columnas requeridas por el frontend existan en la DB.

DO $$ 
BEGIN
    -- 1. INCIDENCIAS: Columnas faltantes para reportes y automatización
    ALTER TABLE public.incidencias 
      ADD COLUMN IF NOT EXISTS creado_en timestamptz DEFAULT now(),
      ADD COLUMN IF NOT EXISTS reporta text,              -- Nombre del docente reportante (institucional)
      ADD COLUMN IF NOT EXISTS clasificacion text,       -- Tipo I, II, III
      ADD COLUMN IF NOT EXISTS notificado_whatsapp boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS evidencia text[];         -- Array de URLs

    -- 2. DOCUMENTOS INSTITUCIONALES: Garantizar relación y nombres
    -- Si la tabla no existe por alguna razón, se crea
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'documentos_institucionales') THEN
        CREATE TABLE public.documentos_institucionales (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE,
            tipo TEXT NOT NULL,
            folio TEXT UNIQUE NOT NULL,
            fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            titulo TEXT NOT NULL,
            contenido TEXT NOT NULL,
            narracion_ia TEXT,
            firmas TEXT[],
            creado_por UUID REFERENCES public.profiles(id),
            creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    ELSE
        -- Asegurar Foreign Key si la tabla ya existe
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_documentos_alumnos'
        ) THEN
            ALTER TABLE public.documentos_institucionales 
            ADD CONSTRAINT fk_documentos_alumnos 
            FOREIGN KEY (alumno_id) REFERENCES public.alumnos(id) ON DELETE CASCADE;
        END IF;
    END IF;

    -- 3. OBJETOS RETENIDOS: Asegurar tabla base para el módulo
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'objetos_retenidos') THEN
        CREATE TABLE public.objetos_retenidos (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE,
            objeto TEXT NOT NULL,
            motivo TEXT NOT NULL,
            fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            responsable_id UUID REFERENCES public.profiles(id),
            responsable_nombre TEXT,
            responsable_rol TEXT,
            estado TEXT DEFAULT 'retenido',
            incidencia_id UUID REFERENCES public.incidencias(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Añadir columnas de la fase de custodia (UNIT_30) si no existen
    ALTER TABLE public.objetos_retenidos
      ADD COLUMN IF NOT EXISTS fecha_devolucion timestamptz null,
      ADD COLUMN IF NOT EXISTS entregado_a text null,
      ADD COLUMN IF NOT EXISTS entregado_por uuid null,
      ADD COLUMN IF NOT EXISTS lugar_retencion text null,
      ADD COLUMN IF NOT EXISTS categoria text null,
      ADD COLUMN IF NOT EXISTS observaciones text null,
      ADD COLUMN IF NOT EXISTS evidencia_url text null,
      ADD COLUMN IF NOT EXISTS autorizado_por uuid null;

END $$;

-- 4. Vínculo de Gamificación si falta (Seguridad)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estudiantes' AND column_name='alumno_id') THEN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'estudiantes') THEN
        ALTER TABLE public.estudiantes ADD COLUMN alumno_id uuid REFERENCES public.alumnos(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Auditoría del Arreglo
INSERT INTO public.auditoria (tipo_accion, descripcion_accion, tabla_objetivo)
VALUES ('REPARACION_ESQUEMA', 'Sincronización masiva de columnas para SASE v4 (incidencias, documentos, objetos_retenidos)', 'global');
