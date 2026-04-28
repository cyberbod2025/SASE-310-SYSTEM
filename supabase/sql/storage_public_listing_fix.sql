-- SASE-310: cierre de listado publico en buckets Storage.
-- Ejecutar desde Supabase Dashboard SQL Editor o desde un rol owner/admin de storage.objects.
-- Motivo: algunos contextos MCP/CI no son owner de storage.objects y fallan con:
-- "must be owner of relation objects".

-- AVATARS
-- Public buckets siguen sirviendo URLs conocidas con getPublicUrl(); esta policy
-- solo evita enumerar/listar objetos ajenos por Storage API.
drop policy if exists "Avatar public read" on storage.objects;

create policy "avatars_read_safe"
on storage.objects
for select
using (
  bucket_id = 'avatars'
  and owner_id = auth.uid()::text
);

-- DOCUMENTOS DE SALUD
-- Bucket sensible: limitar listado/lectura por RLS a roles institucionales.
drop policy if exists "Allow public read documents" on storage.objects;

create policy "salud_read_safe"
on storage.objects
for select
using (
  bucket_id = 'documentos_salud'
  and exists (
    select 1
    from public.perfiles_usuario p
    where p.id = auth.uid()
      and p.rol in ('medico_escolar', 'directivo', 'subdireccion', 'admin', 'system_admin')
  )
);

-- VALIDACION DESPUES DE APLICAR
-- Debe regresar cero filas para policies publicas amplias de estos buckets.
select policyname, roles, qual
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname in ('Avatar public read', 'Allow public read documents');

-- Deben existir las policies seguras.
select policyname, roles, qual
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname in ('avatars_read_safe', 'salud_read_safe')
order by policyname;
