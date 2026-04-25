# Expediente: Behavior Drift Engine v2 — Lógica Basada en Tiempo

**Fecha**: 2026-04-25
**Autor**: Antigravity
**Impacto**: Schema (behavior_metrics), funciones PostgreSQL, tipos TypeScript, componente BehaviorDriftCard

## Contexto

El Behavior Drift Engine v1 calculaba la deriva comparando el comportamiento actual (un solo registro) contra el promedio global de todos los registros históricos. Esto producía un análisis estático que no capturaba cambios progresivos a lo largo del tiempo.

## Cambios Realizados

### 1. Migración SQL (`20260425160000_behavior_drift_time_based.sql`)

- **Nuevo campo**: `estado_datos` (`insuficiente` | `activo`) — indica si el alumno tiene datos suficientes para calcular deriva real.
- **CHECK ampliado**: `nivel_deriva` ahora acepta `'sin datos suficientes'` además de los 4 niveles anteriores.
- **`calcular_deriva()` reescrita** con lógica temporal:
  - Promedio de los últimos 3 registros (`calidad + consistencia`)
  - Promedio histórico total
  - Pendiente simple (diferencia primer→último registro / número de intervalos)
  - Fórmula: `deriva = (ultimos3 - historico) + (pendiente * 0.5)`
  - Mínimo 3 registros para activar; si no: `nivel = 'sin datos suficientes'`, `estado_datos = 'insuficiente'`

### 2. TypeScript (`src/types.ts`)

- `BehaviorDriftLevel` extendido con `"sin datos suficientes"`
- Nuevo tipo `BehaviorDataStatus = "insuficiente" | "activo"`
- `BehaviorMetric` incluye `estadoDatos: BehaviorDataStatus`

### 3. Slice (`src/store/slices/useStudentsSlice.ts`)

- Select query incluye `estado_datos`
- Mapping agrega `estadoDatos` al objeto `BehaviorMetric`

### 4. Componente (`src/components/BehaviorDriftCard.tsx`)

- `driftConfig` incluye entrada para `"sin datos suficientes"` con estilos slate neutros y mensaje informativo

## Compatibilidad

- No se eliminaron columnas ni campos existentes
- Los 4 niveles de deriva anteriores mantienen su comportamiento
- Registros existentes con < 3 métricas se marcan como `insuficiente` / `sin datos suficientes` en la migración
- La función `registrar_behavior_metric()` no fue modificada; sigue invocando `calcular_deriva()` que ahora ejecuta la lógica v2

## Validación

- `npm run type-check` ✅
- `npm run lint` ✅
