# Investigación

## Evidencia del repositorio

- `src/components/dashboards/DashboardUDEII.tsx` usa `updateBapInfo` y solo lista alumnos cuyo resumen ya contiene `hasBAP`.
- `src/store/slices/useStudentsSlice.ts` aplica estado optimista antes de la escritura y no inspecciona `error`.
- `public.seguimiento_bap` existe desde `20240101000000_core_sase_schema.sql`, pero no tiene políticas RLS funcionales ni privilegios explícitos en las migraciones inspeccionadas.
- `public.alumnos` no concede actualmente a UDEII la política de lectura institucional.
- El trigger del Behavior Drift Engine ya observa cambios en `seguimiento_bap`; reutilizar la tabla mantiene integración con el modelo vigente.

## Decisiones

### D1. Reutilizar `seguimiento_bap`

Se amplía la tabla existente. Crear otra tabla duplicaría el expediente BAP y rompería consumidores como `expediente_integral_alumno` y Behavior Drift.

### D2. Historial append-only

El cliente recibe `SELECT` e inserta mediante una función institucional, pero no obtiene `UPDATE` ni `DELETE` sobre eventos. La corrección de un seguimiento se registra como un evento posterior.

### D3. Mutación transaccional

Una función Postgres actualiza el resumen de `alumnos.datos_bap` e inserta el evento en la misma transacción. Será `SECURITY DEFINER` porque UDEII no debe recibir permiso general de actualización sobre toda la fila de `alumnos`.

La función:

- vive en `public` para RPC;
- fija `search_path = ''`;
- exige `auth.uid()`;
- valida el rol con `private.is_institutional_actor`;
- revoca ejecución a `PUBLIC` y `anon`;
- concede ejecución únicamente a `authenticated`;
- valida el alumno y todos los campos antes de mutar.

### D4. Privilegios y RLS explícitos

Supabase separa privilegios de objeto y políticas por fila. Se revocará el acceso general a `seguimiento_bap`, se concederá solo `SELECT` al rol autenticado y la escritura ocurrirá por la función validada.

### D5. Indicadores derivados

Se elimina la afirmación fija de IA. El tablero mostrará conteos de eventos y revisiones pendientes calculados desde el historial cargado.

## Riesgos

- La migración depende de `private.is_institutional_actor`, creada por `20260701000000_add_rls_policies.sql`.
- Una base con deriva previa podría tener columnas o políticas no reflejadas en Git; la validación local con Docker sigue siendo obligatoria.
- `alumnos.datos_bap` permanece como JSON legado; la función debe tolerar objetos incompletos y arreglos ausentes.
- Los datos BAP son sensibles; no se implementa exportación masiva ni notificación automática en este corte.

## Documentación consultada

- Supabase Row Level Security.
- Supabase Securing your API.
- Supabase JavaScript Update.
- Changelog de exposición explícita de tablas al Data API, abril de 2026.

