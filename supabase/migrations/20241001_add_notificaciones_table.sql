-- 2024-10-01: Tabla de notificaciones institucionales
create table public.notificaciones (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  mensaje     text not null,
  tipo        text not null,          -- SYSTEM | ADMIN | USER …
  rol_destino text not null,          -- rol que debe ver la notificación
  leida       boolean default false,
  creado_en   timestamptz default now()
);
-- Índices para consultas rápidas
create index idx_notificaciones_rol on public.notificaciones (rol_destino);
create index idx_notificaciones_leida on public.notificaciones (leida);
