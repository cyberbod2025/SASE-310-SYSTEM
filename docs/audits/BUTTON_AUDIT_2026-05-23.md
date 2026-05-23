# Auditoría Institucional de Botones y Acciones Interactivas
**SASE-310 — Sistema Escolar de Trayectorias y Seguridad**
*Fecha de Auditoría: 2026-05-23*

---

## 1. Resumen Ejecutivo

Esta auditoría técnica e institucional ha analizado detalladamente la interfaz de usuario de **SASE-310** en su rama activa `audit/button-inventory-may23`. El objetivo principal es identificar y clasificar cada punto de interacción interactivo (botones, enlaces, cards clicables y selectores) para asegurar que el sistema sea consistente, seguro, auditable y esté libre de simulaciones confusas antes del inicio de su despliegue piloto.

### Hallazgos Críticos:
1. **Asimetría de Persistencia (Trabajo Social):** Mientras que los módulos de **Docente**, **Orientación** y **Dirección** están fuertemente acoplados a la base de datos (Supabase) mediante RPCs y API real, el dashboard de **Trabajo Social** opera casi en su totalidad sobre un **estado local simulado (`useState`)**. Las acciones críticas como registrar citatorios, iniciar seguimientos o escalar a Dirección se pierden al recargar la página (F5), lo cual representa un riesgo de pérdida de información legal/institucional grave.
2. **Acciones de Alto Impacto sin Confirmación ("Fail-Open" UX):** Controles de alta sensibilidad como el escalamiento de casos de indisciplina o la activación del protocolo **SOS** carecen de una barrera mecánica o modal de confirmación humana previa. Un solo clic accidental puede activar alertas globales o registrar antecedentes permanentes.
3. **Ausencia de Controladores de Carga y Bloqueo de Doble Clic:** Múltiples formularios asíncronos importantes (como el registro de incidencias en Docente o la creación de planes en Orientación) no desactivan sus botones de envío durante la transacción de red (`Promise` pendiente). Esto los expone a condiciones de carrera o creación de registros duplicados involuntarios.

---

## 2. Tabla General de Controles Interactivos

| Archivo | Componente | Texto Visible | Tipo | Acción Actual | Clasificación | Riesgo Institucional | Recomendación Concreta |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IncidentQuickForm.tsx` | `IncidentQuickForm` | "Guardar reporte" | `button` | Ejecuta `onSubmit(false)`, llama a `addIncident` y cierra modal. | `FUNCIONAL_REAL` / `REQUIERE_LOADING_ERROR` | **Medio:** Transacción asíncrona directa a Supabase sin feedback visual de carga. Vulnerable a doble clic. | Añadir estado `isSubmitting`, deshabilitar botón y mostrar spinner mientras la promesa se resuelve. |
| `IncidentQuickForm.tsx` | `IncidentQuickForm` | "Guardar y continuar" | `button` | Ejecuta `onSubmit(true)`, guarda incidencia pero deja el formulario abierto. | `FUNCIONAL_REAL` / `REQUIERE_LOADING_ERROR` | **Medio:** Riesgo de crear incidencias duplicadas debido a pulsación rápida. | Implementar debounce o deshabilitar botón por 1.5s tras el clic. |
| `DashboardDocente.tsx` | `DashboardDocente` | "Escalar a Directivo" | `button` | Llama a `escalateCase` en store/Supabase. | `FUNCIONAL_REAL` / `RIESGOSO` | **Alto:** Escala directamente un alumno a Dirección sin paso intermedio de confirmación. | Implementar un diálogo de confirmación modal ("¿Estás seguro de que deseas escalar este caso?"). |
| `DashboardPrefectura.tsx` | `DashboardPrefectura` | "Notificar Tutor" | `button` | Muestra `toast.success` simulando envío por pasarela institucional. | `SIMULADO` | **Alto:** El usuario asume que se contactó al padre/tutor de inmediato, pero no se realiza ninguna llamada API. | Cambiar texto a "Notificar Tutor (Simulado)" o deshabilitar y marcar como `EN_PREPARACION_HONESTA` en Fase 1. |
| `DashboardPrefectura.tsx` | `DashboardPrefectura` | "Escalar a Orientación" | `button` | Llama a `addIncident` con tipo Conducta y registra en bitácora de auditoría. | `FUNCIONAL_REAL` / `RIESGOSO` | **Medio:** Escalamiento inmediato sin confirmación previa del prefecto. | Añadir un tooltip de advertencia y confirmación antes del envío. |
| `SOSButton.tsx` (Core) | `SOSButton` | "SOS" | `button` | Llama a `sosAlert` asíncrono, notifica a Prefectura y abre modal informativo. | `FUNCIONAL_REAL` / `RIESGOSO` | **Crítico:** Acción asíncrona de alto impacto institucional. Un clic accidental activa alertas. | Implementar un gatillo de retención física de 3 segundos (Hold-to-Activate) con animación circular de carga. |
| `DashboardDireccion.tsx` | `DashboardDireccion` | "Generar reporte ejecutivo" | `button` | Mapea casos críticos en HTML local y abre `PrintPreviewModal`. | `FUNCIONAL_REAL` | **Bajo:** Operación segura de lectura y formateo en memoria local. | Nada. El funcionamiento actual es óptimo para la lectura local. |
| `DashboardDireccion.tsx` | `DashboardDireccion` | "Supervisar vencidos" | `button` | Llama a `toast("Filtro aplicado...")` sin filtrar datos reales. | `SIMULADO` | **Bajo:** Inconsistencia menor de UI sin repercusión en datos. | Implementar filtro en la lista local de seguimiento o marcar el control como "Próximamente". |
| `DashboardSecretaria.tsx` | `DashboardSecretaria` | "Importar archivo (análisis IA)" | `button` | Llama a `handleImport`, simula análisis por 1.5s y abre distribución modal. | `FUNCIONAL_REAL` | **Bajo:** Simulación de IA local controlada y fluida. | Agregar una barra de progreso animada tipo "Lector OCR de Matrículas". |
| `DashboardSecretaria.tsx` | `DashboardSecretaria` | "Confirmar distribución" | `button` | Ejecuta `importStudents` local en el store y guarda en auditoría. | `FUNCIONAL_REAL` | **Medio:** Modifica masivamente la matrícula en el store local. | Asegurar que la importación persista en Supabase con manejo estricto de errores de transacción. |
| `CierreCiclo.tsx` | `CierreCiclo` | "Simular promoción" | `button` | Ejecuta RPC de solo lectura `simular_promocion` en Supabase. | `FUNCIONAL_REAL` | **Medio:** Procesamiento masivo por base de datos, puede tardar. | Mostrar un modal de carga bloqueante durante la ejecución del RPC. |
| `CierreCiclo.tsx` | `CierreCiclo` | "Ejecutar promoción" | `button` | Llama a la RPC destructiva `ejecutar_promocion` y escribe en auditoría. | `FUNCIONAL_REAL` / `RIESGOSO` | **Crítico:** Modifica la base de datos de manera permanente e irreversible (promueve y egresa alumnos). | **Obligatorio:** Solicitar ingreso de contraseña del directivo y doble firma digital digital (checkbox de consentimiento explícito). |
| `DashboardUDEII.tsx` | `DashboardUDEII` | "Exportar log BAP" | `button` | Muestra `toast` indicando función en preparación. | `EN_PREPARACION_HONESTA` | **Bajo:** Comportamiento transparente. | Deshabilitar estéticamente el botón (opacity-50, cursor-not-allowed) para evitar clics innecesarios. |
| `DashboardUDEII.tsx` | `DashboardUDEII` | "Manual de Estrategias" | `button` | Muestra `toast` de función en preparación. | `EN_PREPARACION_HONESTA` | **Bajo:** Comportamiento transparente. | Deshabilitar botón. |
| `DashboardUDEII.tsx` | `DashboardUDEII` | "Notificación automática" | `button` | Muestra `toast` de función en preparación. | `EN_PREPARACION_HONESTA` | **Bajo:** Comportamiento transparente. | Deshabilitar botón. |
| `DashboardTrabajoSocial.tsx` | `DashboardTrabajoSocial` | "Iniciar seguimiento" | `button` | Modifica estado local del componente (`setStatusOverrides`) y añade nota. | `SIMULADO` | **Alto:** El usuario cree que inició un seguimiento persistente, pero la información desaparece al refrescar (F5). | Rediseñar para escribir en Supabase (`interventions_log` o tabla equivalente de Trabajo Social). |
| `DashboardTrabajoSocial.tsx` | `DashboardTrabajoSocial` | "Registrar citatorio" | `button` | Añade un objeto local a la lista `citatorios`. | `SIMULADO` | **Alto:** Los citatorios son requerimientos con valor de acta. Su no persistencia es grave. | Conectar con la tabla `citas_padres` en Supabase de forma asíncrona. |
| `DashboardTrabajoSocial.tsx` | `DashboardTrabajoSocial` | "Actualizar cumplimiento" | `button` | Actualiza estado del acuerdo en el array local `agreements`. | `SIMULADO` | **Alto:** Pérdida de acuerdos firmados por padres al refrescar la página. | Persistir los compromisos en una tabla dedicada (`acuerdos_cumplimiento`). |
| `DashboardTrabajoSocial.tsx` | `DashboardTrabajoSocial` | "Escalar a Dirección" | `button` | Cambia localmente el estado de `lastAction`. No escribe en base de datos. | `SIMULADO` | **Alto:** Dirección nunca recibirá este caso porque la alerta no se escribe en DB ni genera notificación global. | Enlazar directamente al hook `escalateCase` de `useInstitutionalActions`. |
| `DashboardTrabajoSocial.tsx` | `DashboardTrabajoSocial` | "Devolver a Orientación" | `button` | Modifica localmente `lastAction`. No notifica al área de Orientación. | `SIMULADO` | **Alto:** Incomunicación entre departamentos debido a flujo simulado localmente. | Invocar `notifyDepartment` del hook central para alertar al rol de Orientación real. |
| `DashboardOrientacion.tsx` | `DashboardOrientacion` | "Abrir caso" / "onOpenStudentCase" | `button` | Llama al RPC `abrir_caso_orientacion` y refresca la lista. | `FUNCIONAL_REAL` | **Medio:** Escritura asíncrona directa en DB mediante procedimiento almacenado. | Proteger contra doble clic durante el tiempo de espera de la base de datos. |
| `DashboardOrientacion.tsx` | `DashboardOrientacion` | "Solicitar diagnóstico" | `button` | Llama a RPC `solicitar_diagnostico` para enviar petición al docente. | `FUNCIONAL_REAL` | **Medio:** Genera una solicitud que altera la bandeja del docente de inmediato. | Asegurar que el docente reciba una alerta sonora/visual y requiera confirmación de lectura. |
| `DashboardOrientacion.tsx` | `DashboardOrientacion` | "Crear plan de intervención" | `button` | Ejecuta RPC `crear_plan_intervencion` en Supabase. | `FUNCIONAL_REAL` | **Medio:** Crea estructura académica y terapéutica para el expediente integral. | Proteger el formulario y sanitizar los campos de texto del plan de intervención. |

---

## 3. Botones Críticos para Corregir Antes del Piloto

Estos elementos presentan clasificaciones **RIESGOSAS** o **SIMULADAS** que atentan directamente contra el flujo de datos institucional básico del sistema:

1. **Escalamiento local en Trabajo Social (`DashboardTrabajoSocial.tsx`):**
   * *Problema:* El botón "Escalar a Dirección" solo modifica un `lastAction` local. Dirección no se entera.
   * *Acción:* Reemplazar con llamada real a `escalateCase` de `useInstitutionalActions`.
2. **Registro de Citatorios en Trabajo Social (`DashboardTrabajoSocial.tsx`):**
   * *Problema:* No se guardan los citatorios formales en base de datos.
   * *Acción:* Conectar el handler de citatorios a la tabla `citas_padres` en Supabase.
3. **Guardado de Acuerdos de Cumplimiento en Trabajo Social (`DashboardTrabajoSocial.tsx`):**
   * *Problema:* Los compromisos institucionales se borran al recargar.
   * *Acción:* Implementar inserción en base de datos para la bitácora de compromisos firmados.
4. **Activación de Alerta SOS Directa (`SOSButton.tsx`):**
   * *Problema:* Al hacer un solo clic rápido en "SOS" se dispara el protocolo general.
   * *Acción:* Modificar el botón para requerir una pulsación larga de 3 segundos (utilizando un temporizador circular).

---

## 4. Botones Simulados a Marcar como "En Preparación"

Para mantener la transparencia con el personal escolar durante el piloto, los siguientes controles deben mostrarse desactivados y etiquetados honestamente como "Próxima Actualización":

1. **Notificar Tutor (`DashboardPrefectura.tsx`):**
   * *Estado actual:* Muestra un éxito ficticio de envío por WhatsApp/SMS.
   * *Acción:* Modificar el botón para que esté deshabilitado con la etiqueta `Notificar Tutor (Próximamente)` hasta que la API de Twilio/WhatsApp esté contratada.
2. **Supervisar vencidos (`DashboardDireccion.tsx`):**
   * *Estado actual:* Muestra un toast genérico.
   * *Acción:* Deshabilitar o etiquetar como control de filtro futuro.

---

## 5. Botones que Requieren `logAudit` Obligatorio

En una institución educativa pública mexicana, cada alteración del estatus de un expediente es sujeto de escrutinio legal. Estos botones **deben** registrar un registro en `auditoria`:

1. **Confirmar distribución inteligente (`DashboardSecretaria.tsx`):** Debe auditarse quién importó el lote de alumnos y la distribución de grupos resultante.
2. **Confirmar atención (`DashboardDireccion.tsx` / `DashboardOrientacion.tsx`):** Debe registrar qué funcionario atendió una incidencia crítica.
3. **Creación de planes de intervención (`DashboardOrientacion.tsx`):** Debe quedar registrado el responsable clínico del plan pedagógico sugerido.
4. **Devolución de caso a Orientación (`DashboardTrabajoSocial.tsx`):** Debe registrarse el cambio de custodia de la trayectoria del caso.

---

## 6. Botones que Requieren Confirmación Humana Obligatoria

Barrera intermedia que prevenga errores de pulsación y valide que el operador tiene el rol adecuado:

1. **Ejecutar Promoción de Ciclo (`CierreCiclo.tsx`):** 
   * * UX sugerido:* Checkbox: *"Entiendo que esta acción es permanente, cerrará el ciclo actual e inscribirá a los alumnos promovidos en el nuevo periodo académico de manera irreversible."* + Campo de confirmación con contraseña del usuario activo.
2. **Escalamiento Directivo (`DashboardDocente.tsx` / `DashboardPrefectura.tsx`):**
   * *UX sugerido:* Modal: *"¿Estás seguro de que deseas enviar este caso a Dirección General? Esta acción notificará de inmediato a la jefatura de SASE y registrará un antecedente crítico en el expediente integral."*
3. **Derivación a Trabajo Social (`DashboardOrientacion.tsx`):**
   * *UX sugerido:* Modal que solicite la justificación del traslado del caso para obligar a detallar el motivo de la intervención domiciliaria.

---

## 7. Botones que Requieren Controladores de Carga (Loading / Error Handling)

Para prevenir la creación involuntaria de registros y condiciones de carrera de red:

1. **"Guardar reporte" (`IncidentQuickForm.tsx`):** Deshabilitar el botón de envío tan pronto se hace clic, reemplazando el texto por "Guardando..." y controlando las excepciones de Supabase (por ejemplo, bloqueos de RLS).
2. **"onOpenStudentCase" (`DashboardOrientacion.tsx`):** Evitar que la pulsación repetida invoque múltiples RPCs de apertura en paralelo.
3. **"Registrar Entrada / Salida" (`DashboardPrefectura.tsx`):** Bloquear el botón del alumno específico por 3 segundos tras registrar la asistencia para evitar marcajes dobles accidentales en horas pico.

---

## 8. Archivos Prioritarios para Fase 2

Para avanzar de forma estructurada en la Fase 2 (Refactorización y Conexión), se priorizarán estos archivos:

1. **`src/components/dashboards/DashboardTrabajoSocial.tsx` (Urgencia Máxima):** Sustituir todo el mock-state local por persistencia real en Supabase para evitar fugas de información.
2. **`src/components/core/SOSButton.tsx`:** Implementar la lógica del botón interactivo con retardo físico (Hold trigger).
3. **`src/components/docente/IncidentQuickForm.tsx`:** Introducir estado `isSubmitting` y bloqueo contra doble clic.
4. **`src/components/CierreCiclo.tsx`:** Robustezer la pantalla de Cierre de Ciclo con doble factor de confirmación institucional para la ejecución.

---
*Fin del Documento de Auditoría.*
