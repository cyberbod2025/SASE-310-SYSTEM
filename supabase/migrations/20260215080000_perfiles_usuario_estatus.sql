-- Agrega columna estatus para seeds y políticas de perfiles_usuario.

alter table public.perfiles_usuario
  add column if not exists estatus text;
