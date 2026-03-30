-- 2024-10-01: Tabla de notificaciones institucionales (compatibilidad)
create table if not exists public.notificaciones (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  mensaje     text not null,
  tipo        text not null,
  rol_destino text not null,
  leida       boolean default false,
  creado_en   timestamptz default now()
);

create index if not exists idx_notificaciones_rol on public.notificaciones (rol_destino);
create index if not exists idx_notificaciones_leida on public.notificaciones (leida);
