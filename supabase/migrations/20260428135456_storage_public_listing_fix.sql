-- SASE-310: cierre de listado publico en buckets Storage.
-- Ejecutar como migracion con un rol owner/admin de storage.objects.

drop policy if exists "Avatar public read" on storage.objects;
drop policy if exists "avatars_read_safe" on storage.objects;

create policy "avatars_read_safe"
on storage.objects
for select
using (
  bucket_id = 'avatars'
  and owner_id = auth.uid()::text
);

drop policy if exists "Allow public read documents" on storage.objects;
drop policy if exists "salud_read_safe" on storage.objects;

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
