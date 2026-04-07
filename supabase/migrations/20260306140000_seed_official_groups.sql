-- Migración: Sembrado de Grupos Oficiales SASE-310
-- Basado en la carga masiva de alumnos (Migration 20260110)

INSERT INTO public.grupos (nombre, ciclo_escolar)
VALUES 
('1º A', '2025-2026'),
('1º B', '2025-2026'),
('1º C', '2025-2026'),
('1º D', '2025-2026'),
('2º A', '2025-2026'),
('2º B', '2025-2026'),
('2º C', '2025-2026'),
('2º D', '2025-2026'),
('3º A', '2025-2026'),
('3º B', '2025-2026'),
('3º C', '2025-2026'),
('3º D', '2025-2026')
ON CONFLICT (nombre) DO NOTHING;

-- Log de Auditoría
INSERT INTO public.auditoria (tipo_accion, descripcion_accion, tabla_objetivo)
VALUES ('CREACION', 'Sembrado de 12 grupos institucionales (1º A a 3º D) para activación de Dashboard', 'grupos');
