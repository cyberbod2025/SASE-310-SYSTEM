-- Bucket y políticas mínimas para fotos de perfil SASE.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar public read"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

create policy "Authenticated avatar upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'avatars');

create policy "Authenticated avatar update"
on storage.objects
for update
to authenticated
using (bucket_id = 'avatars')
with check (bucket_id = 'avatars');

create policy "Authenticated avatar delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'avatars');
