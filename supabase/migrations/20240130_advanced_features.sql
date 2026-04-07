-- 1. Tablas para Calificaciones
CREATE TABLE IF NOT EXISTS calificaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
  materia TEXT NOT NULL,
  trimestre1 NUMERIC,
  trimestre2 NUMERIC,
  trimestre3 NUMERIC,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(alumno_id, materia)
);

-- 2. Tablas para Documentos Institucionales
CREATE TABLE IF NOT EXISTS documentos_institucionales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- HECHOS, MINUTA, ACUERDO, DISTANCIA, CITATORIO
  folio TEXT UNIQUE NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  narracion_ia TEXT,
  firmas TEXT[], -- Array de roles/nombres
  creado_por UUID REFERENCES profiles(id),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Modo a Distancia en Alumnos
ALTER TABLE alumnos ADD COLUMN IF NOT EXISTS is_distancia BOOLEAN DEFAULT FALSE;

-- 4. Nuevos Protocolos Institucionales
INSERT INTO protocolos (titulo, tipo, objetivo, activacion, fuente, roles_responsables, icono)
VALUES 
('Protocolo de Convivencia Escolar', 'convivencia', 'Establecer lineamientos para una convivencia armónica y resolución de conflictos.', 'Detección de conductas contrarias a la sana convivencia.', 'Marco de Convivencia SEP', ARRAY['Directivo', 'Orientación', 'Docente'], 'group'),
('Protocolo de Videovigilancia', 'proteccion_civil', 'Regular el uso de cámaras de seguridad garantizando el derecho a la privacidad.', 'Solicitud de revisión de evidencia por incidencia grave.', 'Lineamientos de Protección de Datos Personales', ARRAY['Directivo', 'Prefectura'], 'videocam'),
('Actuación Docente ante Contingencias', 'salud', 'Guía de acciones inmediatas para el personal docente ante emergencias o accidentes.', 'Ocurrencia de accidente o situación de riesgo en aula/patio.', 'Manual de Seguridad Escolar', ARRAY['Docente', 'Enfermería'], 'medical_services')
ON CONFLICT (titulo) DO NOTHING;
