# Plan - Orientacion v2

## Fase 0. Diagnostico

- Confirmar tablas existentes y politicas RLS.
- Identificar reutilizacion y gaps sin duplicar dominios.

## Fase 1. Backend Supabase

- Crear migracion no destructiva.
- Agregar tablas minimas, constraints, indices FK y RLS.
- Agregar RPCs para abrir caso, solicitar diagnostico, registrar diagnostico, crear plan, derivar y escalar.

## Fase 2. Frontend

- Crear `src/components/orientacion/` con componentes de bandeja, detalle, historial, diagnosticos, plan, seguimiento, insights y reporte.
- Reemplazar `DashboardOrientacion.tsx` sin usar `addIncident`.

## Fase 3. Tipos y permisos

- Actualizar tipos Supabase manuales para las tablas/RPCs nuevas.
- Ajustar permisos de Orientacion para no cierre final.

## Fase 4. Validacion

- Ejecutar type-check, build y tests.
- Ejecutar auditoria/lint Supabase si el entorno local de Docker/Supabase esta disponible.

## Riesgos

- Las vistas actuales dependen de RLS de tablas base; cualquier apertura amplia existente sigue siendo riesgo heredado.
- Los tipos generados estaban desincronizados con el esquema remoto en `respuestas_docentes`; el cambio evita depender de esa tabla.
- Supabase Branching no esta disponible por plan Pro, asi que la validacion sera local/CI gratuita.
