-- UNIT_30_OBJETOS_RETENIDOS: cadena de custodia institucional
alter table if exists public.objetos_retenidos
  add column if not exists fecha_devolucion timestamptz null,
  add column if not exists entregado_a text null,
  add column if not exists entregado_por uuid null,
  add column if not exists lugar_retencion text null,
  add column if not exists categoria text null,
  add column if not exists observaciones text null,
  add column if not exists evidencia_url text null,
  add column if not exists autorizado_por uuid null;
