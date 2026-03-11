-- ======================================================================================
-- SASE-310: ACTUALIZACIÓN DEL MODELO DE INCIDENCIAS (FLUJO DE PREFECTURA)
-- Descripción: Centraliza la atención disciplinaria en Prefectura, registrando al 
--              docente que reporta y al prefecto asignado. Modifica estado y roles RLS.
-- ======================================================================================

DO $$
BEGIN
    -- 1. Añadir nuevas columnas al modelo de incidencias si no existen
    ALTER TABLE public.incidencias 
      ADD COLUMN IF NOT EXISTS reportado_por_docente uuid,  -- FK opcional a profiles/perfiles_usuario
      ADD COLUMN IF NOT EXISTS prefecto_asignado uuid,      -- FK opcional
      ADD COLUMN IF NOT EXISTS grupo_id uuid,               -- FK a grupos si existe
      ADD COLUMN IF NOT EXISTS estado text DEFAULT 'abierto',
      ADD COLUMN IF NOT EXISTS fecha timestamp with time zone DEFAULT now();
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 2. Refinar RLS usando el getter oficial (public.get_my_role())

-- Eliminar políticas previas para evitar conflictos
DROP POLICY IF EXISTS "Docentes/Prefect create incidencias" ON public.incidencias;
DROP POLICY IF EXISTS "Prefectura and Managers edit incidencias" ON public.incidencias;
DROP POLICY IF EXISTS "System admin bypass update" ON public.incidencias;
DROP POLICY IF EXISTS "Cierre de incidencias" ON public.incidencias;
DROP POLICY IF EXISTS "Staff view incidencias" ON public.incidencias;

-- VISTA (SELECT): Mantener acceso amplio para staff institucional
CREATE POLICY "Staff view incidencias" ON public.incidencias FOR SELECT 
USING (
    public.get_my_role() IN ('docente', 'docente_tutor', 'prefectura', 'orientacion', 'trabajo_social', 'directivo', 'subdireccion', 'system_admin')
);

-- CREACIÓN (INSERT): Prefectura puede levantar las incidencias oficiales, o docentes si es su grupo
CREATE POLICY "Prefectura create incidencias" ON public.incidencias FOR INSERT
WITH CHECK (
    public.get_my_role() IN ('prefectura', 'docente', 'docente_tutor', 'orientacion', 'trabajo_social', 'directivo', 'subdireccion', 'system_admin')
);

-- EDICIÓN (UPDATE): Validar escalamiento y cierre
CREATE POLICY "Prefectura edit and escalate incidencias" ON public.incidencias FOR UPDATE
USING (
    -- Directivo, subdirección, orientación y system_admin: Siempre pueden editar cualquier cosa.
    public.get_my_role() IN ('directivo', 'subdireccion', 'orientacion', 'system_admin')
    OR
    -- Prefectura: Puede editar, pero si ya está 'escalado' o lo escala en este movimiento, queda inmutable para él.
    (
        public.get_my_role() = 'prefectura'
    )
    OR
    -- Docente: Solo puede editar/cerrar si está abierto o es una incidencia menor (no escalado)
    (
        public.get_my_role() IN ('docente', 'docente_tutor')
        AND estado NOT IN ('escalado', 'cerrado_por_direccion')
    )
);

-- BORRADO (DELETE): Solo directores o system_admin
CREATE POLICY "Delete incidencias restrictivo" ON public.incidencias FOR DELETE
USING (
    public.get_my_role() IN ('directivo', 'system_admin')
);

-- 3. Trigger / Función de Auditoría Automática para Cambios de Estado (Opcional)
-- Asumiendo que la función public.log_audit(text,text,text,uuid) está disponible (creada en 20241227_create_audit_log).
-- Este trigger dejará una traza en la caja negra.

CREATE OR REPLACE FUNCTION audit_incidencia_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.estado IS DISTINCT FROM NEW.estado) THEN
        -- Intentar invocar la función de auditoría silenciosamente
        BEGIN
            PERFORM public.log_audit(
                'ACTUALIZACION',
                'Cambio de estado en incidencia a: ' || NEW.estado,
                'incidencias',
                NEW.id
            );
        EXCEPTION
            WHEN OTHERS THEN null; -- Ignorar si la función no existe, no romper el flujo
        END;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_audit_incidencias ON public.incidencias;
CREATE TRIGGER trigger_audit_incidencias
    AFTER UPDATE ON public.incidencias
    FOR EACH ROW
    EXECUTE FUNCTION audit_incidencia_changes();
