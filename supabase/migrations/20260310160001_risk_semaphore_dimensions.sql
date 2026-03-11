-- ======================================================================================
-- SASE-310: DIMENSIONES DEL ALGORITMO INSTITUCIONAL DE SEMÁFORO DE RIESGO
-- Descripción: Agrega soporte para calcular el riesgo mapeado a las cuatro
-- áreas clave: Disciplina, Asistencia, Académico, y Socioemocional, junto 
-- con el cálculo global.
-- ======================================================================================

DO $$
BEGIN
    ALTER TABLE public.alumnos 
      ADD COLUMN IF NOT EXISTS riesgo_disciplina numeric(5,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS riesgo_asistencia numeric(5,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS riesgo_academico numeric(5,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS riesgo_socioemocional numeric(5,2) DEFAULT 0;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

CREATE OR REPLACE FUNCTION public.calculate_student_risk(p_student_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_points numeric(5,2) := 0;
    
    -- Acumuladores dimensionales
    v_dim_disciplina numeric(5,2) := 0;
    v_dim_asistencia numeric(5,2) := 0;
    v_dim_academico numeric(5,2) := 0;
    v_dim_socioemocional numeric(5,2) := 0;

    v_state text := 'CERRADO';
    v_rec record;
    v_days int;
    v_multiplier numeric;
    v_base_points numeric;
    
    -- Contadores para detección de reincidencia persistente
    v_grave_disciplina int := 0;
    v_grave_asistencia int := 0;
    v_grave_academico int := 0;
    v_grave_socioemocional int := 0;

    v_force_intervencion boolean := false;
BEGIN
    FOR v_rec IN 
        SELECT tipo, gravedad, fecha, creado_en 
        FROM public.incidencias 
        WHERE alumno_id = p_student_id
    LOOP
        v_days := EXTRACT(DAY FROM now() - COALESCE(v_rec.fecha, v_rec.creado_en, now()));
        
        -- 1. Decaimiento Temporal
        IF v_days > 90 THEN
            v_multiplier := 0.0;
        ELSIF v_days > 30 THEN
            v_multiplier := 0.5;
        ELSE
            v_multiplier := 1.0;
        END IF;

        IF v_multiplier > 0 THEN
            -- 2. Peso por Gravedad
            CASE v_rec.gravedad
                WHEN 'leve' THEN v_base_points := 1.0;
                WHEN 'media' THEN v_base_points := 3.0;
                WHEN 'grave' THEN v_base_points := 5.0;
                WHEN 'critica' THEN v_base_points := 8.0;
                ELSE v_base_points := 1.0;
            END CASE;
            
            -- Detectar repetición de gravedad para la reincidencia (solo últimos 60 días)
            IF v_days <= 60 AND v_rec.gravedad IN ('grave', 'critica') THEN
                IF lower(v_rec.tipo::text) LIKE '%convivencia%' OR lower(v_rec.tipo::text) LIKE '%uniforme%' THEN
                    v_grave_disciplina := v_grave_disciplina + 1;
                ELSIF lower(v_rec.tipo::text) LIKE '%asistencia%' OR lower(v_rec.tipo::text) LIKE '%retardo%' THEN
                    v_grave_asistencia := v_grave_asistencia + 1;
                ELSIF lower(v_rec.tipo::text) LIKE '%acad%' THEN
                    v_grave_academico := v_grave_academico + 1;
                ELSIF lower(v_rec.tipo::text) LIKE '%salud%' OR lower(v_rec.tipo::text) LIKE '%socioemocional%' THEN
                    v_grave_socioemocional := v_grave_socioemocional + 1;
                END IF;
            END IF;

            -- 3. Mapeo a Dimensiones y Reglas Particulares
            IF lower(v_rec.tipo::text) LIKE '%asistencia%' OR lower(v_rec.tipo::text) LIKE '%retardo%' THEN 
                 -- Asistencia: Tienen tope individual o impactan diferente
                 v_dim_asistencia := v_dim_asistencia + (v_base_points * v_multiplier);
            
            ELSIF lower(v_rec.tipo::text) LIKE '%acad%' THEN
                 v_dim_academico := v_dim_academico + (v_base_points * v_multiplier);
            
            ELSIF lower(v_rec.tipo::text) LIKE '%salud%' OR lower(v_rec.tipo::text) LIKE '%socioemocional%' THEN
                 v_dim_socioemocional := v_dim_socioemocional + (v_base_points * v_multiplier);
                 
            ELSE 
                 -- Por defecto cae en Disciplina (Convivencia, Faltas de uniforme, etc)
                 v_dim_disciplina := v_dim_disciplina + (v_base_points * v_multiplier);
            END IF;
        END IF;
    END LOOP;
    
    -- Limitar los puntos por faltas menores relativas (por ejemplo Retardos excesivos pero leves no pasan de un impacto)
    -- Ajuste dinámico: Si ASISTENCIA acumula más de 4 puntos y no hay exclusiones graves, se topa en 4.
    IF v_dim_asistencia > 4.0 AND v_grave_asistencia = 0 THEN
        v_dim_asistencia := 4.0;
    END IF;
    
    -- Consolidar puntaje total final sumando dimensiones
    v_total_points := v_dim_disciplina + v_dim_asistencia + v_dim_academico + v_dim_socioemocional;
    
    -- 4. Detección de Reincidencia Crítica
    -- Si llegó a 3 o más en la misma dimensión grave/critica dentro de 60 días
    IF (v_grave_disciplina >= 3) OR (v_grave_asistencia >= 3) OR (v_grave_academico >= 3) OR (v_grave_socioemocional >= 3) THEN
        v_force_intervencion := true;
    END IF;
    
    -- 5. Lógica de Asignación de Estados
    IF v_force_intervencion THEN
        v_state := 'INTERVENCION'; -- Override de seguridad
    ELSE
        IF v_total_points = 0 THEN
            v_state := 'CERRADO';
        ELSIF v_total_points <= 3.0 THEN
            v_state := 'OBSERVADO';
        ELSIF v_total_points <= 6.0 THEN
            v_state := 'PATRON_DETECTADO';
        ELSIF v_total_points <= 9.0 THEN
            v_state := 'EN_ANALISIS';
        ELSE
            v_state := 'INTERVENCION';
        END IF;
    END IF;
    
    -- 6. Persistir el cálculo bidimensional
    UPDATE public.alumnos 
    SET puntaje_riesgo = v_total_points,
        estado_semaforo = v_state,
        fecha_calculo_riesgo = now(),
        riesgo_disciplina = v_dim_disciplina,
        riesgo_asistencia = v_dim_asistencia,
        riesgo_academico = v_dim_academico,
        riesgo_socioemocional = v_dim_socioemocional
    WHERE id = p_student_id;
END;
$$;
