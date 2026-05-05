-- Purpose: Fix Supabase Advisor lint 0003_auth_rls_initplan for static policies.
-- This migration ONLY wraps auth.uid()/jwt()/role() in (SELECT ...) to force initPlan.
-- No security logic, roles, commands, or policy scopes are changed.
-- Source of truth: pg_policies from local Supabase (post db reset).

-- [alumno_ciclo] Personal lee registros de alumnos por ciclo
ALTER POLICY "Personal lee registros de alumnos por ciclo" ON public.alumno_ciclo
  USING (((select auth.role()) = 'authenticated'::text));

-- [alumnos] Docentes ven sus grupos
ALTER POLICY "Docentes ven sus grupos" ON public.alumnos
  USING ((EXISTS ( SELECT 1
   FROM perfiles_usuario p
  WHERE ((p.id = (select auth.uid())) AND ((p.rol = ANY (ARRAY['docente'::text, 'docente_tutor'::text])) OR (p.role = ANY (ARRAY['docente'::text, 'docente_tutor'::text]))) AND (alumnos.grupo = ANY (COALESCE(p.grupos, ARRAY[]::text[])))))));

-- [alumnos] Staff Institucional ve todo
ALTER POLICY "Staff Institucional ve todo" ON public.alumnos
  USING (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND ((profiles.role)::text = ANY (ARRAY['directivo'::text, 'subdireccion'::text, 'secretaria'::text, 'prefectura'::text, 'orientacion'::text, 'trabajo_social'::text, 'admin'::text, 'developer'::text, 'system_admin'::text]))))) OR (EXISTS ( SELECT 1
   FROM perfiles_usuario
  WHERE ((perfiles_usuario.id = (select auth.uid())) AND ((perfiles_usuario.rol = ANY (ARRAY['directivo'::text, 'subdireccion'::text, 'secretaria'::text, 'prefectura'::text, 'orientacion'::text, 'trabajo_social'::text, 'admin'::text, 'developer'::text, 'system_admin'::text])) OR (perfiles_usuario.role = ANY (ARRAY['directivo'::text, 'subdireccion'::text, 'secretaria'::text, 'prefectura'::text, 'orientacion'::text, 'trabajo_social'::text, 'admin'::text, 'developer'::text, 'system_admin'::text]))))))));

-- [asignacion_alumno_grupo] Personal lee movimientos de grupo
ALTER POLICY "Personal lee movimientos de grupo" ON public.asignacion_alumno_grupo
  USING (((select auth.role()) = 'authenticated'::text));

-- [asignaciones_profesor] Todos pueden ver asignaciones
ALTER POLICY "Todos pueden ver asignaciones" ON public.asignaciones_profesor
  USING (((select auth.role()) = 'authenticated'::text));

-- [atenciones_medicas] Personal de salud puede insertar atenciones
ALTER POLICY "Personal de salud puede insertar atenciones" ON public.atenciones_medicas
  WITH CHECK (((select auth.uid()) IS NOT NULL));

-- [atenciones_medicas] Personal puede ver sus propios registros de salud
ALTER POLICY "Personal puede ver sus propios registros de salud" ON public.atenciones_medicas
  USING (((generado_por = (select auth.uid())) OR (atendido_por = (select auth.uid())) OR (EXISTS ( SELECT 1
   FROM perfiles_usuario
  WHERE ((perfiles_usuario.id = (select auth.uid())) AND (perfiles_usuario.rol = ANY (ARRAY['directivo'::text, 'subdireccion'::text, 'admin'::text])))))));

-- [attendance_logs] Prefectura y Docentes registran asistencia
ALTER POLICY "Prefectura y Docentes registran asistencia" ON public.attendance_logs
  USING ((EXISTS ( SELECT 1
   FROM perfiles_usuario
  WHERE ((perfiles_usuario.id = (select auth.uid())) AND (perfiles_usuario.rol = ANY (ARRAY['prefectura'::text, 'docente'::text, 'direccion'::text, 'desarrollador'::text]))))));

-- [audit_logs] Audit logs restricted view
ALTER POLICY "Audit logs restricted view" ON public.audit_logs
  USING ((COALESCE((((select auth.jwt()) -> 'app_metadata'::text) ->> 'role'::text), ((select auth.jwt()) ->> 'role'::text)) = ANY (ARRAY['directivo'::text, 'system_admin'::text, 'developer'::text])));

-- [auditoria] Auditoria restricted view
ALTER POLICY "Auditoria restricted view" ON public.auditoria
  USING ((COALESCE((((select auth.jwt()) -> 'app_metadata'::text) ->> 'role'::text), ((select auth.jwt()) ->> 'role'::text)) = ANY (ARRAY['directivo'::text, 'system_admin'::text, 'developer'::text])));

-- [auditoria_accesos] Directivos ven auditoria_accesos
ALTER POLICY "Directivos ven auditoria_accesos" ON public.auditoria_accesos
  USING (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND ((profiles.role)::text = ANY (ARRAY['directivo'::text, 'subdireccion'::text, 'admin'::text, 'developer'::text]))))) OR (EXISTS ( SELECT 1
   FROM perfiles_usuario p
  WHERE ((p.id = (select auth.uid())) AND (p.rol = ANY (ARRAY['directivo'::text, 'subdireccion'::text, 'admin'::text, 'developer'::text])))))));

-- [auditoria_accesos] Usuarios registran su acceso
ALTER POLICY "Usuarios registran su acceso" ON public.auditoria_accesos
  WITH CHECK ((usuario = (select auth.uid())));

-- [ciclos_escolares] Todos los autenticados ven ciclos
ALTER POLICY "Todos los autenticados ven ciclos" ON public.ciclos_escolares
  USING (((select auth.role()) = 'authenticated'::text));

-- [comunicados] Directivos pueden crear comunicados
ALTER POLICY "Directivos pueden crear comunicados" ON public.comunicados
  WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.role = 'directivo'::app_role)))));

-- [comunicados] Enable insert for authenticated users
ALTER POLICY "Enable insert for authenticated users" ON public.comunicados
  WITH CHECK (((select auth.role()) = 'authenticated'::text));

-- [comunicados] Enable read access for authenticated users
ALTER POLICY "Enable read access for authenticated users" ON public.comunicados
  USING (((select auth.role()) = 'authenticated'::text));

-- [diagnosticos_docentes] Docentes gestionan sus diagnósticos
ALTER POLICY "Docentes gestionan sus diagnósticos" ON public.diagnosticos_colectivos_docentes
  USING (((docente_id = ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.id = (select auth.uid())))) AND (( SELECT (profiles.role)::text AS role
   FROM profiles
  WHERE (profiles.id = (select auth.uid()))) = ANY (ARRAY['docente'::text, 'docente_tutor'::text]))))
  WITH CHECK (((docente_id = ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.id = (select auth.uid())))) AND (( SELECT (profiles.role)::text AS role
   FROM profiles
  WHERE (profiles.id = (select auth.uid()))) = ANY (ARRAY['docente'::text, 'docente_tutor'::text]))));

-- [diagnosticos_docentes] Roles institucionales leen diagnósticos
ALTER POLICY "Roles institucionales leen diagnósticos" ON public.diagnosticos_colectivos_docentes
  USING ((( SELECT (profiles.role)::text AS role
   FROM profiles
  WHERE (profiles.id = (select auth.uid()))) = ANY (ARRAY['orientacion'::text, 'trabajo_social'::text, 'directivo'::text, 'subdireccion'::text, 'developer'::text, 'system_admin'::text])));

-- [estudiantes] Permitir actualización propia para estudiantes
ALTER POLICY "Permitir actualización propia para estudiantes" ON public.estudiantes
  USING (((select auth.uid()) = id))
  WITH CHECK (((select auth.uid()) = id));

-- [estudiantes] Permitir registro para usuarios autenticados
ALTER POLICY "Permitir registro para usuarios autenticados" ON public.estudiantes
  WITH CHECK (((select auth.role()) = 'authenticated'::text));

-- [eventos] Crear eventos
ALTER POLICY "Crear eventos" ON public.eventos
  WITH CHECK (((select auth.uid()) = creado_por));

-- [eventos] Eliminar eventos propios
ALTER POLICY "Eliminar eventos propios" ON public.eventos
  USING (((select auth.uid()) = creado_por));

-- [eventos] Modificar eventos propios
ALTER POLICY "Modificar eventos propios" ON public.eventos
  USING (((select auth.uid()) = creado_por));

-- [feria_pilotos] Admins can manage feria pilots
ALTER POLICY "Admins can manage feria pilots" ON public.feria_pilotos
  USING ((EXISTS ( SELECT 1
   FROM perfiles_usuario
  WHERE ((perfiles_usuario.id = (select auth.uid())) AND (perfiles_usuario.rol = ANY (ARRAY['admin'::text, 'system_admin'::text, 'directivo'::text]))))));

-- [grupos] Solo admin crea grupos
ALTER POLICY "Solo admin crea grupos" ON public.grupos
  WITH CHECK ((EXISTS ( SELECT 1
   FROM perfiles_usuario
  WHERE ((perfiles_usuario.id = (select auth.uid())) AND (perfiles_usuario.rol = ANY (ARRAY['directivo'::text, 'admin'::text]))))));

-- [grupos] Todos pueden ver grupos
ALTER POLICY "Todos pueden ver grupos" ON public.grupos
  USING (((select auth.role()) = 'authenticated'::text));

-- [incidencias] Incidencias update control
ALTER POLICY "Incidencias update control" ON public.incidencias
  USING (((get_my_role() = ANY (ARRAY['directivo'::app_role, 'subdireccion'::app_role, 'orientacion'::app_role, 'trabajo_social'::app_role, 'system_admin'::app_role])) OR ((get_my_role() = 'prefectura'::app_role) AND (lower(COALESCE(estado, ''::text)) <> ALL (ARRAY['escalado'::text, 'escalada'::text, 'cerrado'::text, 'cerrada'::text, 'cerrado_por_direccion'::text]))) OR ((get_my_role() = ANY (ARRAY['docente'::app_role, 'docente_tutor'::app_role])) AND (lower(COALESCE(estado, ''::text)) <> ALL (ARRAY['escalado'::text, 'escalada'::text, 'cerrado'::text, 'cerrada'::text, 'cerrado_por_direccion'::text])) AND ((reportado_por = (select auth.uid())) OR (reportado_por_docente = (select auth.uid()))))))
  WITH CHECK (((get_my_role() = ANY (ARRAY['directivo'::app_role, 'subdireccion'::app_role, 'orientacion'::app_role, 'trabajo_social'::app_role, 'system_admin'::app_role])) OR ((get_my_role() = 'prefectura'::app_role) AND (lower(COALESCE(estado, ''::text)) <> ALL (ARRAY['cerrado'::text, 'cerrada'::text, 'cerrado_por_direccion'::text]))) OR ((get_my_role() = ANY (ARRAY['docente'::app_role, 'docente_tutor'::app_role])) AND (lower(COALESCE(estado, ''::text)) <> ALL (ARRAY['escalado'::text, 'escalada'::text, 'cerrado'::text, 'cerrada'::text, 'cerrado_por_direccion'::text])) AND ((reportado_por = (select auth.uid())) OR (reportado_por_docente = (select auth.uid()))))));

-- [incidencias] Staff Institucional ve incidencias
ALTER POLICY "Staff Institucional ve incidencias" ON public.incidencias
  USING (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND ((profiles.role)::text = ANY (ARRAY['directivo'::text, 'subdireccion'::text, 'secretaria'::text, 'prefectura'::text, 'orientacion'::text, 'trabajo_social'::text, 'admin'::text, 'developer'::text, 'system_admin'::text]))))) OR (EXISTS ( SELECT 1
   FROM perfiles_usuario p
  WHERE ((p.id = (select auth.uid())) AND ((p.rol = ANY (ARRAY['directivo'::text, 'subdireccion'::text, 'secretaria'::text, 'prefectura'::text, 'orientacion'::text, 'trabajo_social'::text, 'admin'::text, 'developer'::text, 'system_admin'::text])) OR (p.role = ANY (ARRAY['directivo'::text, 'subdireccion'::text, 'secretaria'::text, 'prefectura'::text, 'orientacion'::text, 'trabajo_social'::text, 'admin'::text, 'developer'::text, 'system_admin'::text])))))) OR (reportado_por = (select auth.uid()))));

-- [incidencias] system_admin_all_incidencias
ALTER POLICY "system_admin_all_incidencias" ON public.incidencias
  USING ((EXISTS ( SELECT 1
   FROM perfiles_usuario pu
  WHERE ((pu.id = (select auth.uid())) AND (pu.rol = 'system_admin'::text)))));

-- [modulos_ecosistema] Modulos visibles para todos los autenticados
ALTER POLICY "Modulos visibles para todos los autenticados" ON public.modulos_ecosistema
  USING (((select auth.role()) = 'authenticated'::text));

-- [modulos_ecosistema] Modulos visibles para usuarios autenticados
ALTER POLICY "Modulos visibles para usuarios autenticados" ON public.modulos_ecosistema
  USING (((select auth.role()) = 'authenticated'::text));

-- [modulos_ecosistema_roles] Reglas de roles visibles para usuarios autenticados
ALTER POLICY "Reglas de roles visibles para usuarios autenticados" ON public.modulos_ecosistema_roles
  USING (((select auth.role()) = 'authenticated'::text));

-- [modulos_ecosistema_roles] Todos los autenticados pueden ver las reglas de roles
ALTER POLICY "Todos los autenticados pueden ver las reglas de roles" ON public.modulos_ecosistema_roles
  USING (((select auth.role()) = 'authenticated'::text));

-- [modulos_ecosistema_usuarios] Usuarios pueden ver sus propios permisos de modulos
ALTER POLICY "Usuarios pueden ver sus propios permisos de modulos" ON public.modulos_ecosistema_usuarios
  USING ((((select auth.uid()) = user_id) OR (lower(TRIM(BOTH FROM email)) = get_my_normalized_email())));

-- [modulos_ecosistema_usuarios] Usuarios ven sus propias reglas de ecosistema
ALTER POLICY "Usuarios ven sus propias reglas de ecosistema" ON public.modulos_ecosistema_usuarios
  USING ((((select auth.uid()) = user_id) OR (lower(TRIM(BOTH FROM email)) = get_my_normalized_email())));

-- [notificaciones] notificaciones_insert_service_role
ALTER POLICY "notificaciones_insert_service_role" ON public.notificaciones
  WITH CHECK (((select auth.role()) = 'service_role'::text));

-- [notificaciones] notificaciones_read_rol_destino
ALTER POLICY "notificaciones_read_rol_destino" ON public.notificaciones
  USING ((rol_destino = ((select auth.jwt()) ->> 'role'::text)));

-- [perfiles_usuario] Los usuarios pueden ver su propio perfil completo
ALTER POLICY "Los usuarios pueden ver su propio perfil completo" ON public.perfiles_usuario
  USING (((select auth.uid()) = id));

-- [perfiles_usuario] Personal institucional puede ver nombres y roles de otros
ALTER POLICY "Personal institucional puede ver nombres y roles de otros" ON public.perfiles_usuario
  USING ((((select auth.role()) = 'authenticated'::text) AND (get_my_role_text() = ANY (ARRAY['directivo'::text, 'subdireccion'::text, 'prefectura'::text, 'orientacion'::text, 'trabajo_social'::text, 'developer'::text, 'system_admin'::text]))));

-- [perfiles_usuario] Users view own perfiles_usuario
ALTER POLICY "Users view own perfiles_usuario" ON public.perfiles_usuario
  USING ((((select auth.uid()) = id) OR (( SELECT get_my_role() AS get_my_role) = ANY (ARRAY['directivo'::app_role, 'admin'::app_role, 'secretaria'::app_role]))));

-- [perfiles_usuario] Usuarios actualizan su propio perfil
ALTER POLICY "Usuarios actualizan su propio perfil" ON public.perfiles_usuario
  USING (((select auth.uid()) = id))
  WITH CHECK ((((select auth.uid()) = id) AND ((NOT (rol IS DISTINCT FROM rol)) AND (NOT (email IS DISTINCT FROM email)) AND (NOT (matricula_sase IS DISTINCT FROM matricula_sase)))));

-- [perfiles_usuario] Usuarios ven su propio perfil
ALTER POLICY "Usuarios ven su propio perfil" ON public.perfiles_usuario
  USING (((select auth.uid()) = id));

-- [personal_oficial] system_admin_all_personal
ALTER POLICY "system_admin_all_personal" ON public.personal_oficial
  USING ((EXISTS ( SELECT 1
   FROM perfiles_usuario pu
  WHERE ((pu.id = (select auth.uid())) AND (pu.rol = 'system_admin'::text)))));

-- [profiles] Users can update their own profile.
ALTER POLICY "Users can update their own profile." ON public.profiles
  USING (((select auth.uid()) = id));

-- [profiles] Users update own profile
ALTER POLICY "Users update own profile" ON public.profiles
  USING (((select auth.uid()) = id));

-- [recordatorios] Ver recordatorios propios
ALTER POLICY "Ver recordatorios propios" ON public.recordatorios
  USING (((destinatario_id = (select auth.uid())) OR (creado_por = (select auth.uid()))));

-- [salud] Usuarios pueden ver su propio registro de salud
ALTER POLICY "Usuarios pueden ver su propio registro de salud" ON public.salud
  USING (((select auth.uid()) = alumno_id));

-- [sandbox_alertas] Authenticated users sandbox access
ALTER POLICY "Authenticated users sandbox access" ON public.sandbox_alertas
  USING (((select auth.role()) = 'authenticated'::text))
  WITH CHECK (((select auth.role()) = 'authenticated'::text));

-- [sase_alerts] Security alerts restricted view
ALTER POLICY "Security alerts restricted view" ON public.sase_alerts
  USING ((COALESCE((((select auth.jwt()) -> 'app_metadata'::text) ->> 'role'::text), ((select auth.jwt()) ->> 'role'::text)) = ANY (ARRAY['directivo'::text, 'system_admin'::text, 'developer'::text])));

-- [solicitudes] Enable insert for authenticated users
ALTER POLICY "Enable insert for authenticated users" ON public.solicitudes
  WITH CHECK (((select auth.role()) = 'authenticated'::text));

-- [solicitudes] Enable read access for authenticated users
ALTER POLICY "Enable read access for authenticated users" ON public.solicitudes
  USING (((select auth.role()) = 'authenticated'::text));

-- [solicitudes] Enable update for creators and assignees
ALTER POLICY "Enable update for creators and assignees" ON public.solicitudes
  USING ((((select auth.uid()) = created_by) OR (((select auth.uid()))::text = asignado_a)));

-- [solicitudes_alta_personal] Dirección actualiza solicitudes
ALTER POLICY "Dirección actualiza solicitudes" ON public.solicitudes_alta_personal
  USING ((EXISTS ( SELECT 1
   FROM perfiles_usuario
  WHERE ((perfiles_usuario.id = (select auth.uid())) AND (perfiles_usuario.rol = ANY (ARRAY['directivo'::text, 'direccion'::text, 'subdireccion'::text]))))));

-- [solicitudes_alta_personal] Dirección ve solicitudes
ALTER POLICY "Dirección ve solicitudes" ON public.solicitudes_alta_personal
  USING ((EXISTS ( SELECT 1
   FROM perfiles_usuario
  WHERE ((perfiles_usuario.id = (select auth.uid())) AND (perfiles_usuario.rol = ANY (ARRAY['directivo'::text, 'direccion'::text, 'subdireccion'::text]))))));

-- [solicitudes_documentos] Directivos pueden crear solicitudes
ALTER POLICY "Directivos pueden crear solicitudes" ON public.solicitudes_documentos
  WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.role = 'directivo'::app_role)))));

-- [solicitudes_documentos] Secretarios pueden actualizar solicitudes asignadas
ALTER POLICY "Secretarios pueden actualizar solicitudes asignadas" ON public.solicitudes_documentos
  USING ((asignado_a = (select auth.uid())));

-- [solicitudes_documentos] Ver solicitudes propias o asignadas
ALTER POLICY "Ver solicitudes propias o asignadas" ON public.solicitudes_documentos
  USING (((solicitante_id = (select auth.uid())) OR (asignado_a = (select auth.uid()))));

-- [sos_alerts] sos_alerts_insert_authenticated

-- [sos_alerts] sos_alerts_update_institutional

-- [suministros] Enfermeros y Directivos ven suministros
ALTER POLICY "Enfermeros y Directivos ven suministros" ON public.suministros
  USING ((EXISTS ( SELECT 1
   FROM perfiles_usuario
  WHERE ((perfiles_usuario.id = (select auth.uid())) AND (perfiles_usuario.rol = ANY (ARRAY['enfermeria'::text, 'direccion'::text, 'subdireccion'::text, 'desarrollador'::text]))))));

-- [suministros] Enfermería gestiona suministros
ALTER POLICY "Enfermería gestiona suministros" ON public.suministros
  USING ((EXISTS ( SELECT 1
   FROM perfiles_usuario
  WHERE ((perfiles_usuario.id = (select auth.uid())) AND (perfiles_usuario.rol = ANY (ARRAY['enfermeria'::text, 'desarrollador'::text]))))));

-- ============================================================================
-- Schema archive: políticas con auth.role() directo
-- ============================================================================

-- [archive.sandbox_incidencias] Authenticated users sandbox incidents access
ALTER POLICY "Authenticated users sandbox incidents access" ON archive.sandbox_incidencias
  USING (((select auth.role()) = 'authenticated'::text))
  WITH CHECK (((select auth.role()) = 'authenticated'::text));

-- ============================================================================
-- Schema storage: políticas en storage.objects
-- ============================================================================

-- [storage.objects] avatars_read_safe
ALTER POLICY "avatars_read_safe" ON storage.objects
  USING ((bucket_id = 'avatars'::text) AND (owner_id = (select auth.uid())::text));

-- [storage.objects] salud_read_safe
ALTER POLICY "salud_read_safe" ON storage.objects
  USING ((bucket_id = 'documentos_salud'::text) AND (EXISTS ( SELECT 1
   FROM perfiles_usuario p
  WHERE ((p.id = (select auth.uid())) AND (p.rol = ANY (ARRAY['medico_escolar'::text, 'directivo'::text, 'subdireccion'::text, 'admin'::text, 'system_admin'::text]))))));

-- ============================================================
-- OPTIMIZACION POST-MERGE: Orientacion v2 (InitPlan)
-- ============================================================

-- [orientacion_casos] Orientacion ve sus casos
ALTER POLICY "Orientacion ve sus casos" ON public.orientacion_casos
  USING (
    (public.get_my_role_text() = 'orientacion')
    AND (creado_por = (SELECT auth.uid()) OR responsable_id = (SELECT auth.uid()))
  );

-- [orientacion_casos] Orientacion crea sus casos
ALTER POLICY "Orientacion crea sus casos" ON public.orientacion_casos
  WITH CHECK (
    (public.get_my_role_text() = 'orientacion')
    AND creado_por = (SELECT auth.uid())
    AND (responsable_id IS NULL OR responsable_id = (SELECT auth.uid()))
    AND estado <> 'cerrado'
  );

-- [orientacion_casos] Orientacion edita sus casos sin cierre
ALTER POLICY "Orientacion edita sus casos sin cierre" ON public.orientacion_casos
  USING (
    (public.get_my_role_text() = 'orientacion')
    AND (creado_por = (SELECT auth.uid()) OR responsable_id = (SELECT auth.uid()))
  )
  WITH CHECK (
    (public.get_my_role_text() = 'orientacion')
    AND (creado_por = (SELECT auth.uid()) OR responsable_id = (SELECT auth.uid()))
    AND estado <> 'cerrado'
  );

-- [solicitudes_diagnostico] Orientacion gestiona solicitudes diagnostico
ALTER POLICY "Orientacion gestiona solicitudes diagnostico" ON public.solicitudes_diagnostico
  USING (
    (public.get_my_role_text() = 'orientacion')
    AND EXISTS (
      SELECT 1 FROM public.orientacion_casos c
      WHERE c.id = caso_id
        AND (c.creado_por = (SELECT auth.uid()) OR c.responsable_id = (SELECT auth.uid()))
    )
  )
  WITH CHECK (
    (public.get_my_role_text() = 'orientacion')
    AND EXISTS (
      SELECT 1 FROM public.orientacion_casos c
      WHERE c.id = caso_id
        AND (c.creado_por = (SELECT auth.uid()) OR c.responsable_id = (SELECT auth.uid()))
    )
  );

-- [solicitudes_diagnostico] Docente responde/actualiza solicitudes
ALTER POLICY "Docente responde solicitudes asignadas" ON public.solicitudes_diagnostico
  USING (
    (public.get_my_role_text() IN ('docente', 'docente_tutor'))
    AND docente_id = (SELECT auth.uid())
  );

ALTER POLICY "Docente actualiza solicitudes asignadas" ON public.solicitudes_diagnostico
  USING (
    (public.get_my_role_text() IN ('docente', 'docente_tutor'))
    AND docente_id = (SELECT auth.uid())
  )
  WITH CHECK (
    (public.get_my_role_text() IN ('docente', 'docente_tutor'))
    AND docente_id = (SELECT auth.uid())
  );

-- [diagnosticos_docentes] Orientacion y Docente (InitPlan)
ALTER POLICY "Orientacion ve diagnosticos de sus casos" ON public.diagnosticos_docentes
  USING (
    (public.get_my_role_text() = 'orientacion')
    AND EXISTS (
      SELECT 1 FROM public.orientacion_casos c
      WHERE c.id = caso_id
        AND (c.creado_por = (SELECT auth.uid()) OR c.responsable_id = (SELECT auth.uid()))
    )
  );

ALTER POLICY "Docente inserta diagnostico asignado" ON public.diagnosticos_docentes
  WITH CHECK (
    (public.get_my_role_text() IN ('docente', 'docente_tutor'))
    AND docente_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.solicitudes_diagnostico s
      WHERE s.id = solicitud_id
        AND s.caso_id = caso_id
        AND s.docente_id = (SELECT auth.uid())
        AND s.estado = 'pendiente'
    )
  );

ALTER POLICY "Docente ve diagnostico propio" ON public.diagnosticos_docentes
  USING (
    (public.get_my_role_text() IN ('docente', 'docente_tutor'))
    AND docente_id = (SELECT auth.uid())
  );

-- [planes_intervencion / seguimiento] Orientacion (InitPlan)
ALTER POLICY "Orientacion gestiona planes propios" ON public.planes_intervencion
  USING (
    (public.get_my_role_text() = 'orientacion')
    AND EXISTS (
      SELECT 1 FROM public.orientacion_casos c
      WHERE c.id = caso_id
        AND (c.creado_por = (SELECT auth.uid()) OR c.responsable_id = (SELECT auth.uid()))
        AND c.estado <> 'cerrado'
    )
  )
  WITH CHECK (
    (public.get_my_role_text() = 'orientacion')
    AND EXISTS (
      SELECT 1 FROM public.orientacion_casos c
      WHERE c.id = caso_id
        AND (c.creado_por = (SELECT auth.uid()) OR c.responsable_id = (SELECT auth.uid()))
        AND c.estado <> 'cerrado'
    )
  );

ALTER POLICY "Orientacion gestiona seguimiento propio" ON public.seguimiento_orientacion
  USING (
    (public.get_my_role_text() = 'orientacion')
    AND EXISTS (
      SELECT 1 FROM public.orientacion_casos c
      WHERE c.id = caso_id
        AND (c.creado_por = (SELECT auth.uid()) OR c.responsable_id = (SELECT auth.uid()))
        AND c.estado <> 'cerrado'
    )
  )
  WITH CHECK (
    (public.get_my_role_text() = 'orientacion')
    AND EXISTS (
      SELECT 1 FROM public.orientacion_casos c
      WHERE c.id = caso_id
        AND (c.creado_por = (SELECT auth.uid()) OR c.responsable_id = (SELECT auth.uid()))
        AND c.estado <> 'cerrado'
    )
  );
