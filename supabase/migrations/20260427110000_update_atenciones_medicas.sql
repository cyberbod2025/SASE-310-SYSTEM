
-- SASE-310: Evolución de Atenciones Médicas y Protección RLS
-- Objetivo: Sincronizar el esquema con los requerimientos del módulo de enfermería
-- y asegurar la autoría mediante generado_por para políticas RLS.

-- 1. Ampliar tabla atenciones_medicas
ALTER TABLE public.atenciones_medicas 
ADD COLUMN IF NOT EXISTS nombre_alumno TEXT,
ADD COLUMN IF NOT EXISTS grupo TEXT,
ADD COLUMN IF NOT EXISTS motivo TEXT,
ADD COLUMN IF NOT EXISTS diagnostico TEXT,
ADD COLUMN IF NOT EXISTS signos_vitales TEXT,
ADD COLUMN IF NOT EXISTS atencion_brindada TEXT,
ADD COLUMN IF NOT EXISTS medicamento TEXT,
ADD COLUMN IF NOT EXISTS notificacion_padres TEXT,
ADD COLUMN IF NOT EXISTS acudieron_por_el TEXT,
ADD COLUMN IF NOT EXISTS condiciones_entrega TEXT,
ADD COLUMN IF NOT EXISTS observaciones TEXT,
ADD COLUMN IF NOT EXISTS generado_por UUID DEFAULT auth.uid();

-- 2. Asegurar RLS
ALTER TABLE public.atenciones_medicas ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Seguridad Resilientes
DROP POLICY IF EXISTS "Personal de salud puede insertar atenciones" ON public.atenciones_medicas;
CREATE POLICY "Personal de salud puede insertar atenciones"
ON public.atenciones_medicas
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL -- Verificación básica de sesión
);

DROP POLICY IF EXISTS "Personal puede ver sus propios registros de salud" ON public.atenciones_medicas;
CREATE POLICY "Personal puede ver sus propios registros de salud"
ON public.atenciones_medicas
FOR SELECT
TO authenticated
USING (
  generado_por = auth.uid() 
  OR atendido_por = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.perfiles_usuario
    WHERE perfiles_usuario.id = auth.uid()
    AND (perfiles_usuario.rol::text IN ('directivo', 'subdireccion', 'admin'))
  )
);

-- 4. Auditoría de cambio de esquema
INSERT INTO public.auditoria (tipo_accion, descripcion_accion, tabla_objetivo)
VALUES ('ESQUEMA_UPDATE', 'Ampliación de campos en atenciones_medicas y refuerzo RLS con generado_por.', 'atenciones_medicas');
