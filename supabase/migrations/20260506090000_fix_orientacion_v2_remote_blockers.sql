-- Hotfix Orientacion v2: bloqueadores remotos de happy path.
-- Alcance: corrige trigger de solicitudes, EXECUTE de RPCs y grants minimos de tablas.
-- No implementa vencimiento, no toca diagnostico colectivo, Feria, SOS ni modulos externos.

CREATE OR REPLACE FUNCTION public.fn_marcar_solicitud_respondida()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.solicitud_id IS NOT NULL THEN
    UPDATE public.solicitudes_diagnostico
    SET estado = 'respondido',
        fecha_respuesta = now()
    WHERE id = NEW.solicitud_id
      AND estado <> 'respondido';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_diag_responde ON public.diagnosticos_docentes;
DROP TRIGGER IF EXISTS tr_marcar_solicitud_respondida ON public.diagnosticos_docentes;

CREATE TRIGGER tr_marcar_solicitud_respondida
AFTER INSERT ON public.diagnosticos_docentes
FOR EACH ROW
EXECUTE FUNCTION public.fn_marcar_solicitud_respondida();

CREATE OR REPLACE FUNCTION public.audit_orientacion_action(
  p_tipo_accion text,
  p_descripcion text,
  p_tabla text,
  p_id_registro text,
  p_new_values jsonb DEFAULT NULL::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit_id uuid;
BEGIN
  INSERT INTO public.auditoria (
    usuario_id,
    email_usuario,
    rol_usuario,
    tipo_accion,
    descripcion_accion,
    tabla_objetivo,
    id_registro_objetivo,
    new_values
  ) VALUES (
    auth.uid(),
    auth.jwt() ->> 'email',
    public.get_my_role_text(),
    p_tipo_accion,
    p_descripcion,
    p_tabla,
    p_id_registro,
    p_new_values
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$;

-- RPCs usadas por src/components/orientacion/orientacionApi.ts.
-- Firmas exactas; no se usa GRANT EXECUTE ON ALL FUNCTIONS.
REVOKE ALL ON FUNCTION public.abrir_caso_orientacion(uuid, text, text, text, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.audit_orientacion_action(text, text, text, text, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.solicitar_diagnostico(uuid, uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.registrar_diagnostico(uuid, text, text, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.crear_plan_intervencion(uuid, text, text, text, date, date, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.derivar_trabajo_social(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.escalar_direccion(uuid, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.abrir_caso_orientacion(uuid, text, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.audit_orientacion_action(text, text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.solicitar_diagnostico(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.registrar_diagnostico(uuid, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crear_plan_intervencion(uuid, text, text, text, date, date, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.derivar_trabajo_social(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.escalar_direccion(uuid, text) TO authenticated;

-- Grants de tabla: RLS permanece activo como filtro real.
-- Primero se limpia cualquier grant amplio heredado, especialmente anon y DELETE/TRUNCATE.
REVOKE ALL ON TABLE public.orientacion_casos FROM anon;
REVOKE ALL ON TABLE public.solicitudes_diagnostico FROM anon;
REVOKE ALL ON TABLE public.diagnosticos_docentes FROM anon;
REVOKE ALL ON TABLE public.planes_intervencion FROM anon;
REVOKE ALL ON TABLE public.seguimiento_orientacion FROM anon;

REVOKE ALL ON TABLE public.orientacion_casos FROM authenticated;
REVOKE ALL ON TABLE public.solicitudes_diagnostico FROM authenticated;
REVOKE ALL ON TABLE public.diagnosticos_docentes FROM authenticated;
REVOKE ALL ON TABLE public.planes_intervencion FROM authenticated;
REVOKE ALL ON TABLE public.seguimiento_orientacion FROM authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE public.orientacion_casos TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.solicitudes_diagnostico TO authenticated;
GRANT SELECT, INSERT ON TABLE public.diagnosticos_docentes TO authenticated;
GRANT SELECT, INSERT ON TABLE public.planes_intervencion TO authenticated;
GRANT SELECT, INSERT ON TABLE public.seguimiento_orientacion TO authenticated;
