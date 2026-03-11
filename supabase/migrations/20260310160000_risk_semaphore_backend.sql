-- ======================================================================================
-- SASE-310: ALGORITMO INSTITUCIONAL DE SEMÁFORO DE RIESGO
-- Descripción: Mueve el motor de evaluación de riesgo a PostgreSQL.
-- Implementa pesos, decaimiento temporal, límite de incidencias menores y detección 
-- de patrones recurrentes críticos para automatizar el semáforo institucional.
-- ======================================================================================

DO $$
BEGIN
    -- 1. Ampliar tabla de incidencias para incluir gravedad explícita
    ALTER TABLE public.incidencias 
      ADD COLUMN IF NOT EXISTS gravedad text CHECK (gravedad IN ('leve', 'media', 'grave', 'critica')) DEFAULT 'leve';

    -- 2. Añadir campos cacheados al perfil del alumno
    ALTER TABLE public.alumnos 
      ADD COLUMN IF NOT EXISTS puntaje_riesgo numeric(5,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS estado_semaforo text DEFAULT 'CERRADO',
      ADD COLUMN IF NOT EXISTS fecha_calculo_riesgo timestamptz DEFAULT now();
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 3. Función Principal del Algoritmo
CREATE OR REPLACE FUNCTION public.calculate_student_risk(p_student_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_points numeric(5,2) := 0;
    v_points_minor numeric(5,2) := 0;
    v_state text := 'CERRADO';
    v_rec record;
    v_days int;
    v_multiplier numeric;
    v_base_points numeric;
    v_force_intervencion boolean := false;
BEGIN
    FOR v_rec IN 
        SELECT tipo, gravedad, fecha, creado_en 
        FROM public.incidencias 
        WHERE alumno_id = p_student_id
    LOOP
        v_days := EXTRACT(DAY FROM now() - COALESCE(v_rec.fecha, v_rec.creado_en, now()));
        
        -- 3A. Decaimiento Temporal
        IF v_days > 90 THEN
            v_multiplier := 0.0;
        ELSIF v_days > 30 THEN
            v_multiplier := 0.5;
        ELSE
            v_multiplier := 1.0;
        END IF;

        IF v_multiplier > 0 THEN
            -- 3B. Peso por Gravedad
            CASE v_rec.gravedad
                WHEN 'leve' THEN v_base_points := 1.0;
                WHEN 'media' THEN v_base_points := 3.0;
                WHEN 'grave' THEN v_base_points := 5.0;
                WHEN 'critica' THEN v_base_points := 8.0;
                ELSE v_base_points := 1.0;
            END CASE;
            
            -- 3C. Regla de incidencias menores (tope de acumulación)
            -- Se usan valores normalizados en minúscula para evitar desajustes de UI
            IF lower(v_rec.tipo::text) IN ('retardo', 'asistencia', 'uniforme', 'falta de uniforme', 'asistencia / falta') THEN 
                 v_points_minor := v_points_minor + (v_base_points * v_multiplier);
            ELSE
                 v_total_points := v_total_points + (v_base_points * v_multiplier);
            END IF;
        END IF;
    END LOOP;
    
    -- Limitar los puntos por faltas menores a un máximo de 3
    IF v_points_minor > 3.0 THEN
        v_points_minor := 3.0;
    END IF;
    
    -- Consolidar puntaje total final
    v_total_points := v_total_points + v_points_minor;
    
    -- 3D. Detección de Reincidencia Crítica
    -- Si hay 3 incidencias graves o críticas del mismo tipo en los últimos 60 días
    SELECT COALESCE(bool_or(count >= 3), false) INTO v_force_intervencion
    FROM (
        SELECT tipo, count(*) as count
        FROM public.incidencias
        WHERE alumno_id = p_student_id 
          AND gravedad IN ('grave', 'critica')
          AND EXTRACT(DAY FROM now() - COALESCE(fecha, creado_en, now())) < 60
        GROUP BY tipo
    ) sub;
    
    -- 3E. Lógica de Asignación de Estados
    IF v_force_intervencion THEN
        v_state := 'INTERVENCION'; -- Override de seguridad
    ELSE
        IF v_total_points = 0 THEN
            v_state := 'CERRADO';
        ELSIF v_total_points < 4.0 THEN
            v_state := 'OBSERVADO';
        ELSIF v_total_points < 7.0 THEN
            v_state := 'PATRON_DETECTADO';
        ELSIF v_total_points < 10.0 THEN
            v_state := 'EN_ANALISIS';
        ELSE
            v_state := 'INTERVENCION';
        END IF;
    END IF;
    
    -- 3F. Persistir el cálculo en la tabla del alumno
    UPDATE public.alumnos 
    SET puntaje_riesgo = v_total_points,
        estado_semaforo = v_state,
        fecha_calculo_riesgo = now()
    WHERE id = p_student_id;
END;
$$;

-- 4. Trigger para mantener el cálculo automatizado en tiempo real
CREATE OR REPLACE FUNCTION public.trigger_update_student_risk()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM public.calculate_student_risk(NEW.alumno_id);
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM public.calculate_student_risk(OLD.alumno_id);
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_calc_risk_on_incidencia ON public.incidencias;
CREATE TRIGGER trigger_calc_risk_on_incidencia
AFTER INSERT OR UPDATE OR DELETE ON public.incidencias
FOR EACH ROW EXECUTE FUNCTION public.trigger_update_student_risk();

-- 5. Función Adicional sugerible para sincronización masiva inicial (Opcional, puede ejecutarse manual)
-- SELECT public.calculate_student_risk(id) FROM public.alumnos;
