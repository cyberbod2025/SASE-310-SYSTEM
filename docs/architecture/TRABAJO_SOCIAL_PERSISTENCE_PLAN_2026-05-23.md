# Plan de Persistencia — Módulo Trabajo Social (Fase 3)

**Estado:** Diseño técnico aprobado, no implementado
**Fecha:** 2026-05-23
**PR relacionado:** (futuro)

---

## 1. Diagnóstico del problema actual

El módulo Trabajo Social funciona **100% en memoria local** (`useState` en `DashboardTrabajoSocial.tsx:36-44`). Las 5 entidades de datos (citatorios, contactos familiares, visitas domiciliarias, acuerdos de cumplimiento, estado de intervención) se generan con builders mock (`buildInitialCitatorios`, `buildInitialContacts`, etc. en `trabajoSocialTypes.ts:115-166`) y se pierden al recargar la página.

No existe ninguna llamada a Supabase (`select`/`insert`/`update`/`rpc`) ni a `logAudit` en ninguno de los 9 archivos del módulo. Tampoco hay un slice de estado global (Zustand/Context) para datos de TS.

La única persistencia real que toca TS es:
- `derivar_trabajo_social()` RPC (llamado desde Orientación, no desde TS)
- `consultar_trabajo_social` en `useAuditoriaAccesos` (solo registro de acceso, no de acciones)

---

## 2. Acciones de Trabajo Social que deben persistir

| Acción | Handler actual (DashboardTrabajoSocial.tsx) | Estado actual |
|---|---|---|
| Iniciar seguimiento de caso | `handleStartFollowUp` (línea 68) | `setStatusOverrides` local |
| Registrar citatorio | `handleRegisterCitatorio` (línea 74) | `setCitatorios` local |
| Marcar asistencia a citatorio | `handleMarkAttendance` (línea 81) | `setCitatorios` local |
| Registrar contacto familiar | `handleRegisterContact` (línea 86) | `setContacts` local |
| Registrar visita domiciliaria | `handleRegisterVisit` (línea 93) | `setVisits` local |
| Actualizar cumplimiento de acuerdo | `handleUpdateCompliance` (línea 100) | `setAgreements` local |
| Escalar a Dirección | `handleEscalate` (línea 105) | `setLastAction` local |
| Devolver a Orientación | `handleReturnToOrientacion` (línea 110) | `setLastAction` local |

---

## 3. Propuesta de tablas en Supabase

Se requiere crear **5 tablas nuevas + extender 1 existente**:

```
trabajo_social_casos           -- extiende seguimiento_social existente
trabajo_social_citatorios      -- nuevo
trabajo_social_contactos       -- nuevo
trabajo_social_visitas         -- nuevo
trabajo_social_acuerdos        -- nuevo
```

**Nota:** Se evaluó reutilizar `seguimiento_social` (tabla legacy con trigger `tr_audit_social`). Se descarta porque su esquema genérico (1 fila = 1 texto de seguimiento) no modela la estructura relacional de citatorios/visitas/acuerdos. Se opta por tablas dedicadas con FK a `trabajo_social_casos` para mantener separación clara de dominio.

---

## 4. Campos mínimos por tabla

### `trabajo_social_casos`

```sql
CREATE TABLE public.trabajo_social_casos (
  id UUID PK DEFAULT gen_random_uuid(),
  caso_orientacion_id UUID FK → orientacion_casos(id) NOT NULL,
  alumno_id UUID FK → alumnos(id) NOT NULL,
  estado_intervencion TEXT NOT NULL DEFAULT 'asignado',
    -- valores: asignado | seguimiento | contacto_familiar |
    --          visita_programada | acuerdos_en_proceso |
    --          alerta_sin_respuesta | escalado_direccion |
    --          devuelto_orientacion
  prioridad TEXT NOT NULL DEFAULT 'media',
  responsable_previo TEXT,
    -- Orientacion | Subdireccion | Direccion
  cerrado_por UUID FK → auth.users(id) NULL,
  fecha_cierre TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `trabajo_social_citatorios`

```sql
CREATE TABLE public.trabajo_social_citatorios (
  id UUID PK DEFAULT gen_random_uuid(),
  caso_id UUID FK → trabajo_social_casos(id) NOT NULL,
  numero INT NOT NULL,                    -- 1°, 2°, 3er citatorio
  fecha_citatorio TIMESTAMPTZ NOT NULL,
  respuesta TEXT DEFAULT 'sin_respuesta',
    -- sin_respuesta | asistio | reprogramado
  creado_por UUID FK → auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `trabajo_social_contactos`

```sql
CREATE TABLE public.trabajo_social_contactos (
  id UUID PK DEFAULT gen_random_uuid(),
  caso_id UUID FK → trabajo_social_casos(id) NOT NULL,
  tipo_contacto TEXT NOT NULL,
    -- llamada | mensaje | reunion
  resultado TEXT,
  creado_por UUID FK → auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `trabajo_social_visitas`

```sql
CREATE TABLE public.trabajo_social_visitas (
  id UUID PK DEFAULT gen_random_uuid(),
  caso_id UUID FK → trabajo_social_casos(id) NOT NULL,
  observaciones TEXT,
  contexto_familiar TEXT,
  creado_por UUID FK → auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `trabajo_social_acuerdos`

```sql
CREATE TABLE public.trabajo_social_acuerdos (
  id UUID PK DEFAULT gen_random_uuid(),
  caso_id UUID FK → trabajo_social_casos(id) NOT NULL,
  acuerdo TEXT NOT NULL,
  responsable TEXT NOT NULL,
  estado TEXT DEFAULT 'en_proceso',
    -- cumplido | en_proceso | incumplido
  creado_por UUID FK → auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Reglas RLS sugeridas por rol

Basado en el patrón de `orientacion_casos` y policies existentes en `20260501084547_orientacion_v2_backend.sql`:

```sql
-- Trabajo Social: CRUD completo en todas las tablas TS
CREATE POLICY "ts_full_access" ON trabajo_social_casos
  FOR ALL USING (get_my_role() = 'trabajo_social');

-- Orientación: solo lectura de casos derivados
CREATE POLICY "orientacion_read_ts_cases" ON trabajo_social_casos
  FOR SELECT USING (get_my_role() = 'orientacion');

-- Dirección/Subdirección: lectura + escalamiento
CREATE POLICY "direccion_read_escalate" ON trabajo_social_casos
  FOR ALL USING (get_my_role() IN ('direccion', 'subdireccion', 'admin'));

-- Admin/SysAdmin: full access
CREATE POLICY "admin_full_access" ON trabajo_social_casos
  FOR ALL USING (get_my_role() IN ('admin', 'system_admin'));
```

Las tablas hijas (`trabajo_social_citatorios`, `trabajo_social_contactos`, `trabajo_social_visitas`, `trabajo_social_acuerdos`) siguen el mismo esquema RLS porque son datos operativos del mismo módulo. Se recomienda una policy única por tabla usando `get_my_role() IN ('trabajo_social', 'direccion', 'subdireccion', 'admin', 'system_admin')`.

---

## 6. Eventos que deben registrarse en logAudit

Cada acción crítica debe llamar `logAudit(actionType, description, targetTable, targetRecordId)` desde el frontend vía `useApp().logAudit`:

| Evento | `actionType` | `targetTable` | Descripción |
|---|---|---|---|
| Caso de TS abierto | CREACION | trabajo_social_casos | "Caso de TS abierto desde Orientación" |
| Seguimiento iniciado | ACTUALIZACION | trabajo_social_casos | "Seguimiento activo iniciado para caso {id}" |
| Citatorio registrado | CREACION | trabajo_social_citatorios | "Citatorio #{n} registrado para {alumno}" |
| Asistencia marcada | ACTUALIZACION | trabajo_social_citatorios | "Asistencia marcada en citatorio {id}" |
| Contacto familiar registrado | CREACION | trabajo_social_contactos | "Contacto {tipo} registrado para {alumno}" |
| Visita domiciliaria registrada | CREACION | trabajo_social_visitas | "Visita domiciliaria registrada para {alumno}" |
| Acuerdo actualizado | ACTUALIZACION | trabajo_social_acuerdos | "Acuerdo {id} marcado como {estado}" |
| Caso escalado a Dirección | CREACION | trabajo_social_casos | "Caso {id} escalado a Dirección" |
| Caso devuelto a Orientación | ACTUALIZACION | trabajo_social_casos | "Caso {id} devuelto a Orientación" |
| Alerta 3 citatorios sin respuesta | ACTUALIZACION | trabajo_social_casos | "Alerta: 3 citatorios sin respuesta para {alumno}" |

Además, se debe agregar `useAuditoriaAccesos.logAccess({ accion: "consultar_trabajo_social", alumno_id })` en el dashboard al seleccionar un caso (hoy solo se registra desde `StudentAdvancedPanel.tsx`).

---

## 7. Riesgos institucionales si se implementa mal

| Riesgo | Impacto | Mitigación |
|---|---|---|
| **Pérdida de trazabilidad legal** | Citatorios y visitas domiciliarias son evidencia en procesos jurídicos. Sin persistencia, no hay cadena de custodia. | Toda inserción debe sellar `creado_por`, `created_at` y `logAudit` antes de actualizar UI. |
| **Doble persistencia (local + DB)** | Si el guardado a DB falla pero la UI se actualiza, el usuario cree que guardó. | Patrón optimista: actualizar UI + `await` DB; revertir UI si DB falla, con toast de error. |
| **RLS mal configurada** | Orientación podría perder visibilidad de casos derivados, o TS podría ver datos de otros roles. | Heredar policies del patrón existente de `orientacion_casos`. Probar cada policy con `supabase.rpc('get_my_role')`. |
| **Conflicto con `seguimiento_social` legacy** | El trigger `tr_audit_social` en `seguimiento_social` audita inserciones genéricas. Si se mezclan datos estructurados, se duplica auditoría. | No reutilizar `seguimiento_social`. Tablas nuevas, audit vía `logAudit` explícito. |
| **Escalamiento sin estado** | Si escalar a Dirección no persiste, Dirección no ve el caso escalado. | `handleEscalate` debe actualizar `trabajo_social_casos.estado_intervencion = 'escalado_direccion'`. |
| **Pérdida de datos por recarga** | El usuario puede perder una visita completa si recarga antes de que termine la sincronización. | Usar estado local como "borrador" + flag `isDirty` + confirmación beforeunload. |
| **Contradicción permisos `can_close`** | `permisos.ts` da `can_close: true` a TS pero `TrabajoSocialCaseDetail.tsx:127` dice que solo Dirección cierra. | Resolver contradicción: definir si TS puede cerrar o no. Alinear `permisos.ts`, UI, RLS y RPC. |

---

## 8. Plan de implementación por fases

### Fase 3A — Infraestructura de datos (1-2 sprints)

1. **Migración SQL**: Crear `trabajo_social_casos` + 4 tablas hijas con FKs, índices, timestamps.
2. **Migración SQL**: Policies RLS para `trabajo_social`, `orientacion`, `direccion`, `admin`.
3. **Migración SQL**: RPCs:
   - `abrir_caso_ts(p_caso_orientacion_id, p_alumno_id)`
   - `registrar_citatorio_ts(p_caso_id)`
   - `registrar_contacto_ts(p_caso_id, p_tipo, p_resultado)`
   - `registrar_visita_ts(p_caso_id, p_observaciones, p_contexto)`
   - `actualizar_acuerdo_ts(p_acuerdo_id, p_estado)`
   - `escalar_desde_ts(p_caso_id)` — cambia `estado_intervencion` a `escalado_direccion`
   - `devolver_orientacion_ts(p_caso_id)` — cambia `estado_intervencion` a `devuelto_orientacion` y actualiza `orientacion_casos`
4. **Generar tipos TypeScript**: `supabase gen types typescript --local > src/supabase/types.ts`
5. **Actualizar `src/supabase/types.ts`**: Verificar que las 5 tablas nuevas estén tipadas.

### Fase 3B — API client (1 sprint)

1. **Crear `src/components/trabajoSocial/trabajoSocialApi.ts`** siguiendo el patrón de `orientacionApi.ts`.
2. Implementar funciones:
   - `loadTSCases()` — carga `trabajo_social_casos` + datos de alumno
   - `registerCitatorio(caseId)` — llama RPC `registrar_citatorio_ts`
   - `registerContact(caseId, tipo, resultado)`
   - `registerVisit(caseId, observaciones)`
   - `updateAgreement(agreementId, estado)`
   - `escalateCase(caseId)`
   - `returnToOrientacion(caseId)`
3. Conectar `buildTrabajoSocialCases()` para que lea de `trabajo_social_casos`.
4. Reemplazar `buildInitial*` mocks con carga real desde DB.

### Fase 3C — Persistencia en handlers (1 sprint)

1. En `DashboardTrabajoSocial.tsx`, cada `handle*` debe:
   - Llamar `trabajoSocialApi.*` con `await`
   - Llamar `logAudit()` desde `useApp()`
   - Solo si DB responde OK, actualizar estado local
2. Agregar `logAccess("consultar_trabajo_social")` al seleccionar caso.
3. Agregar `useEffect` + `beforeunload` para detectar datos no guardados.

### Fase 3D — Limpieza y pruebas (1 sprint)

1. Eliminar `buildInitialCitatorios`, `buildInitialContacts`, `buildInitialVisits`, `buildInitialAgreements`.
2. Ajustar `tests/DashboardTrabajoSocial.test.tsx` para mockear API.
3. Agregar tests de integración contra RPCs.
4. Verificar RLS con `supabase db test`.

---

## 9. Archivos que se tocarían

| Archivo | Cambio |
|---|---|
| `supabase/migrations/NNNNNNNNNNNN_trabajo_social_v1.sql` | **Nuevo:** Crear tablas + RLS + RPCs |
| `src/supabase/types.ts` | Regenerar tipos (o agregar interfaces manuales) |
| `src/components/trabajoSocial/trabajoSocialApi.ts` | **Nuevo:** Funciones de persistencia |
| `src/components/trabajoSocial/trabajoSocialTypes.ts` | Reemplazar builders mock por tipos DB + función `toCitatorioRecord()` |
| `src/components/dashboards/DashboardTrabajoSocial.tsx` | Agregar `useApp().logAudit` + llamadas a API en cada handler + loading states |
| `src/components/trabajoSocial/TrabajoSocialCaseDetail.tsx` | Opcional: mostrar estado real de sincronización |
| `src/components/trabajoSocial/FamilyContactLog.tsx` | Opcional: estado de guardado por fila |
| `src/components/trabajoSocial/HomeVisitLog.tsx` | Opcional: estado de guardado por fila |
| `src/store.tsx` | Si se crea slice dedicado `useTrabajoSocialSlice` (alternativa a API calls inline) |
| `src/utils/permisos.ts` | Resolver contradicción `can_close` |
| `src/types.ts` | Si se agregan tipos compartidos |
| `tests/DashboardTrabajoSocial.test.tsx` | Mockear API, no builders mock |
| `tests/trabajoSocialApi.test.ts` | **Nuevo:** Tests de integración contra RPCs |

---

## 10. Pruebas necesarias

| Tipo | Qué probar |
|---|---|
| **Unitarias (Vitest)** | Cada función en `trabajoSocialApi.ts` con `supabase` mockeado — 100% coverage |
| **Integración (Supabase local)** | Cada RPC: caso feliz + sin permisos + datos inválidos |
| **Componente (Vitest + jsdom)** | DashboardTrabajoSocial renderiza con datos reales, handlers llaman API y audit |
| **RLS (Supabase local `db test`)** | TS puede CRUD, Orientación solo SELECT, Dirección SELECT+UPDATE escalados |
| **Regresión** | `pnpm test`, `pnpm lint`, `pnpm type-check`, `pnpm build` |
| **Auditoría** | Cada acción produce una fila en `auditoria` con campos correctos |
| **Seguridad** | Usuario no autenticado no puede leer/escribir ninguna tabla nueva |
| **Carga** | 100 casos con 500 citatorios cada uno → render + filtro < 2s |

---

## Archivo de referencia: patrón Orientación

El módulo de Orientación (`src/components/orientacion/orientacionApi.ts`) es el modelo a seguir:

- **Tablas dedicadas:** `orientacion_casos`, `planes_intervencion`, `solicitudes_diagnostico`, `seguimiento_orientacion`
- **RPCs server-side:** `abrir_caso_orientacion()`, `solicitar_diagnostico()`, `crear_plan_intervencion()`, `derivar_trabajo_social()`, `escalar_direccion()`
- **Carga de datos:** `loadOrientacionCasos()` → `supabase.from("orientacion_casos").select(...)`
- **RLS policies por rol** en migración `20260501084547_orientacion_v2_backend.sql`
- **Auditoría:** RPC `audit_orientacion_action()` inserta en `public.auditoria`

Trabajo Social debe replicar este patrón: RPCs → tipos → API client → handlers → audit.

---

## Decisiones pendientes antes de implementar

1. **Cierre de casos:** Confirmar si Trabajo Social puede cerrar casos o solo dar seguimiento. La matriz de permisos (`permisos.ts`) tiene `can_close: true` para TS, pero la UI (`TrabajoSocialCaseDetail.tsx:127`) afirma que solo Dirección puede cerrar. Resolver antes de definir RLS y RPCs.
2. **Edición por Dirección:** Confirmar si Dirección/Subdirección pueden editar campos de casos de TS o solo consultar y escalar. Esto define si sus policies RLS son `FOR ALL` o `FOR SELECT`.
3. **Estrategia de escritura:** Confirmar si toda escritura debe pasar por RPCs obligatorias (patrón Orientación) o si se permiten inserts directos desde el cliente con RLS. RPCs dan mayor control y auditoría server-side; inserts directos son más rápidos de implementar pero menos seguros.
4. **Tabla `seguimiento_social` legacy:** Confirmar si se migran datos históricos, se deja como tabla inactiva, o se conecta como vista histórica de solo lectura. El trigger `tr_audit_social` existente podría colisionar si no se desactiva.
5. **Nomenclatura de roles:** Confirmar consistencia de nombres usados en RLS: `directivo` vs `direccion`, `orientacion`, `trabajo_social`, `system_admin`. Las policies usan `get_my_role()` que retorna el valor exacto del enum `app_role`.

---

*Fin del plan de persistencia. Aprobado para implementación en fase 3.*
