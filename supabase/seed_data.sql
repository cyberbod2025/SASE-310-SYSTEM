-- Semilla de Datos (Seed Data) para SASE-310
-- Carga masiva de Grupos, Usuarios Simulados y Alumnos

-- 0. Limpiar datos existentes (Opcional, usar con cuidado)
-- truncate table public.asignaciones_profesor cascade;
-- truncate table public.grupos cascade;
-- truncate table public.alumnos cascade;
-- delete from auth.users where email like 'docente%@sase.mx';

-- 1. Insertar Grupos (Estándar 18 grupos: A-F por grado)
insert into public.grupos (nombre, ciclo_escolar) values 
('1º A', '2025-2026'), ('1º B', '2025-2026'), ('1º C', '2025-2026'), ('1º D', '2025-2026'), ('1º E', '2025-2026'), ('1º F', '2025-2026'),
('2º A', '2025-2026'), ('2º B', '2025-2026'), ('2º C', '2025-2026'), ('2º D', '2025-2026'), ('2º E', '2025-2026'), ('2º F', '2025-2026'),
('3º A', '2025-2026'), ('3º B', '2025-2026'), ('3º C', '2025-2026'), ('3º D', '2025-2026'), ('3º E', '2025-2026'), ('3º F', '2025-2026')
on conflict (nombre) do nothing;

-- 2. Insertar Alumnos de Prueba (Simulación Masiva)
insert into public.alumnos (matricula, nombre_completo, grupo, datos_tutor, datos_bap) values
-- 3º B (Grupo Foco)
('2023-4492', 'Carlos Alberto Ruiz', '3º B', '{"name": "María Ruiz", "phonePrimary": "55-1234-5678", "relationship": "Madre"}', '{"hasBAP": false, "accommodations": [], "lastUpdated": "", "diagnosisPrivate": ""}'),
('2023-9988', 'Juan López Pérez', '3º B', '{"name": "Abuela López", "phonePrimary": "55-5555-5555", "relationship": "Tutora Legal"}', '{"hasBAP": false, "accommodations": [], "lastUpdated": "", "diagnosisPrivate": ""}'),
('2023-1122', 'Sofia Hernández G.', '3º B', '{"name": "Roberto Hernández", "phonePrimary": "55-8765-4321", "relationship": "Padre"}', '{"hasBAP": true, "accommodations": ["Ubicación preferencial", "Segmentación de tareas"], "lastUpdated": "2023-10-01", "diagnosisPrivate": "TDAH"}'),
('2023-7711', 'Ana Martínez Vela', '3º B', '{"name": "Luisa Vela", "phonePrimary": "55-1111-2222", "relationship": "Madre"}', '{"hasBAP": false, "accommodations": [], "lastUpdated": "", "diagnosisPrivate": ""}'),
('2023-3344', 'Pedro Pascal Domínguez', '3º B', '{"name": "Javier Pascal", "phonePrimary": "55-9999-0000", "relationship": "Tío"}', '{"hasBAP": false, "accommodations": [], "lastUpdated": "", "diagnosisPrivate": ""}'),

-- 2º A (Grupo con BAP)
('2024-1001', 'Valentina Solís', '2º A', '{"name": "Carmen Solís", "phonePrimary": "55-4444-3333", "relationship": "Madre"}', '{"hasBAP": true, "accommodations": ["Lenguaje de Señas", "Intérprete en aula"], "lastUpdated": "2024-01-15", "diagnosisPrivate": "Hipoacusia leve"}'),
('2024-1002', 'Miguel Angel Torres', '2º A', '{"name": "Angel Torres", "phonePrimary": "55-2222-1111", "relationship": "Padre"}', '{"hasBAP": false, "accommodations": [], "lastUpdated": "", "diagnosisPrivate": ""}'),

-- 1º F (Grupo Nuevo Ingreso)
('2025-0001', 'Lucía Méndez', '1º F', '{"name": "Rosa Méndez", "phonePrimary": "55-7777-8888", "relationship": "Madre"}', '{"hasBAP": false, "accommodations": [], "lastUpdated": "", "diagnosisPrivate": ""}'),
('2025-0002', 'Jorge Campos', '1º F', '{"name": "Jorge Sr.", "phonePrimary": "55-6666-5555", "relationship": "Padre"}', '{"hasBAP": false, "accommodations": [], "lastUpdated": "", "diagnosisPrivate": ""}')

on conflict (matricula) do nothing;

-- 3. Crear Incidencias Iniciales (Para probar Dashboard)
-- Carlos (3 Retardos -> Observado)
insert into public.incidencias (alumno_id, tipo, descripcion, fecha) 
select id, 'RETARDO', 'Llegada tarde 10 min', now() - interval '2 days' from public.alumnos where matricula = '2023-4492';

insert into public.incidencias (alumno_id, tipo, descripcion, fecha) 
select id, 'RETARDO', 'Llegada tarde 15 min', now() - interval '1 day' from public.alumnos where matricula = '2023-4492';

-- Sofia (Conducta -> Patrón Detectado)
insert into public.incidencias (alumno_id, tipo, descripcion, fecha) 
select id, 'CONDUCTA', 'Uso de celular en clase', now() - interval '5 days' from public.alumnos where matricula = '2023-1122';

insert into public.incidencias (alumno_id, tipo, descripcion, fecha) 
select id, 'UNIFORME', 'Sin uniforme completo', now() - interval '3 days' from public.alumnos where matricula = '2023-1122';

insert into public.incidencias (alumno_id, tipo, descripcion, fecha) 
select id, 'CONDUCTA', 'Falta de respeto a compañero', now() from public.alumnos where matricula = '2023-1122';
