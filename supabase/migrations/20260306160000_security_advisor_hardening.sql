-- =====================================================
-- SASE-310: Hardening de Seguridad (Advisor Fixes)
-- Migración: Resolviendo alertas de Advisor y Sentinel
-- =====================================================

-- 1) HARDENING DE FUNCIONES (Search Path Hijacking Protection)
-- Usamos bloques DO para que sea resiliente si alguna función no existe o tiene otra firma

DO $$ 
BEGIN 
  -- handle_new_user
  IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE proname = 'handle_new_user' AND nspname = 'public') THEN
    ALTER FUNCTION public.handle_new_user() SET search_path = public;
  END IF;

  -- log_audit (puede tener firmas distintas según la versión)
  IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE proname = 'log_audit' AND nspname = 'public') THEN
    -- Intentamos las firmas conocidas
    BEGIN
      ALTER FUNCTION public.log_audit(text, text, text, uuid, text, jsonb, jsonb) SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
      NULL;
    END;
  END IF;

  -- generar_matricula_sase
  IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE proname = 'generar_matricula_sase' AND nspname = 'public') THEN
    ALTER FUNCTION public.generar_matricula_sase() SET search_path = public;
  END IF;

  -- auto_assign_matricula
  IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE proname = 'auto_assign_matricula' AND nspname = 'public') THEN
    ALTER FUNCTION public.auto_assign_matricula() SET search_path = public;
  END IF;

  -- registrar_auditoria_sase
  IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE proname = 'registrar_auditoria_sase' AND nspname = 'public') THEN
    BEGIN
      ALTER FUNCTION public.registrar_auditoria_sase(uuid, text, text, text, text, text, text) SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
      NULL;
    END;
  END IF;

  -- get_my_role
  IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE proname = 'get_my_role' AND nspname = 'public') THEN
    ALTER FUNCTION public.get_my_role() SET search_path = public;
  END IF;

  -- checar_patron_incidencias
  IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE proname = 'checar_patron_incidencias' AND nspname = 'public') THEN
    ALTER FUNCTION public.checar_patron_incidencias() SET search_path = public;
  END IF;

  -- sandbox_detectar_patron
  IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE proname = 'sandbox_detectar_patron' AND nspname = 'public') THEN
    ALTER FUNCTION public.sandbox_detectar_patron() SET search_path = public;
  END IF;
END $$;


-- 2) TIGHTENING DE POLÍTICAS (Evitar fuga de datos a usuarios anónimos)

-- Tabla Profiles: Solo usuarios autenticados pueden ver perfiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

-- Tabla Perfiles Usuario: Asegurar que anónimos no vean datos sensibles
ALTER TABLE public.perfiles_usuario ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Ver perfiles propios" ON public.perfiles_usuario;
CREATE POLICY "Users view own perfiles_usuario" 
ON public.perfiles_usuario FOR SELECT 
TO authenticated 
USING (auth.uid() = id OR (SELECT public.get_my_role()) IN ('directivo', 'admin', 'secretaria'));


-- 3) SEGURIDAD DE VISTAS (Security Invoker)
-- En PG 15+, las vistas deben invocar permisos del usuario si se exponen a la API

-- Re-crear vistas críticas con invoker security
DROP VIEW IF EXISTS public.alumnos_en_riesgo;
DROP VIEW IF EXISTS public.expediente_integral_alumno;

CREATE VIEW public.expediente_integral_alumno 
WITH (security_invoker = true) AS
SELECT 
    a.id AS alumno_id,
    a.nombre_completo AS nombre,
    a.grupo,
    a.grado,
    a.estado_caso,
    (SELECT count(*) FROM public.incidencias WHERE alumno_id = a.id) AS total_incidencias,
    (SELECT count(*) FROM public.atenciones_medicas WHERE alumno_id = a.id) AS total_atenciones_medicas,
    (SELECT count(*) FROM public.justificantes WHERE alumno_id = a.id) AS total_justificantes,
    (SELECT count(*) FROM public.calificaciones WHERE alumno_id = a.id) AS total_calificaciones,
    (SELECT count(*) FROM public.seguimiento_social WHERE alumno_id = a.id) AS total_social,
    (SELECT count(*) FROM public.registro_lectura WHERE alumno_id = a.id) AS total_lectura,
    (SELECT count(*) FROM public.seguimiento_bap WHERE alumno_id = a.id) AS total_bap,
    COALESCE(e.total_puntos, 0) AS puntos_gamificacion,
    COALESCE(e.escaneos_realizados, 0) AS escaneos_gamificacion,
    e.nickname AS nickname_gamificacion,
    EXISTS (SELECT 1 FROM public.socioeconomico_general WHERE alumno_id = a.id) AS tiene_ficha_social
FROM public.alumnos a
LEFT JOIN public.estudiantes e ON e.alumno_id = a.id;

CREATE VIEW public.alumnos_en_riesgo 
WITH (security_invoker = true) AS
SELECT 
    alumno_id,
    nombre,
    grupo,
    total_incidencias,
    total_social,
    total_bap,
    total_calificaciones,
    CASE
        WHEN total_incidencias >= 5 THEN 'ALERTA_CRITICA'
        WHEN total_incidencias >= 3 THEN 'ALERTA_MEDIA'
        WHEN total_social > 0 THEN 'SEGUIMIENTO_SOCIAL'
        WHEN total_bap > 0 THEN 'SEGUIMIENTO_BAP'
        ELSE 'NORMAL'
    END AS nivel_alerta
FROM public.expediente_integral_alumno
WHERE total_incidencias >= 3 
   OR total_social > 0 
   OR total_bap > 0;


-- 4) REMOVER POLÍTICAS INSEGURAS DETECTADAS EN MIGRACIONES ANTIGUAS
DROP POLICY IF EXISTS "Usuarios autenticados pueden registrar acciones" ON public.audit_log;
CREATE POLICY "Audit logs insert restriction" 
ON public.audit_log FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);


-- 5) REGISTRO DE HARDENING
INSERT INTO public.auditoria (tipo_accion, descripcion_accion, tabla_objetivo)
VALUES ('SECURITY_HARDENING', 'Advisor Patch: Search Path protection and View Security Invoker implemented.', 'database_schema');

-- ✅ Hardening Completado
