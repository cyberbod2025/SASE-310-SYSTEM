-- =====================================================
-- SASE-310: AMPLIACIÓN DE ACCIONES AUDITABLES
-- Migración: 20260306120000_ampliar_acciones_sensibles.sql
-- Descripción: Agrega las nuevas acciones referentes al
-- expediente institucional al CHECK constraint.
-- =====================================================

DO $$
DECLARE
    con_name TEXT;
BEGIN
    -- Buscar el nombre del constraint CHECK (solo debería haber uno en esta tabla por ahora, 
    -- adaptamos buscando donde esté 'accion' envuelto o si hay varios).
    SELECT conname INTO con_name
    FROM pg_constraint
    WHERE conrelid = 'public.auditoria_accesos'::regclass
      AND contype = 'c'
    LIMIT 1;
    
    IF con_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.auditoria_accesos DROP CONSTRAINT ' || quote_ident(con_name);
    END IF;
END $$;

-- Agregar el nuevo constraint con las acciones ampliadas
ALTER TABLE public.auditoria_accesos
ADD CONSTRAINT auditoria_accesos_accion_check CHECK (accion IN (
    'consultar_expediente',
    'consultar_alerta_medica',
    'consultar_historial_disciplina',
    'consultar_trabajo_social',
    'abrir_panel_avanzado',
    'abrir_expediente_institucional',
    'generar_analisis_ia_expediente',
    'exportar_expediente_pdf'
));

-- Log en auditoria central (si no falla)
INSERT INTO public.auditoria (tipo_accion, descripcion_accion, tabla_objetivo)
VALUES ('ALTER_TABLE', 'Ampliación de auditoria_accesos_accion_check para incluir módulo Expediente.', 'auditoria_accesos');
