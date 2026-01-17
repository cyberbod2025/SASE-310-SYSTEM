# Lista de Tareas Pendientes - Piloto SASE (3 Meses)

Esta lista prioriza las acciones necesarias para estabilizar la versión piloto y preparar el terreno para la producción real.

## 1. Infraestructura y Seguridad (Backend)

- [ ] **Edge Functions para Auth:** Migrar la lógica de creación de usuarios (`admin.createUser`) de `AprobacionesPersonal.tsx` a una Supabase Edge Function segura.
  - _Impacto:_ Crítico. Actualmente la aprobación es simulada en el cliente.
- [ ] **RLS (Row Level Security):** Auditar y endurecer las políticas RLS en todas las tablas (`students`, `incidents`, `solicitudes_alta_personal`) para asegurar que solo los roles correctos lean/escriban.
- [ ] **Backups Automatizados:** Configurar respaldos diarios de la base de datos Supabase.

## 2. Funcionalidad Core

- [ ] **Módulo de Asistencia (Docente):** Reemplazar el placeholder "En Revisión Especial" con una tabla simple de pase de lista que guarde en `attendance_logs`.
- [ ] **Módulo de Evaluaciones (Docente):** Activar la captura de calificaciones (al menos numéricas) por materia.
- [ ] **Persistencia Local:** Mover los checklists y estados locales (Inventario Enfermería, Checklist Dirección) a tablas reales (`tasks`, `inventory`) para que no se pierdan al recargar.

## 3. Inteligencia Artificial (Fase 2)

- [ ] **Conexión Real LLM:** Conectar el `AIClient.ts` abstracto a una API real (OpenAI/Anthropic) via Edge Function para proteger la API Key.
- [ ] **Activación de Feature Flag:** Cambiar `AIClient.enabled = true` una vez configurada la API.
- [ ] **Entrenamiento de Contexto:** Refinar los prompts en `ai/prompts.ts` con datos reales de la escuela (reglamento interno, protocolos).

## 4. UX / UI & Feedback

- [ ] **Feedback Loop:** Monitorear la tabla `system_feedback` semanalmente y corregir bugs reportados.
- [ ] **Optimización Móvil:** Realizar pruebas exhaustivas de los dashboards en dispositivos móviles (celulares de docentes/prefectos).
- [ ] **Manual de Usuario:** Generar PDFs o videos cortos de 1 min. explicando cómo "Registrar Incidencia" o "Pasar Lista".

## 5. Administrativo

- [ ] **Carga Inicial de Datos:** Importar la matrícula real de alumnos (Excel -> Supabase) para evitar datos ficticios en el piloto.
- [ ] **Validación Jurídica:** Revisar los textos legales de `RegistroPersonal.tsx` con el área legal de la institución.
