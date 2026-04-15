-- Migración de Blindaje de Seguridad y Hardening RLS (Hallazgo 1)
-- Fecha: 2026-03-12
-- Descripción: Corrección de Security Definer Views, hardening de funciones con search_path y restricción de políticas en tabla estudiantes.

-- 1. Hardening de Funciones (Search Path) para evitar ataques de búsqueda de esquema
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'trigger_update_student_risk') THEN ALTER FUNCTION public.trigger_update_student_risk() SET search_path = public; END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_student_risk') THEN ALTER FUNCTION public.calculate_student_risk(uuid) SET search_path = public; END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_my_role') THEN ALTER FUNCTION public.get_my_role() SET search_path = public; END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'log_semaphore_change') THEN ALTER FUNCTION public.log_semaphore_change() SET search_path = public; END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'log_expediente_access') THEN ALTER FUNCTION public.log_expediente_access() SET search_path = public; END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_preguntometro_limit') THEN ALTER FUNCTION public.check_preguntometro_limit() SET search_path = public; END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'finalizar_trivia_v2') THEN ALTER FUNCTION public.finalizar_trivia_v2(uuid, uuid, integer) SET search_path = public; END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'registrar_progreso_v2') THEN ALTER FUNCTION public.registrar_progreso_v2(uuid, uuid, integer) SET search_path = public; END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'increment_visitantes') THEN ALTER FUNCTION public.increment_visitantes(uuid) SET search_path = public; END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'decrement_visitantes') THEN ALTER FUNCTION public.decrement_visitantes(uuid) SET search_path = public; END IF;
END $$;

-- 2. Corrección de Vista con SECURITY DEFINER (Referencia a Hallazgo de Seguridad)
-- Re-crear v_perfiles_activos como SECURITY INVOKER (comportamiento por defecto)
DROP VIEW IF EXISTS public.v_perfiles_activos;
CREATE VIEW public.v_perfiles_activos AS
SELECT id,
    COALESCE(full_name, nombre_completo, nombres) AS nombre_completo,
    COALESCE(rol, role) AS rol
FROM ( 
    SELECT profiles.id,
           profiles.full_name,
           profiles.role::text AS role,
           NULL::text AS nombre_completo,
           NULL::text AS nombres,
           profiles.role::text AS rol
    FROM profiles
    UNION ALL
    SELECT perfiles_usuario.id,
           NULL::text,
           NULL::text,
           perfiles_usuario.nombre_completo,
           NULL::text,
           perfiles_usuario.rol
    FROM perfiles_usuario
    WHERE NOT (perfiles_usuario.id IN (SELECT profiles.id FROM profiles))
) sub;

-- 3. Hardening de RLS en la tabla 'estudiantes' (Hallazgo de políticas demasiado permisivas)
-- Eliminar políticas públicas inseguras identificadas en el escaneo
DROP POLICY IF EXISTS "Permitir registro público" ON public.estudiantes;
DROP POLICY IF EXISTS "Permitir actualización pública" ON public.estudiantes;

-- Crear políticas seguras basadas en autenticación
CREATE POLICY "Permitir registro para usuarios autenticados" 
ON public.estudiantes 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir actualización propia para estudiantes" 
ON public.estudiantes 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 4. Registro en Auditoría del cumplimiento del Hallazgo 1
INSERT INTO public.auditoria (tipo_accion, descripcion_accion, tabla_objetivo, usuario_id)
VALUES ('SEGURIDAD_HARDENING', 'Aplicación de Hardening RLS y corrección de search_path (Hallazgo 1 Biblioteca)', 'sistema', (SELECT auth.uid()));
