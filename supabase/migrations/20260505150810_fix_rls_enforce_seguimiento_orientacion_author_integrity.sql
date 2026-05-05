-- fix(rls): enforce seguimiento orientacion author integrity

-- 1. Establecer default seguro para created_by
ALTER TABLE public.seguimiento_orientacion
ALTER COLUMN created_by SET DEFAULT auth.uid();

-- 2. Actualizar la política "Orientacion gestiona seguimiento propio"
-- Mantenemos la lógica de acceso al caso pero blindamos el created_by en el WITH CHECK
DROP POLICY IF EXISTS "Orientacion gestiona seguimiento propio" ON public.seguimiento_orientacion;

CREATE POLICY "Orientacion gestiona seguimiento propio" ON public.seguimiento_orientacion
FOR ALL
TO authenticated
USING (
  (public.get_my_role_text() = 'orientacion'::text) AND 
  (EXISTS ( 
    SELECT 1 FROM public.orientacion_casos c
    WHERE c.id = seguimiento_orientacion.caso_id 
      AND (c.creado_por = (SELECT auth.uid()) OR c.responsable_id = (SELECT auth.uid())) 
      AND c.estado <> 'cerrado'::text
  ))
)
WITH CHECK (
  (public.get_my_role_text() = 'orientacion'::text) AND 
  (EXISTS ( 
    SELECT 1 FROM public.orientacion_casos c
    WHERE c.id = seguimiento_orientacion.caso_id 
      AND (c.creado_por = (SELECT auth.uid()) OR c.responsable_id = (SELECT auth.uid())) 
      AND c.estado <> 'cerrado'::text
  )) AND
  (created_by = (SELECT auth.uid()))
);

-- 3. Crear trigger para impedir cambios en created_by post-inserción
CREATE OR REPLACE FUNCTION public.prevent_seguimiento_created_by_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
    RAISE EXCEPTION 'created_by cannot be changed on seguimiento_orientacion' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_seguimiento_created_by_change ON public.seguimiento_orientacion;

CREATE TRIGGER trg_prevent_seguimiento_created_by_change
BEFORE UPDATE ON public.seguimiento_orientacion
FOR EACH ROW
EXECUTE FUNCTION public.prevent_seguimiento_created_by_change();
