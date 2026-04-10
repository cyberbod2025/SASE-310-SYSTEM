-- Asegura que la importación masiva de alumnos no falle por CURP nula
-- y normaliza los registros existentes con un CURP temporal basado en la matrícula.

alter table public.alumnos
  alter column curp drop not null;

-- Actualización segura para evitar errores de duplicado usando el ID (UUID)
-- para garantizar que cada CURP sea único incluso si hay colisiones lógicas.
update public.alumnos
set curp = 'SASE-' || left(id::text, 8) || '-' || matricula
where curp is null;
