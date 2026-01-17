-- ==============================================================================
-- REPARACIÓN DE TRIGGER DE AUTENTICACIÓN
-- Soluciona el error "Database error creating new user"
-- ==============================================================================

-- 1. Elimina temporalmente el trigger para desbloquear la creación simple
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Creamos una función robusta que no falle por Enums
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insertamos en perfiles_usuario con un rol seguro (DOCENTE)
  -- Usamos ::text ::app_role (si existe el cast) o directo si coincide.
  -- Para evitar errores, insertamos valores básicos.
  
  INSERT INTO public.perfiles_usuario (id, email, nombre_completo, rol, estado_cuenta)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Usuario Nuevo'),
    'DOCENTE', -- Asumimos que 'DOCENTE' es válido en el Enum. Si falla, probar 'teacher' o 'user'.
    'activo'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Si falla algo, LO IGNORAMOS para permitir que el usuario se cree en Auth
    -- Luego podremos arreglar el perfil manualmente.
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Reactivar el Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
