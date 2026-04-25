# Plan de Implementación: Matrícula Inteligente + Cierre de Ciclo

## Resultado final

Dos módulos funcionales que permitan distribuir alumnos en grupos con asistencia de IA (Matrícula Inteligente) y procesar el fin de ciclo escolar con simulación previa y ejecución auditada (Cierre de Ciclo), sin romper dashboards existentes y conservando historial completo.

## Criterios de éxito

1. Drag & drop estable sin duplicados; persistencia en DB
2. Cierre de ciclo con simulación read-only y ejecución que preserva historial
3. Build sin errores (`lint` + `type-check` + `test` + `build`)

---

## Fase 1 — Schema y RLS (~90 min)

### 1.1 Migración: tablas base

Archivo: `supabase/migrations/20260425180000_matricula_ciclo_schema.sql`

```
ciclos_escolares
  id uuid PK default gen_random_uuid()
  nombre text NOT NULL UNIQUE          -- "2025-2026"
  activo boolean NOT NULL DEFAULT false
  fecha_inicio date
  fecha_fin date
  created_at timestamptz DEFAULT now()
  CONSTRAINT un_ciclo_activo CHECK     -- trigger auxiliar, solo 1 activo

alumno_ciclo
  id uuid PK default gen_random_uuid()
  alumno_id uuid FK → alumnos(id)
  ciclo_id uuid FK → ciclos_escolares(id)
  grado integer NOT NULL               -- 1, 2, 3
  grupo text                           -- "A", "B", etc.
  grupo_id uuid FK → grupos(id)        -- nullable para nuevo ciclo sin grupos
  estatus text NOT NULL DEFAULT 'activo'
    CHECK (estatus IN ('activo','promovido','retenido','baja','egresado'))
  grupo_sugerido text                  -- llenado por IA, nullable
  locked boolean DEFAULT false         -- protege de recalcular
  fecha_asignacion timestamptz DEFAULT now()
  UNIQUE(alumno_id, ciclo_id)          -- sin duplicados

asignacion_alumno_grupo
  id uuid PK
  alumno_ciclo_id uuid FK → alumno_ciclo(id)
  grupo_id uuid FK → grupos(id)
  asignado_por uuid FK → perfiles_usuario(id)
  origen text CHECK (origen IN ('manual','ia','cierre'))
  created_at timestamptz DEFAULT now()
```

### 1.2 Migración: backfill del ciclo actual

```sql
-- Insertar ciclo actual basado en grupos.ciclo_escolar existente
INSERT INTO ciclos_escolares (nombre, activo)
SELECT DISTINCT ciclo_escolar, true FROM grupos LIMIT 1;

-- Poblar alumno_ciclo desde snapshot actual de alumnos
INSERT INTO alumno_ciclo (alumno_id, ciclo_id, grado, grupo)
SELECT a.id, c.id, a.grado, a.grupo
FROM alumnos a, ciclos_escolares c
WHERE c.activo = true;
```

### 1.3 Trigger de sincronización

```sql
-- Cuando se actualiza alumno_ciclo.grupo del ciclo activo,
-- sincronizar alumnos.grupo para compatibilidad con dashboards
CREATE FUNCTION sync_alumno_grupo() ...
```

### 1.4 RLS

| Tabla | Rol | Permiso |
|:---|:---|:---|
| ciclos_escolares | authenticated | SELECT |
| ciclos_escolares | directivo, system_admin | ALL |
| alumno_ciclo | authenticated | SELECT (ciclo activo) |
| alumno_ciclo | secretaria, directivo, system_admin | INSERT/UPDATE (ciclo activo) |
| asignacion_alumno_grupo | secretaria, directivo, system_admin | INSERT |
| asignacion_alumno_grupo | authenticated | SELECT |

**Entregable**: Migración aplicada local sin errores, `supabase db lint` limpio.

---

## Fase 2 — RPCs y API (~60 min)

### 2.1 RPC: simular_promocion(ciclo_id uuid)

Retorna `TABLE(alumno_id uuid, nombre text, grado int, grupo text, faltas int, faltas_consecutivas int, promedio numeric, incidencias int, bap boolean, decision_sugerida text)`

Lógica:
- Para cada alumno activo en el ciclo:
  - Contar faltas desde `attendance_logs` donde `estado != 'presente'`
  - Calcular faltas consecutivas (gap analysis)
  - Obtener promedio de `examenes_trimestre.calificacion_final`
  - Contar incidencias
  - Verificar BAP (`alumnos.datos_bap IS NOT NULL`)
  - Decidir: `grado=3 → egresar`, `faltas>=21 → baja`, `else → promover`
- **Read-only**: no escribe nada

### 2.2 RPC: ejecutar_promocion(ciclo_actual uuid, ciclo_nuevo uuid)

Lógica:
1. Validar ciclo_actual.activo = true
2. Validar ciclo_nuevo existe y activo = false
3. Para cada alumno activo en ciclo_actual:
   - if grado=3 → UPDATE estatus='egresado' (no insertar en nuevo)
   - if faltas>=21 → UPDATE estatus='baja' (no insertar)
   - else → INSERT alumno_ciclo con grado+1, estatus='activo'
4. UPDATE ciclos_escolares SET activo=false WHERE id=ciclo_actual
5. UPDATE ciclos_escolares SET activo=true WHERE id=ciclo_nuevo
6. INSERT auditoria con resumen completo
- **SECURITY DEFINER**, solo ejecutable por directivo/system_admin

### 2.3 API: /api/ia/distribucion

Endpoint serverless que:
- Recibe `ciclo_id`
- Lee alumno_ciclo + métricas (promedio, incidencias, BAP, behavior_metrics)
- Calcula score de equilibrio por grupo
- Retorna `{ sugerencias: [{alumno_id, grupo_sugerido}], equilibrio: [{grupo, score}] }`
- Usa GOOGLE_API_KEY (server-side only)

**Entregable**: RPCs probadas local, endpoint funcional.

---

## Fase 3 — Frontend: Store + UI (~120 min)

### 3.1 Dependencias

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 3.2 Store slices

**`src/store/slices/useMatriculaSlice.ts`**:
- State: alumnos, grupos, asignaciones, cambiosPendientes, lastActionStack, loading
- Actions: fetchAlumnosCiclo, moveAlumno (optimistic), undoLastMove, solicitarSugerenciasIA, aprobarLote

**`src/store/slices/useCierreCicloSlice.ts`**:
- State: simulacion[], overrides{}, simulado: boolean, ejecutando: boolean
- Actions: simular (RPC), setOverride, ejecutar (RPC), reset

### 3.3 Tipos

```typescript
// En src/types.ts
export interface CicloEscolar { id: string; nombre: string; activo: boolean; }
export interface AlumnoCiclo { id: string; alumnoId: string; cicloId: string; grado: number; grupo: string; estatus: string; grupoSugerido?: string; locked: boolean; }
export interface SimulacionPromocion { alumnoId: string; nombre: string; grado: number; grupo: string; faltas: number; faltasConsecutivas: number; promedio: number; incidencias: number; bap: boolean; decisionSugerida: string; }
// AppModule += MATRICULA_INTELIGENTE, CIERRE_CICLO
```

### 3.4 Componentes (Matrícula Inteligente)

```
src/modules/matricula/
  MatriculaInteligente.tsx     -- Layout 3 zonas
  PanelAlumnos.tsx             -- Lista filtrable con tarjetas
  PanelGrupos.tsx              -- Contenedores drop con métricas
  PanelAcciones.tsx            -- Botones IA (Generar, Recalcular, Deshacer, Aprobar)
  AlumnoCard.tsx               -- Tarjeta draggable
  GrupoContainer.tsx           -- Drop zone con semáforo
  ModalAprobacion.tsx          -- Confirmación batch
```

### 3.5 Componentes (Cierre de Ciclo)

```
src/modules/cierre-ciclo/
  CierreCiclo.tsx              -- Pantalla principal
  TablaSimulacion.tsx          -- Tabla editable con override
  ResumenCierre.tsx            -- Stats pre-ejecución
  ModalConfirmacion.tsx        -- Confirmación final con resumen
```

### 3.6 Wiring

- Agregar `MATRICULA_INTELIGENTE` y `CIERRE_CICLO` a `AppModule` enum
- Lazy-load en `ModuleRouter.tsx`
- Agregar entradas al sidebar correspondiente (secretaria, directivo, admin)
- Registrar slices en `src/store.tsx`

**Entregable**: Ambos módulos funcionales, build sin errores.

---

## Fase 4 — Verificación y deploy (~30 min)

### 4.1 Validación local

- [ ] `supabase db reset` pasa todas las migraciones
- [ ] `supabase db lint --local` sin errores
- [ ] `npm run lint` limpio
- [ ] `npm run type-check` limpio
- [ ] `npm run test` sin regresiones
- [ ] `npm run build` exitoso

### 4.2 Pruebas funcionales

- [ ] Drag & drop: mover alumno A→B, verificar no duplicados
- [ ] Recalcular: verificar que locked=true no se sobreescribe
- [ ] Aprobar: verificar persistencia en DB + audit log
- [ ] Simular promoción: verificar output sin escritura en DB
- [ ] Ejecutar promoción: verificar 3°→egresado, faltas>=21→baja, otros→grado+1
- [ ] RLS: secretaria puede CRUD, docente solo lee

### 4.3 Deploy

- Aplicar migración a producción
- Push a branch + Vercel deploy
- Registrar migración en historial remoto

**Entregable**: Sistema desplegado y funcional.

---

## Riesgos y mitigación

| Si pasa... | Hago... |
|:---|:---|
| Dashboards rompen por cambio en `alumnos.grupo` | Trigger de sync mantiene `alumnos.grupo` actualizado; campo nunca se elimina |
| IA devuelve sugerencias inconsistentes | Frontend valida que grupo_sugerido exista; campo es solo informativo |
| Cierre de ciclo ejecutado por error | Modal requiere doble confirmación; RPC valida simulación previa flag |
| Conflictos de drag & drop (duplicados) | UNIQUE constraint + validación optimista en store |
| `@dnd-kit` genera peso excesivo en bundle | Tree-shakeable; solo importa core + sortable |

---

## Checklist final

- [ ] Spec aprobada y en `specs/`
- [ ] Migración aplicada local y producción
- [ ] RPCs probadas con datos reales
- [ ] Build limpio (lint + type-check + test + build)
- [ ] Expediente `specs/matricula-cierre-ciclo/` actualizado con resultado
