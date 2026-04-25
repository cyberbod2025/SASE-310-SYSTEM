-- Habilita a los usuarios para actualizar campos específicos de su propio perfil.
-- Necesario para la subida de fotos de perfil y actualización de datos de contacto.

drop policy if exists "Usuarios actualizan su propio perfil" on public.perfiles_usuario;

create policy "Usuarios actualizan su propio perfil"
on public.perfiles_usuario
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id 
  and (
    -- Solo permitimos editar campos de presentación, no el rol ni permisos institucionales
    rol is not distinct from rol
    and role is not distinct from role
    and email is not distinct from email
    and matricula_sase is not distinct from matricula_sase
  )
);
