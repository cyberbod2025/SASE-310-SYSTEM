# Inventario rápido de funciones y roles SASE

Fecha: 2026-04-28
Fuente: `src/types.ts`, `src/components/ModuleRouter.tsx`, `src/components/Layout.tsx`, `src/components/OrbNavigation.tsx`, `src/utils/onboardingLogic.ts`, `src/utils/permisos.ts`, `src/config/ecosystemModuleUi.ts`, `public.modulos_ecosistema_roles` y privilegios RPC actuales en Supabase.

## Roles activos

| Rol técnico | Nombre institucional |
|---|---|
| `directivo` | Dirección |
| `subdireccion` | Subdirección |
| `docente` | Docente |
| `docente_tutor` | Docente Tutor |
| `prefectura` | Prefectura |
| `orientacion` | Orientación |
| `trabajo_social` | Trabajo Social |
| `medico_escolar` | Servicio Médico |
| `udeii` | UDEII |
| `promotora_lectura` | Fomento a la Lectura |
| `secretaria` | Secretaría |
| `alumno` | Alumno |
| `developer` | Desarrollador |
| `system_admin` | Soporte Nivel 3 |
| `guest` | Invitado/no autenticado |

## Regla global rápida

| Regla | Estado actual |
|---|---|
| `alumno` | Ruta restringida a Feria; `ModuleRouter` fuerza módulo Feria. |
| `developer` / `system_admin` | Sin bloqueo de onboarding; acceso amplio por navegación/rutas sensibles. |
| Resto de roles | La navegación puede quedar limitada por onboarding 30-60-90: fase 1 solo `dashboard`, `asistencia`, `welcome`, `home`; fase 2 agrega `expedientes`, `protocolos`; fase 3 acceso total visible. |
| Seguridad real de datos | Debe depender de RLS/RPC/Edge Functions; no asumir que navegación frontend basta como control. |

## Módulos internos principales

| Función/módulo | AppModule | Roles con acceso confirmado | Notas rápidas |
|---|---|---|---|
| Tablero / dashboard por rol | `dashboard` | Todos los roles institucionales autenticados, excepto `alumno` que se fuerza a Feria | Renderiza dashboard según rol en `ModuleRouter`. |
| Home orbital | `home` | Roles autenticados | Muestra accesos por rol desde `OrbNavigation`. |
| Expedientes | `expedientes` | `directivo`, `subdireccion`, `docente`, `docente_tutor`, `orientacion`, `developer`; también visible por navegación genérica si onboarding lo permite | Ruta sin guard explícito; acceso a datos debe quedar en RLS. |
| Agenda | `agenda` | `directivo`, `subdireccion`, `docente`, `docente_tutor`, `prefectura`, `orientacion`, `trabajo_social`, `promotora_lectura`, `secretaria`; por defecto también otros si navegación lo permite | Para evento global vía Sasito: `directivo`, `subdireccion`, `secretaria`. |
| Reportes / estadística | `reportes` | Todos salvo `secretaria` en sidebar; home lo muestra a `directivo`, `subdireccion`, `docente`, `docente_tutor`, `orientacion`, `medico_escolar`, `developer` | Ruta sin guard explícito. |
| Protocolos | `protocolos` | Todos salvo `secretaria` en sidebar; home lo muestra a varios roles operativos | Ruta sin guard explícito. |
| Bitácora / auditoría | `bitacora` | `directivo`, `system_admin`, `developer` | Guard explícito en `ModuleRouter`. |
| Seguridad | `seguridad` | `directivo`, `system_admin`, `developer` | Guard explícito en `securityDashboardAccess`. |
| Solicitudes | `solicitudes` | Sin guard explícito en ruta | Se accede desde dashboards/flujo interno; revisar RLS por datos. |
| Detección pedagógica / reportes docentes | `reportes_docentes` | `docente`, `docente_tutor`, `orientacion` por navegación/acciones; ruta sin guard explícito | Fase 1 actual no lo habilita por `getAllowedModules`. |
| Inscripciones / admisión | `inscripciones` | `secretaria`, `directivo`; matriz referencial también incluye `subdireccion`, `developer` | Ruta sin guard explícito. |
| Archivo | `archivo` | `secretaria`, `directivo`, `docente`, `docente_tutor`; matriz referencial también incluye `subdireccion`, `developer` | Ruta sin guard explícito. |
| Aprobaciones de personal | `aprobaciones_personal` | Ruta: `directivo`, `system_admin`, `developer` | Hallazgo: home muestra acceso a `subdireccion`, pero la ruta la bloquea. |
| Mis grupos | `mis_grupos` | Sin guard explícito en ruta | Debe validarse por datos/grupos. |
| Planeación NEM | `planeacion_nem` | Sin guard explícito en ruta | Navegación desde Subdirección/Dashboard. |
| Asistencia | `asistencia` | Sidebar: `prefectura`, `docente`, `docente_tutor`, `system_admin`, `developer`; quick action también `secretaria` | Ruta sin guard explícito. |
| Notificaciones | `notifications` | Todos los roles por intención Sasito; visibilidad filtrada por `targetRole` | `directivo`, `subdireccion`, `system_admin`, `developer` ven notificaciones globales por rol ampliado. |
| Objetos retenidos | `objetos_retenidos` | Quick action: `prefectura`, `directivo`, `subdireccion`, `developer`, `system_admin` | Ruta sin guard explícito. |
| Documentación institucional | `documentacion` | Sasito permite: `trabajo_social`, `directivo`, `subdireccion`, `prefectura`, `orientacion` | Ruta sin guard explícito. |
| Matrícula inteligente | `matricula_inteligente` | Matriz referencial: `secretaria`, `directivo`, `subdireccion`, `developer` | Ruta sin guard explícito. |
| Cierre de ciclo | `cierre_ciclo` | Matriz referencial: `secretaria`, `directivo`, `subdireccion`, `developer` | Ruta sin guard explícito. |
| Salud / clínica | `salud` | `medico_escolar`, `directivo`, `developer`; ruta directa sin guard explícito | Home médico abre clínica. |
| UDEII tracker | `udeii_tracker` | `udeii`, `directivo`, `developer`; ruta directa sin guard explícito | Home UDEII abre inclusión. |
| Trabajo Social tracker | `trabajo_social_tracker` | `trabajo_social`, `directivo`, `developer`; ruta directa sin guard explícito | Home Trabajo Social abre casos TS. |
| Lectura tracker | `lectura_tracker` | `promotora_lectura`, `directivo`, `developer`; ruta directa sin guard explícito | Home promotora abre lectura. |
| Manual de usuario | `manual_usuario` | Todos los roles con sesión | Soporte/ayuda. |
| Perfil | `perfil` | Todos los roles con sesión | Acceso desde sidebar. |

## Ecosistema externo autorizado desde Supabase

| Módulo externo | Roles autorizados actuales |
|---|---|
| Feria de Ciencias | `alumno`, `developer`, `directivo`, `docente`, `docente_tutor`, `orientacion`, `prefectura`, `subdireccion`, `system_admin`, `trabajo_social` |
| Diagnóstico Colectivo | `admin`, `developer`, `directivo`, `docente`, `docente_tutor`, `orientacion`, `subdireccion`, `system_admin`, `trabajo_social` |
| Mate | `admin`, `developer`, `directivo`, `docente`, `docente_tutor`, `guest`, `medico_escolar`, `orientacion`, `prefectura`, `promotora_lectura`, `secretaria`, `subdireccion`, `system_admin`, `trabajo_social`, `udeii` |

Nota: aunque `mate` tenga `guest` en la tabla, `useEcosystemModules` solo carga módulos con sesión Supabase activa.

## Acciones rápidas

| Acción | Roles |
|---|---|
| Asistencia rápida | `docente`, `docente_tutor`, `prefectura`, `secretaria` |
| Reportar incidencia | `docente`, `docente_tutor`, `prefectura`, `directivo`, `subdireccion`, `orientacion`, `trabajo_social`, `medico_escolar`, `udeii`, `developer`, `system_admin` |
| Objeto retenido | `prefectura`, `directivo`, `subdireccion`, `developer`, `system_admin` |

## Intenciones Sasito con control de rol

| Intención | Roles autorizados | Módulo destino |
|---|---|---|
| Generar documentos legales | `trabajo_social`, `directivo`, `subdireccion`, `prefectura`, `orientacion` | `documentacion` |
| Solicitar historial / expedientes | `trabajo_social`, `directivo`, `orientacion`, `subdireccion` | `expedientes` |
| Programar agenda/calendario escolar | `directivo`, `subdireccion`, `secretaria` | `agenda` |
| Consultar notificaciones | Todos los roles enum | `notifications` |

## Capacidades transversales por rol

| Capacidad | Roles con permiso base true |
|---|---|
| Ver nombres | `directivo`, `subdireccion`, `orientacion`, `trabajo_social`, `medico_escolar`, `secretaria`, `udeii`, `developer`, `system_admin` |
| Registrar | `directivo`, `subdireccion`, `docente`, `docente_tutor`, `prefectura`, `orientacion`, `trabajo_social`, `medico_escolar`, `promotora_lectura`, `secretaria`, `udeii`, `developer`, `system_admin` |
| Editar | `directivo`, `subdireccion`, `docente_tutor`, `prefectura`, `orientacion`, `trabajo_social`, `medico_escolar`, `promotora_lectura`, `secretaria`, `udeii`, `contralor`, `developer`, `system_admin` |
| Cerrar casos | `directivo`, `subdireccion`, `docente_tutor`, `prefectura`, `orientacion`, `trabajo_social`, `udeii`, `developer`, `system_admin` |
| Escalar | `directivo`, `subdireccion`, `docente`, `docente_tutor`, `prefectura`, `orientacion`, `trabajo_social`, `medico_escolar`, `udeii`, `developer`, `system_admin` |
| Ver auditoría | `directivo`, `subdireccion`, `contralor`, `developer`, `system_admin` |
| Aprobar personal | `directivo`, `subdireccion`, `developer`, `system_admin` |
| Asignar grupos | `directivo`, `subdireccion`, `developer`, `system_admin` |
| Ver sensible | `directivo`, `subdireccion`, `orientacion`, `trabajo_social`, `medico_escolar`, `udeii`, `developer`, `system_admin` |
| Administrar sistema | `directivo`, `developer`, `system_admin` |

Nota: esta matriz vive en `src/utils/permisos.ts`; hoy no está conectada de forma global al `ModuleRouter`, así que se debe tratar como matriz base/referencial salvo donde el módulo la use explícitamente.

## RPC y funciones de base de datos

| Grupo | Funciones | Ejecución actual |
|---|---|---|
| Identidad y rol | `get_my_role`, `get_my_role_text`, `get_my_rol_safe`, `get_user_role`, `get_my_normalized_email`, `is_staff` | `authenticated`, `service_role`, `postgres` |
| Ecosistema visible | `get_modulos_ecosistema_visibles` | `authenticated`, `service_role`, `postgres` |
| Dashboard seguridad | `public.get_security_dashboard_snapshot`, `private.get_security_dashboard_snapshot`, `private.is_security_dashboard_admin` | `authenticated`, `postgres`; validación interna por rol elevado |
| Emergencia privada | `private.is_emergency_requester`, `private.is_emergency_staff`, `private.fn_audit_emergency_alert` | `authenticated`/`postgres` según función; `fn_audit_emergency_alert` aparece con `PUBLIC` por privilegio actual |
| Juego/trivia/feria | `decrement_visitantes`, `increment_visitantes`, `ejecutar_promocion`, `simular_promocion`, `finalizar_trivia_v2`, `registrar_progreso_v2`, `log_event` | `authenticated`, `service_role`, `postgres` |
| Triggers/servicio interno | `audit_solicitud_personal`, `calcular_deriva`, `calculate_student_risk`, `checar_patron_incidencias`, `handle_anomaly_response`, `handle_new_user`, `handle_new_user_v3`, `log_audit`, `log_expediente_access`, `log_semaphore_change`, `registrar_behavior_metric`, `rls_auto_enable`, `sandbox_detectar_patron`, `sync_alumno_grupo_desde_ciclo`, triggers de drift/riesgo | `service_role`/`postgres` principalmente |
| Funciones con `PUBLIC`/`anon` visibles | `auto_assign_matricula`, `check_preguntometro_limit`, `fn_get_score_by_gravedad`, `fn_sync_semaphore_states`, `generar_matricula_sase`, `manejar_nuevo_usuario`, `registrar_auditoria_sase` | `PUBLIC`, `anon`, `authenticated`, `service_role`, `postgres`; revisar si deben seguir expuestas |

## Hallazgos rápidos

| Hallazgo | Impacto |
|---|---|
| `subdireccion` tiene `can_approve_staff=true` y aparece en home con Aprobaciones, pero `ModuleRouter` solo permite `directivo`, `system_admin`, `developer`. | Subdirección puede ver acceso y terminar en no autorizado. |
| `can_view_audit=true` para `subdireccion` y `contralor`, pero Bitácora está guardada solo para `directivo`, `system_admin`, `developer`. | Matriz base y ruta no están alineadas. |
| Muchos módulos internos no tienen guard explícito en `ModuleRouter`. | La seguridad efectiva debe estar en RLS/RPC/Edge; conviene alinear router con matriz. |
| Onboarding 30-60-90 se aplica a todos los roles no admin/developer en sidebar, no solo a docentes. | Usuarios nuevos administrativos pueden ver menos módulos aunque su rol lo permita. |
| Existen funciones RPC con `PUBLIC`/`anon`. | Revisión recomendada antes de considerar el inventario como cerrado de seguridad. |
