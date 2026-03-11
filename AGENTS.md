# SASE-310 — Guía Operativa para Agentes de IA

Este documento define las reglas obligatorias para cualquier agente de IA que modifique este repositorio.

Incluye:
- Arquitectura real del sistema
- Restricciones de seguridad
- Reglas institucionales
- Flujo de incidencias
- Motor de riesgo (Semáforo Institucional)

El sistema se utiliza en una escuela real, por lo tanto la **estabilidad y trazabilidad institucional** son críticas.

## Regla Global de Idioma

Todo el dominio institucional debe mantenerse en **español**.

Esto incluye:
- nombres de campos
- lógica institucional
- etiquetas de UI
- documentos
- comentarios de código relacionados con el dominio escolar

Los términos técnicos del stack pueden permanecer en inglés.

---

## Arquitectura del Sistema

```text
Frontend
React + Vite + TypeScript
        ↓
API
Vercel Serverless Functions
        ↓
Database
Supabase (PostgreSQL + RLS)
        ↓
AI Providers
OpenRouter / Gemini
```

Flujo real: `Frontend → API → Database → AI`

Los proveedores de IA nunca deben ser llamados directamente desde el navegador.

---

## Componentes Principales

### Motor de Incidencias

SASE gestiona incidencias institucionales de estudiantes.

Tipos principales:
- conducta
- asistencia
- académico
- socioemocional
- salud

Cada incidencia forma parte del expediente institucional del alumno.

### Flujo de Incidencias

#### Creación
Pueden crear incidencias:
- docente
- docente_tutor
- prefectura
- orientacion
- trabajo_social
- directivo

#### Cierre de incidencias
El docente puede cerrar una incidencia solo si:
- él la creó
- no fue escalada

Si la incidencia fue escalada, pueden cerrarla:
- orientacion
- trabajo_social
- subdireccion
- directivo
- system_admin

#### Rol de Prefectura
Prefectura es el operador central del sistema de incidencias.

Funciones:
- acompañamiento al docente
- registro de incidencias
- seguimiento de casos
- monitoreo del comportamiento del grupo
- escalamiento institucional

---

## Motor de Riesgo (Semáforo Institucional)

SASE incluye un sistema predictivo de riesgo estudiantil.

Dimensiones evaluadas:
- disciplina
- asistencia
- académico
- socioemocional

Cada incidencia contribuye a un puntaje de riesgo.

### Fuente de Verdad del Semáforo
El cálculo del semáforo se realiza exclusivamente en PostgreSQL.

**Regla obligatoria:**
La base de datos es la única fuente de verdad del riesgo. El frontend NO debe recalcular el riesgo. React solo debe leer `estado_semaforo` y `puntaje_riesgo`.

### Algoritmo de Riesgo

Pesos por gravedad:
| Gravedad | Puntos |
|---|---|
| leve | 1 |
| media | 3 |
| grave | 5 |
| critica | 8 |

Decaimiento temporal:
| Edad Incidencia | Peso |
|---|---|
| 0-30 días | 100% |
| 30-90 días | 50% |
| > 90 días | 0% |

Las incidencias no se eliminan, solo dejan de afectar el riesgo (Amnistía por tiempo).

### Regla de Reincidencia
Tres incidencias graves en la misma dimensión dentro de 60 días provocan:
`INTERVENCION` (independientemente del puntaje acumulado).

### Protección de Asistencia
Incidencias menores de asistencia (retardos, uniforme) tienen límite de impacto dinámico. Un alumno no puede llegar a INTERVENCIÓN solo por retardos si no hay incidencias graves.

### Estados del Semáforo
| Estado Técnico | Lenguaje Institucional UI |
|---|---|
| CERRADO | Acompañamiento concluido |
| OBSERVADO | Observación inicial |
| PATRON_DETECTADO | Análisis de trayectoria |
| EN_ANALISIS | Atención prioritaria |
| INTERVENCION | Acompañamiento Intensivo / Intervención Institucional |

---

## Sistema de Auditoría (Caja Negra)

Toda acción relevante queda registrada mediante Triggers inmutables.

Eventos auditados:
- creación de incidencias
- cambios de estado
- escalamiento
- cierre
- acciones administrativas

El registro se implementa con triggers en PostgreSQL. El historial no puede modificarse desde el frontend.

---

## Roles del Sistema

### Roles institucionales:
- docente
- docente_tutor
- prefectura
- orientacion
- trabajo_social
- medico_escolar
- udeii
- promotora_lectura
- secretaria
- directivo
- subdireccion

### Roles Técnicos:

- **developer**: Rol de desarrollo. Puede acceder a dashboards técnicos y herramientas de depuración. No debe usarse en producción institucional.
- **system_admin**: Rol de recuperación del sistema (Root Level). Capacidades: bypass completo de RLS, acceso total a tablas, recuperación de registros, cierre de incidencias huérfanas, mantenimiento del sistema. No debe aparecer en interfaces institucionales para otros roles.
- **guest**: Rol mínimo sin autenticación. Capacidades: acceso limitado, no puede ver expedientes, no puede crear incidencias, no puede acceder a datos sensibles.

---

## Seguridad

Seguridad implementada en tres capas.

1. **Frontend**: renderización por roles, control de componentes.
2. **Backend**: validación de solicitudes, control de origen, validación de inputs.
3. **Database**: Row Level Security (RLS), políticas por rol, triggers de auditoría.

**Regla Crítica de Permisos:** Los permisos nunca deben modificarse solo en frontend. Cambios de permisos requieren actualizar:
- políticas RLS
- permisos.ts
- tipos en types.ts

### Variables de Entorno

Frontend (Acceso mediante `import.meta.env`):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Backend (Acceso mediante `process.env`):
- `SUPABASE_SERVICE_ROLE_KEY`
- claves de IA

**Nunca exponer:** service_role, claves de IA en frontend.

### Llamadas a IA
Las llamadas a IA deben realizarse únicamente mediante `api/ai/openrouter.ts` o `api/ai/gemini.ts`. Nunca llamar IA directamente desde el navegador.

---

## Reglas de Estabilidad Institucional

El sistema opera en un entorno escolar real. Por lo tanto:
- no eliminar columnas sin migración
- no renombrar campos sin migración
- no modificar roles sin revisar RLS
- no alterar la estructura de incidencias sin revisión

### Reglas para Agentes de IA
Cuando modifiques el sistema:
1. mantener terminología institucional en español
2. no recalcular el semáforo en frontend
3. no cambiar permisos sin revisar RLS
4. evitar refactors masivos sin revisión
5. validar inputs en backend

### Prevención de Errores Comunes
Agentes no deben:
- exponer claves en frontend
- permitir cambio de rol desde UI
- recalcular riesgo en React
- eliminar registros institucionales

---

## Estado del Proyecto

Infraestructura actual:
- React + Vite
- Supabase PostgreSQL
- Vercel Serverless
- Zustand

Despliegue actual: Vercel
Versión activa aproximada: v4

---

## Nota Final
SASE-310 es un sistema institucional real, no un proyecto experimental. Las modificaciones deben preservar: integridad de datos, trazabilidad institucional, seguridad del sistema.

### Cosas que conviene prevenir desde ahora (Advertencias a futuro)

1. **Índices en base de datos**: Cuando haya muchos alumnos se necesitarán índices en `incidencias.alumno_id`, `incidencias.fecha`, `incidencias.tipo`.
2. **Evitar recalcular todo el riesgo**: El riesgo debe actualizarse solo cuando cambia una incidencia, mediante triggers. NO calcular en masa.
3. **Nunca confiar en validación del frontend**: Toda validación crítica debe existir en API o PostgreSQL.
