-- Migration: Populate BAP Test Data for UDEII Dashboard
-- Created: 2026-02-05
-- Purpose: Add 3 students with active BAP status for testing UDEII functionality

-- Update 3 random students to have BAP data
UPDATE public.alumnos
SET datos_bap = jsonb_build_object(
  'hasBAP', true,
  'diagnosisPrivate', 'TDAH (Trastorno por Déficit de Atención e Hiperactividad) - Diagnóstico clínico confidencial emitido por neuropsicología.',
  'accommodations', jsonb_build_array(
    'Ubicación preferencial en las primeras filas del salón',
    'Segmentación de tareas largas en pasos más pequeños',
    'Tiempo adicional para evaluaciones (15 minutos extra)',
    'Uso de material manipulativo y visual',
    'Recordatorios verbales individuales para mantener atención'
  ),
  'lastUpdated', '2024-11-15'
)
WHERE id = (SELECT id FROM public.alumnos ORDER BY random() LIMIT 1 OFFSET 0);

UPDATE public.alumnos
SET datos_bap = jsonb_build_object(
  'hasBAP', true,
  'diagnosisPrivate', 'TEA Nivel 1 (Trastorno del Espectro Autista) - Requiere apoyo en interacción social y comunicación.',
  'accommodations', jsonb_build_array(
    'Anticipación de cambios en rutinas con avisos previos',
    'Instrucciones claras, concretas y por escrito',
    'Espacio de descanso sensorial disponible',
    'Evitar sobrecarga de estímulos auditivos y visuales',
    'Apoyo en trabajo colaborativo con roles definidos'
  ),
  'lastUpdated', '2024-10-22'
)
WHERE id = (SELECT id FROM public.alumnos ORDER BY random() LIMIT 1 OFFSET 1);

UPDATE public.alumnos
SET datos_bap = jsonb_build_object(
  'hasBAP', true,
  'diagnosisPrivate', 'Dislexia - Dificultad específica en lectoescritura. Evaluación psicopedagógica institucional.',
  'accommodations', jsonb_build_array(
    'Lectura en voz alta de instrucciones escritas',
    'Uso de fuentes tipográficas accesibles (Arial, Verdana)',
    'Evaluaciones orales como alternativa cuando sea posible',
    'Tiempo adicional para lectura de textos largos',
    'Material de apoyo con organizadores gráficos'
  ),
  'lastUpdated', '2024-09-30'
)
WHERE id = (SELECT id FROM public.alumnos ORDER BY random() LIMIT 1 OFFSET 2);

-- Verify the update
SELECT 
  nombre_completo,
  grupo,
  datos_bap->>'hasBAP' as tiene_bap,
  datos_bap->>'diagnosisPrivate' as diagnostico,
  jsonb_array_length(datos_bap->'accommodations') as num_ajustes
FROM public.alumnos
WHERE datos_bap->>'hasBAP' = 'true';
