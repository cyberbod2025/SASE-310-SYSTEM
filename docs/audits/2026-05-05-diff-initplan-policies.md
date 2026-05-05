# Diff Final — Fix auth_rls_initplan (desde pg_policies)

> [!NOTE]
> Fuente: `pg_policies` local post `supabase start`. **98 políticas** en 3 archivos.
> Cambio mecánico único: envolver llamadas directas en `(SELECT ...)`.

---

## Archivo 1: `fix_rls_initplan_static_policies.sql` (58 políticas)

Cambio universal: `auth.uid()` → `(select auth.uid())`, `auth.jwt()` → `(select auth.jwt())`, `auth.role()` → `(select auth.role())`

| # | Tabla | Política | CMD | Llamada(s) afectada(s) |
|---|---|---|---|---|
| 1 | alumno_ciclo | Personal lee registros de alumnos por ciclo | SELECT | `auth.role()` |
| 2 | alumnos | Docentes ven sus grupos | SELECT | `auth.uid()` |
| 3 | alumnos | Staff Institucional ve todo | SELECT | `auth.uid()` ×2 |
| 4 | asignacion_alumno_grupo | Personal lee movimientos de grupo | SELECT | `auth.role()` |
| 5 | asignaciones_profesor | Todos pueden ver asignaciones | SELECT | `auth.role()` |
| 6 | atenciones_medicas | Personal de salud puede insertar | INSERT | `auth.uid()` |
| 7 | atenciones_medicas | Personal puede ver sus propios registros | SELECT | `auth.uid()` ×3 |
| 8 | attendance_logs | Prefectura y Docentes registran asistencia | ALL | `auth.uid()` |
| 9 | audit_logs | Audit logs restricted view | SELECT | `auth.jwt()` ×2 |
| 10 | auditoria | Auditoria restricted view | SELECT | `auth.jwt()` ×2 |
| 11 | auditoria_accesos | Directivos ven auditoria_accesos | SELECT | `auth.uid()` ×2 |
| 12 | auditoria_accesos | Usuarios registran su acceso | INSERT | `auth.uid()` |
| 13 | ciclos_escolares | Todos los autenticados ven ciclos | SELECT | `auth.role()` |
| 14 | comunicados | Directivos pueden crear comunicados | INSERT | `auth.uid()` |
| 15 | comunicados | Enable insert for authenticated users | INSERT | `auth.role()` |
| 16 | comunicados | Enable read access for authenticated users | SELECT | `auth.role()` |
| 17 | diagnosticos_docentes | Docentes gestionan sus diagnósticos | ALL | `auth.uid()` ×4 |
| 18 | diagnosticos_docentes | Roles institucionales leen diagnósticos | SELECT | `auth.uid()` |
| 19 | estudiantes | Permitir actualización propia | UPDATE | `auth.uid()` ×2 |
| 20 | estudiantes | Permitir registro para autenticados | INSERT | `auth.role()` |
| 21 | eventos | Crear eventos | INSERT | `auth.uid()` |
| 22 | eventos | Eliminar eventos propios | DELETE | `auth.uid()` |
| 23 | eventos | Modificar eventos propios | UPDATE | `auth.uid()` |
| 24 | feria_pilotos | Admins can manage feria pilots | ALL | `auth.uid()` |
| 25 | grupos | Solo admin crea grupos | INSERT | `auth.uid()` |
| 26 | grupos | Todos pueden ver grupos | SELECT | `auth.role()` |
| 27 | incidencias | Incidencias update control | UPDATE | `auth.uid()` ×4 |
| 28 | incidencias | Staff Institucional ve incidencias | SELECT | `auth.uid()` ×3 |
| 29 | incidencias | system_admin_all_incidencias | ALL | `auth.uid()` |
| 30 | modulos_ecosistema | Modulos visibles para todos los autenticados | SELECT | `auth.role()` |
| 31 | modulos_ecosistema | Modulos visibles para usuarios autenticados | SELECT | `auth.role()` |
| 32 | modulos_ecosistema_roles | Reglas de roles visibles para autenticados | SELECT | `auth.role()` |
| 33 | modulos_ecosistema_roles | Todos los autenticados ven las reglas | SELECT | `auth.role()` |
| 34 | modulos_ecosistema_usuarios | Usuarios pueden ver sus propios permisos | SELECT | `auth.uid()` |
| 35 | modulos_ecosistema_usuarios | Usuarios ven sus propias reglas | SELECT | `auth.uid()` |
| 36 | notificaciones | notificaciones_insert_service_role | INSERT | `auth.role()` |
| 37 | notificaciones | notificaciones_read_rol_destino | SELECT | `auth.jwt()` |
| 38 | perfiles_usuario | Los usuarios pueden ver su propio perfil | SELECT | `auth.uid()` |
| 39 | perfiles_usuario | Personal institucional puede ver otros | SELECT | `auth.role()` |
| 40 | perfiles_usuario | Users view own perfiles_usuario | SELECT | `auth.uid()` |
| 41 | perfiles_usuario | Usuarios actualizan su propio perfil | UPDATE | `auth.uid()` ×2 |
| 42 | perfiles_usuario | Usuarios ven su propio perfil | SELECT | `auth.uid()` |
| 43 | personal_oficial | system_admin_all_personal | ALL | `auth.uid()` |
| 44 | profiles | Users can update their own profile. | UPDATE | `auth.uid()` |
| 45 | profiles | Users update own profile | UPDATE | `auth.uid()` |
| 46 | recordatorios | Ver recordatorios propios | SELECT | `auth.uid()` ×2 |
| 47 | salud | Usuarios pueden ver su propio registro | SELECT | `auth.uid()` |
| 48 | sandbox_alertas | Authenticated users sandbox access | ALL | `auth.role()` ×2 |
| 49 | sase_alerts | Security alerts restricted view | SELECT | `auth.jwt()` ×2 |
| 50 | solicitudes | Enable insert for authenticated users | INSERT | `auth.role()` |
| 51 | solicitudes | Enable read access for authenticated users | SELECT | `auth.role()` |
| 52 | solicitudes | Enable update for creators and assignees | UPDATE | `auth.uid()` ×2 |
| 53 | solicitudes_alta_personal | Dirección actualiza solicitudes | UPDATE | `auth.uid()` |
| 54 | solicitudes_alta_personal | Dirección ve solicitudes | SELECT | `auth.uid()` |
| 55 | solicitudes_documentos | Directivos pueden crear solicitudes | INSERT | `auth.uid()` |
| 56 | solicitudes_documentos | Secretarios pueden actualizar asignadas | UPDATE | `auth.uid()` |
| 57 | solicitudes_documentos | Ver solicitudes propias o asignadas | SELECT | `auth.uid()` ×2 |
| 58 | sos_alerts | sos_alerts_insert_authenticated | INSERT | `auth.uid()` |
| — | sos_alerts | sos_alerts_update_institutional | UPDATE | `auth.uid()` |
| — | suministros | Enfermeros y Directivos ven suministros | SELECT | `auth.uid()` |
| — | suministros | Enfermería gestiona suministros | ALL | `auth.uid()` |

---

## Archivo 2: `fix_rls_initplan_blindaje_smoke_test.sql` (17 políticas)

Patrón idéntico en todas. Cambio: `auth.uid()` → `(select auth.uid())` dentro del `NOT EXISTS`.

```diff
 -- Write (FOR ALL, AS RESTRICTIVE)
 USING(true)
-WITH CHECK(NOT EXISTS(SELECT 1 FROM perfiles_usuario WHERE id = auth.uid() AND es_test = true))
+WITH CHECK(NOT EXISTS(SELECT 1 FROM perfiles_usuario WHERE id = (select auth.uid()) AND es_test = true))

 -- Delete (FOR DELETE, AS RESTRICTIVE)
-USING(NOT EXISTS(SELECT 1 FROM perfiles_usuario WHERE id = auth.uid() AND es_test = true))
+USING(NOT EXISTS(SELECT 1 FROM perfiles_usuario WHERE id = (select auth.uid()) AND es_test = true))
```

| Tabla | Write | Delete |
|---|---|---|
| alumnos | ✅ | — (ya corregida) |
| auditoria | ✅ | ✅ |
| comunicados | ✅ | ✅ |
| estudiantes | ✅ | ✅ |
| incidencias | ✅ | ✅ |
| justificantes | ✅ | ✅ |
| objetos_retenidos | ✅ | ✅ |
| profiles | ✅ | ✅ |
| solicitudes_alta_personal | ✅ | ✅ |

---

## Archivo 3: `fix_rls_initplan_simulation_mode.sql` (20 políticas)

Patrón idéntico. Cambio: `auth.jwt()` → `(select auth.jwt())`.

```diff
 -- Write (FOR ALL, AS RESTRICTIVE)
 USING(true)
-WITH CHECK(COALESCE((auth.jwt() -> 'app_metadata' ->> 'simulation_mode')::boolean, false) IS NOT TRUE)
+WITH CHECK(COALESCE(((select auth.jwt()) -> 'app_metadata' ->> 'simulation_mode')::boolean, false) IS NOT TRUE)

 -- Delete (FOR DELETE, AS RESTRICTIVE)
-USING(COALESCE((auth.jwt() -> 'app_metadata' ->> 'simulation_mode')::boolean, false) IS NOT TRUE)
+USING(COALESCE(((select auth.jwt()) -> 'app_metadata' ->> 'simulation_mode')::boolean, false) IS NOT TRUE)
```

| Tabla | Write | Delete |
|---|---|---|
| alumnos | ✅ | ✅ |
| auditoria | ✅ | ✅ |
| comunicados | ✅ | ✅ |
| estudiantes | ✅ | ✅ |
| incidencias | ✅ | ✅ |
| justificantes | ✅ | ✅ |
| objetos_retenidos | ✅ | ✅ |
| perfiles_usuario | ✅ | ✅ |
| profiles | ✅ | ✅ |
| solicitudes_alta_personal | ✅ | ✅ |
