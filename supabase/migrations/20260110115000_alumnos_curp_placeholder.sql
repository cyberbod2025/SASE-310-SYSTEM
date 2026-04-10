-- Asegura que la importación masiva de alumnos no falle por CURP nula
-- y normaliza los registros existentes con un CURP temporal basado en la matrícula.

alter table public.alumnos
  alter column curp drop not null;

update public.alumnos
set curp = 'SASE' || matricula || 'TEMPXXXX'
where curp is null;
