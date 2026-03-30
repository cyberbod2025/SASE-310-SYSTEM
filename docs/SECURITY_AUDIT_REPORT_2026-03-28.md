# INFORME DE AUDITORÍA DE SEGURIDAD — SASE-310
## Fecha: 2026-03-28 | Auditor: Senior Supabase/PostgreSQL Security

---

## 1. HALLAZGOS CRÍTICOS

### CRÍTICO-1: FORCE ROW LEVEL SECURITY no aplicado en NINGUNA tabla
**Severidad:** CRÍTICO  
**Impacto:** El owner de las tablas (postgres/service_role) puede leer TODOS los datos sin pasar por RLS. Las funciones SECURITY DEFINER también ignoran RLS sin FORCE.  
**Tablas afectadas:** 25 tablas del esquema `public`  
**Corrección:** Sección 1 del SQL correctivo.

### CRÍTICO-2: Policy SELECT de `solicitudes_alta_personal` expuesta a `anon`
**Severidad:** CRÍTICO  
**Archivo:** `20260120_request_staff_access.sql:50-54`  
**Problema:** La policy `"Publico puede ver su solicitud insertada"` permite a `anon` SELECT con `USING (true)` — cualquier persona no autenticada puede leer TODAS las solicitudes de alta (contienen CURP, nombres, teléfonos, correos).  
**Comentario original del código:** `"Temporalmente abierto para el insert-return"` — nunca fue corregido.  
**Corrección:** Se elimina la policy y se reemplaza con acceso solo a directivos.

### CRÍTICO-3: `audit_log` tiene INSERT abierto a `anon`
**Severidad:** CRÍTICO  
**Archivo:** `20260120_request_staff_access.sql:58-65`  
**Problema:** Policy `"Anon puede registrar auditoria de alta"` permite que usuarios no autenticados inserten en `audit_log`. Aunque tiene un `WITH CHECK` limitando a `action_type = 'CREACION'`, esto puede ser explotado para llenar la tabla de auditoría con registros basura (ataque de denegación de servicio).  
**Corrección:** Se elimina; anon no debe insertar en audit_log.

### CRÍTICO-4: `audit_log` tiene múltiples policies contradictorias
**Severidad:** CRÍTICO  
**Archivos involucrados:** 4 migraciones diferentes crearon policies sobre la misma tabla:
- `20241227100000` → `"Directivos pueden ver toda la bitácora"` + `"Usuarios autenticados pueden registrar acciones"` (WITH CHECK true — CUALQUIERA puede insertar)
- `20260219230000` → `"Authenticated users can insert audit logs"` (WITH CHECK true)
- `20260306160000` → `"Audit logs insert restriction"` (WITH CHECK auth.uid() = user_id)
- `20260120_request_staff_access` → `"Anon puede registrar auditoria de alta"`

**Problema:** PostgreSQL aplica la UNIÓN de todas las policies permissivas. La policy con `WITH CHECK (true)` de la migración 2024 hace que la restricción posterior sea INEFECTIVA.  
**Corrección:** Se consolidan todas las policies en 2 limpias.

### CRÍTICO-5: No existen REVOKE para `anon` en tablas sensibles
**Severidad:** CRÍTICO  
**Problema:** Supabase por defecto otorga `USAGE` en schema `public` a `anon` y `authenticated`. Las RLS policies filtran qué filas se ven, pero si una table no tiene RLS habilitado o tiene una policy permissiva, `anon` puede acceder. Sin REVOKE explícitos, la seguridad depende 100% de que las RLS policies estén correctas.  
**Corrección:** Se revocan SELECT/INSERT/UPDATE/DELETE de `anon` en todas las tablas sensibles.

---

## 2. HALLAZGOS MEDIOS

### MEDIO-1: `attendance_logs` SELECT policy es `USING (true)` 
**Archivo:** `20260219200000_dashboard_data_tables.sql:59-60`  
**Problema:** Cualquier usuario autenticado puede ver TODOS los registros de asistencia de TODOS los alumnos. Un docente puede ver la asistencia de grupos que no le corresponden.  
**Corrección:** Filtrar por rol institucional.

### MEDIO-2: `comunicados` SELECT policy es `USING (true)`
**Archivo:** `20241227090000_create_solicitudes_system.sql:109-110`  
**Problema:** Cualquier usuario autenticado puede ver todos los comunicados, incluyendo los dirigidos a roles específicos.  
**Corrección:** Filtrar por rol.

### MEDIO-3: `solicitudes` (tabla simple) tiene SELECT/INSERT/UPDATE abiertos
**Archivo:** `20260219153000_create_solicitudes_table.sql:36-44`  
**Problema:** `USING (auth.role() = 'authenticated')` permite a cualquier usuario ver/insertar solicitudes.  
**Corrección:** Restringir al creador, asignado, o directivos.

### MEDIO-4: `estudiantes` INSERT/UPDATE demasiado permisivo
**Archivo:** `20260306160000_security_advisor_hardening.sql:160-169`  
**Problema:** `WITH CHECK (true)` para usuarios autenticados permite que CUALQUIER usuario autenticado cree o modifique registros de gamificación.  
**Corrección:** Restringir a roles de staff.

### MEDIO-5: Vista `audit_summary` sin `security_invoker`
**Archivo:** `20241227100000_create_audit_log.sql:65-74`  
**Problema:** La vista corre como SECURITY DEFINER (owner), saltándose RLS. Si un usuario autenticado la consulta, puede ver resúmenes de auditoría sin tener permisos.  
**Corrección:** Re-crear con `security_invoker = true`.

### MEDIO-6: Vista `v_perfiles_activos` recreada en 2 migraciones conflictivas
**Archivos:** `20260312110000` y `20260312120000`  
**Problema:** La segunda migración recrea la vista SIN `security_invoker`, sobreescribiendo la versión segura.  
**Corrección:** Re-crear con `security_invoker = true`.

### MEDIO-7: Múltiples versions de `expediente_integral_alumno` en migraciones
**Archivos:** `20260305110000`, `20260305120000`, `20260306160000`  
**Problema:** La migración `20260305120000` sobreescribe la vista sin `security_invoker`. Solo `20260306160000` lo incluye, pero si las migraciones se ejecutan en orden cronológico, la versión insegura queda activa.  
**Corrección:** Re-crear con `security_invoker = true` y columnas actualizadas.

### MEDIO-8: 15 funciones SECURITY DEFINER sin REVOKE EXECUTE para anon
**Problema:** Aunque las funciones SECURITY DEFINER son necesarias para RLS (ej: `get_my_role()`), `anon` no debería poder ejecutarlas directamente.  
**Funciones afectadas:** `get_my_role`, `calculate_student_risk`, `log_audit`, `generar_matricula_sase`, `registrar_auditoria_sase`, entre otras.  
**Corrección:** REVOKE EXECUTE para anon en todas.

### MEDIO-9: Tablas `documentos_institucionales` y `objetos_retenidos` sin RLS
**Problema:** Estas tablas se crearon en migraciones que no incluyeron `ENABLE ROW LEVEL SECURITY`. Contienen datos sensibles de alumnos (documentos institucionales, objetos confiscados).  
**Corrección:** ENABLE + FORCE + policies.

### MEDIO-10: DELETE revocado en la mayoría de tablas para authenticated, pero no para `incidencias`
**Problema:** `incidencias` tiene una policy de DELETE para `directivo` y `system_admin`, pero a nivel GRANT, `authenticated` tiene DELETE permitido. Si la policy tiene un bug, el GRANT permite la operación.  
**Corrección:** Revocar DELETE de authenticated como defensa en profundidad.

---

## 3. ANÁLISIS DE FUNCIONES SECURITY DEFINER

| Función | Riesgo | Evaluación |
|---------|--------|------------|
| `get_my_role()` | MEDIO | Necesaria para RLS. Lee profiles/perfiles_usuario. Sin ella, RLS no funciona. Correcta implementación fail-closed. |
| `calculate_student_risk(uuid)` | ALTO | Hace UPDATE directo en `alumnos` saltándose RLS. Cualquier trigger la ejecuta. Solo debe ser invocada por triggers legítimos. |
| `trigger_update_student_risk()` | ALTO | Trigger en incidencias. Ejecuta calculate_student_risk. Si un usuario con INSERT en incidencias puede disparar el trigger, puede modificar campos de riesgo de alumnos indirectamente. |
| `log_audit(...)` | MEDIO | INSERT en audit_log. Con `GRANT EXECUTE TO authenticated`, cualquier usuario puede crear registros de auditoría. El WITH CHECK de la policy fue anulado por otra policy con `true`. |
| `audit_incidencia_changes()` | BAJO | Trigger en incidencias. Llama a log_audit con EXCEPTION WHEN OTHERS → null (fail-open silencioso). |
| `log_semaphore_change()` | BAJO | Trigger en alumnos. Solo registra cambios de semáforo. |
| `log_expediente_access()` | INOFENSIVO | Función definida pero nunca vinculada a un trigger real. Postgres no soporta triggers en SELECT. |
| `generar_matricula_sase()` | MEDIO | Genera IDs secuenciales. Si anon puede ejecutarla, puede predecir matrículas futuras. |
| `registrar_auditoria_sase(...)` | MEDIO | Similar a log_audit. INSERT en auditoria. |

---

## 4. ANÁLISIS DE POLÍTICAS POR TABLA

### `alumnos` (DATOS SENSIBLES — Expediente escolar)
| Policy | Operación | Rol | Evaluación |
|--------|-----------|-----|------------|
| Staff Institucional ve todo | SELECT | directivo, subdireccion, secretaria, prefectura, orientacion, trabajo_social, admin, developer, system_admin | ✅ Correcto |
| Docentes ven sus grupos | SELECT | docente, docente_tutor (filtrado por grupo) | ✅ Correcto |
| system_admin_all_alumnos | ALL | system_admin | ✅ Correcto |
| — | INSERT | No hay policy explícita | ⚠️ Solo service_role |
| — | UPDATE | No hay policy explícita para staff general | ⚠️ Solo triggers/Directivo |
| — | DELETE | Revocado para authenticated | ✅ Correcto |

**Hueco detectado:** Docentes pueden ver alumnos de sus grupos pero no pueden UPDATE/INSERT. La modificación de datos del alumno solo ocurre vía service_role (triggers, RPCs).

### `incidencias` (DATOS SENSIBLES — Registro disciplinario)
| Policy | Operación | Rol | Evaluación |
|--------|-----------|-----|------------|
| Staff Institucional ve incidencias | SELECT | roles amplios + reportado_por | ✅ Correcto |
| Prefectura create incidencias | INSERT | prefectura, docente, docente_tutor, orientacion, trabajo_social, directivo, subdireccion, system_admin | ✅ Correcto |
| Incidencias update control | UPDATE | Roles con control de estado escalado | ✅ Correcto (recién implementado) |
| Delete incidencias restrictivo | DELETE | directivo, system_admin | ✅ Correcto |
| system_admin_all_incidencias | ALL | system_admin | ✅ Correcto |

**Evaluación:** Esta tabla está bien protegida después de las migraciones recientes.

### `perfiles_usuario` (DATOS SENSIBLES — Identidad institucional)
| Policy | Operación | Rol | Evaluación |
|--------|-----------|-----|------------|
| Users view own perfiles_usuario | SELECT | authenticated (propio) + directivo, admin, secretaria | ✅ Correcto |
| system_admin_all_perfiles | ALL | system_admin | ✅ Correcto |
| Directivos gestionan personal | ALL | directivo, subdireccion, admin, system_admin | ✅ Correcto |

**Evaluación:** Correctamente restringido.

### `socioeconomico_privado` (DATOS ULTRA-SENSIBLES)
| Policy | Operación | Rol | Evaluación |
|--------|-----------|-----|------------|
| TS manage socio privado | ALL | trabajo_social | ✅ Correcto |
| Directivo view socio privado | SELECT | directivo | ✅ Correcto |
| Orientacion view socio privado | SELECT | orientacion | ✅ Correcto |

**Evaluación:** Mínimo privilegio aplicado correctamente.

### `salud` (DATOS SENSIBLES — Médicos)
| Policy | Operación | Rol | Evaluación |
|--------|-----------|-----|------------|
| Directivo manage salud | ALL | directivo | ✅ Correcto |
| Enfermeria view/update/insert salud | SELECT/UPDATE/INSERT | enfermeria | ✅ Correcto |
| Staff view salud | SELECT | docente, docente_tutor, orientacion, trabajo_social | ⚠️ Docentes ven datos médicos? |

**Posible sobreexposición:** Docentes ven datos de salud. En un contexto escolar esto puede ser necesario (alergias, condiciones), pero hay que verificar que no incluya datos ultra-sensibles.

---

## 5. TABLAS SIN RLS HABILITADO (DETECTADAS)

| Tabla | Contiene datos de | RLS Status | Creada en |
|-------|-------------------|------------|-----------|
| `documentos_institucionales` | Documentos legales de alumnos | ❌ SIN RLS | 20240130 |
| `objetos_retenidos` | Objetos confiscados + cadena de custodia | ❌ SIN RLS | 20260315 |
| `alertas_patron` | Alertas de riesgo (si existe) | ⚠️ Verificar | 20260305 |
| `seguimiento_social` | Datos sociales de alumnos | ⚠️ Habilitado en migration pero verificar | 20240130 |
| `registro_lectura` | Registro de lectura | ⚠️ Verificar | — |
| `seguimiento_bap` | Programa BAP | ⚠️ Verificar | — |

---

## 6. SQL RECOMENDADO

**Archivo:** `supabase/migrations/20260328000000_security_hardening_audit.sql` (542 líneas)

Contenido organizado en 9 secciones:
1. FORCE ROW LEVEL SECURITY en 25+ tablas
2. REVOKE permisos inseguros de anon
3. REVOKE DELETE de authenticated (defensa en profundidad)
4. Corrección de 7 policies inseguras
5. Habilitación de RLS en tablas sin protección
6. Re-creación de vistas con security_invoker
7. Hardening de search_path en 15+ funciones
8. REVOKE EXECUTE de funciones para anon
9. Registro de auditoría

---

## 7. RIESGOS RESIDUALES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| service_role key expuesta en frontend | Baja (no encontrada en código) | CRÍTICO | Verificar que VITE_ solo contiene URL y ANON_KEY |
| Función calculate_student_risk puede ser invocada indirectamente vía INSERT en incidencias | Media | ALTO | Ya está limitada a usuarios con policy INSERT (docentes, prefectura). El trigger es legítimo. |
| Password leaked protection deshabilitada en Supabase Auth | Alta | MEDIO | Configurar manualmente en Dashboard → Auth → Providers |
| Comentarios en código que revelan arquitectura interna | Alta | BAJO | Limpiar comentarios sensibles antes de producción |
| ENUM app_role tiene valores 'admin' y 'developer' no definidos en el ENUM original | Media | MEDIO | El ENUM se amplió con CHECK constraints parciales. Consolidar en un solo tipo. |
| Dos tablas de perfiles (profiles + perfiles_usuario) | Alta | MEDIO | Unificar en una sola tabla o mantener sync con trigger |

---

## 8. CHECKLIST DE VALIDACIÓN POR ROL

### system_admin
- [ ] Puede leer TODAS las tablas (FOR ALL policies activas)
- [ ] Puede crear/editar/borrar incidencias sin restricción de estado
- [ ] Puede ver auditoría_accesos
- [ ] Puede ver audit_log completo
- [ ] NO aparece en interfaces institucionales para otros roles
- [ ] get_my_role() retorna 'system_admin' correctamente

### directivo / subdireccion
- [ ] Ve todos los alumnos (SELECT alumnos ✅)
- [ ] Ve todas las incidencias
- [ ] Ve socioeconomico_general y socioeconomico_privado
- [ ] Ve auditoría_accesos
- [ ] Puede UPDATE incidencias sin restricción
- [ ] Puede DELETE incidencias
- [ ] NO puede ver datos de salud como enfermería (solo SELECT via "Staff view salud")
- [ ] Puede gestionar solicitudes_alta_personal (aprobar/rechazar)

### prefectura
- [ ] Ve todos los alumnos ✅
- [ ] Ve todas las incidencias ✅
- [ ] Puede CREAR incidencias ✅
- [ ] Puede UPDATE incidencias NO escaladas ✅
- [ ] NO puede UPDATE incidencias escaladas ✅ (verificar con estado)
- [ ] NO puede DELETE incidencias ✅
- [ ] Puede gestionar objetos_retenidos ✅
- [ ] NO ve socioeconomico_privado ✅

### docente / docente_tutor
- [ ] Ve SOLO alumnos de sus grupos asignados ✅ (verificar que p.grupos sea correcto)
- [ ] Ve incidencias que él reportó ✅
- [ ] Puede CREAR incidencias ✅
- [ ] Puede UPDATE incidencias propias NO escaladas ✅
- [ ] NO puede ver socioeconomico_privado ✅
- [ ] Puede ver salud (alergias) ✅ (decisión institucional)
- [ ] NO puede ver audit_log de otros usuarios ✅

### orientacion
- [ ] Ve todos los alumnos ✅
- [ ] Ve todas las incidencias ✅
- [ ] Puede crear incidencias ✅
- [ ] Puede UPDATE cualquier incidencia ✅
- [ ] Ve socioeconomico_general ✅
- [ ] Ve socioeconomico_privado ✅
- [ ] NO puede DELETE incidencias ✅

### trabajo_social
- [ ] Ve todos los alumnos ✅
- [ ] Ve todas las incidencias ✅
- [ ] Ve y gestiona socioeconomico_general ✅
- [ ] Ve y gestiona socioeconomico_privado ✅
- [ ] Puede crear incidencias ✅
- [ ] Puede UPDATE cualquier incidencia ✅

### enfermeria
- [ ] Ve datos de salud ✅
- [ ] Puede INSERT/UPDATE salud ✅
- [ ] Ve atenciones_medicas ✅
- [ ] Ve suministros ✅
- [ ] NO ve incidencias (excepto las que reportó) ⚠️ Verificar
- [ ] NO ve socioeconomico_privado ✅

### secretaria
- [ ] Ve alumnos ✅
- [ ] Ve incidencias ✅
- [ ] Ve comunicados ✅
- [ ] Puede gestionar solicitudes_documentos asignadas ✅
- [ ] NO puede UPDATE incidencias (solo lectura) ⚠️ Verificar

### anon (usuario NO autenticado)
- [ ] NO puede leer NINGUNA tabla con datos de alumnos ✅ (post-corrección)
- [ ] Puede INSERT en solicitudes_alta_personal (registro público) ✅
- [ ] NO puede SELECT solicitudes_alta_personal ✅ (post-corrección)
- [ ] NO puede insertar en audit_log ✅ (post-corrección)
- [ ] NO puede ejecutar get_my_role() ✅ (post-corrección)
- [ ] NO puede ejecutar ninguna función SECURITY DEFINER ✅ (post-corrección)

---

## 9. RESUMEN EJECUTIVO

**Estado actual del esquema:** 6.5/10 en seguridad RLS.

**Principales fortalezas:**
- RLS habilitado en todas las tablas principales
- Función get_my_role() con fail-closed correcto
- Múltiples capas de policies para roles institucionales
- Auditoría de tabla con triggers inmutables

**Principales debilidades:**
- FORCE RLS nunca fue aplicado
- Policies de anon nunca fueron revocadas
- audit_log tiene 4-5 policies contradictorias que se anulan entre sí
- 2 tablas críticas sin RLS (documentos, objetos)
- Vistas sin security_invoker (fuga de datos)
- Funciones SECURITY DEFINER ejecutables por anon

**Después de aplicar el SQL correctivo:** Estado estimado 9/10.

---

*Informe generado por auditor senior de seguridad. Ejecutar SQL en staging primero.*
