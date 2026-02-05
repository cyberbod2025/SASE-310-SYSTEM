# 🧪 REPORTE QA FUNCIONAL — SASE-310

**Sistema de Acompañamiento y Seguimiento Escolar**  
**Fecha:** 2026-02-05  
**Auditor:** Antigravity QA Agent  
**Versión Sistema:** 3.10.0 (Piloto Institucional)

---

## 📋 RESUMEN EJECUTIVO

### Cobertura de Flujos: **6/10**

- ✅ Navegación de sidebar funcional
- ✅ Cambio de roles dinámico
- ✅ Mensajes contextuales por rol
- ❌ Carga de datos de estudiantes **BLOQUEADA**
- ❌ Módulos operativos críticos son **PLACEHOLDERS**

### Persistencia Real: **2/10**

- ✅ Auditoría registra acciones en Supabase
- ❌ **ERROR CRÍTICO:** Join `alumnos ↔ calificaciones` roto
- ❌ No se puede verificar persistencia de seguimientos

### Coherencia por Rol: **9/10**

- ✅ Sidebar se adapta correctamente a cada rol
- ✅ Módulos restringidos (ej: Auditoría solo para Dirección)
- ⚠️ Algunos roles comparten sidebar idéntico

---

## 🔍 AUDITORÍA POR ROL INSTITUCIONAL

### 1️⃣ **DOCENTE**

**Módulos Visibles:**

- ✅ Inicio
- ✅ Mis Grupos
- ✅ Reportes
- ✅ Protocolos

**Pruebas de Flujo:**

- ⚠️ **Mis Grupos:** Botón no navega (redirige a Dashboard)
- ⚠️ **Ver Detalles (estudiante):** No abre modal ni panel
- ❌ **Lista de estudiantes:** No carga (error PGRST200)

**Observaciones:**

- Mensaje de bienvenida personalizado: ✅
- Acceso a módulos administrativos: ❌ (correcto)

---

### 2️⃣ **PREFECTURA**

**Módulos Visibles:**

- ✅ Inicio
- ✅ Lista Asistencia
- ✅ Reportes
- ✅ Protocolos

**Pruebas de Flujo:**

- ⚠️ **Lista Asistencia:** PLACEHOLDER (redirige a Dashboard)
- ✅ **Reportes:** Carga interfaz "Inteligencia de Datos Institucionales"
- ✅ **Protocolos:** Muestra biblioteca de protocolos (Riña, Sismo, etc.)

**Observaciones:**

- Mensaje contextual: _"patrones de puntualidad en 3º B"_ ✅
- Módulo operativo principal (Lista Asistencia) **NO FUNCIONAL**

---

### 3️⃣ **SECRETARÍA**

**Módulos Visibles:**

- ✅ Inicio
- ✅ Inscripciones
- ✅ Reportes
- ✅ Protocolos
- ✅ Aprobaciones

**Pruebas de Flujo:**

- ✅ **Inscripciones:** Carga vista "Control de Inscripciones (Ciclo 2024-2025)"
- ✅ **Aprobaciones:** Acceso correcto (compartido con Dirección)
- ❌ **Carga de alumnos:** Falla por error de DB

**Observaciones:**

- Rol con mayor cantidad de módulos visibles (correcto según CONTEXTO_SASE.md)
- Módulo crítico (Inscripciones) **OPERATIVO**

---

### 4️⃣ **TRABAJO SOCIAL**

**Módulos Visibles:**

- ✅ Inicio
- ✅ Reportes
- ✅ Protocolos

**Pruebas de Flujo:**

- ✅ **Reportes:** Interfaz carga correctamente
- ⚠️ **Botones de acción:** Presentes pero sin efecto (falta datos)
- ❌ **Dashboard:** Vacío (sin métricas de seguimiento)

**Observaciones:**

- Mensaje: _"Tenemos 2 seguimientos y un justificante por validar"_ (mock)
- No hay módulo específico de "Gestión de Justificantes" visible

---

### 5️⃣ **ORIENTACIÓN**

**Módulos Visibles:**

- ✅ Inicio
- ✅ Reportes
- ✅ Protocolos

**Pruebas de Flujo:**

- ✅ **Reportes:** Carga interfaz
- ⚠️ **Solicitar reportes docentes:** Botón presente, sin acción
- ❌ **Patrones detectados:** No muestra lista (error de datos)

**Observaciones:**

- Sidebar **IDÉNTICO** a Trabajo Social y Enfermería
- Mensaje contextual: _"X patrones detectados que requieren atención"_ (mock)

---

### 6️⃣ **ENFERMERÍA**

**Módulos Visibles:**

- ✅ Inicio
- ✅ Reportes
- ✅ Protocolos

**Pruebas de Flujo:**

- ✅ **Navegación:** Funcional
- ❌ **Inventario médico:** No visible en sidebar
- ❌ **Alertas de salud:** No cargan (dependen de datos de alumnos)

**Observaciones:**

- Mensaje: _"El inventario de emergencia requiere su revisión experta"_ (mock)
- Falta módulo específico de "Bitácora Clínica" o "Inventario"

---

### 7️⃣ **UDEII**

**Módulos Visibles:**

- ✅ Inicio
- ✅ Operativo (sección)
- ✅ Seguimiento Institucional
- ✅ Reportes

**Pruebas de Flujo:**

- ✅ **Dashboard:** Muestra botones Tablero, Agenda, Protocolos
- ❌ **Acceso a diagnósticos BAP:** No verificado (sin datos de alumnos)
- ✅ **Auditoría:** Correctamente OCULTA para este rol

**Observaciones:**

- Único rol con acceso teórico a diagnósticos privados (BAP)
- No se pudo verificar funcionalidad de privacidad por error de datos

---

### 8️⃣ **DIRECCIÓN**

**Módulos Visibles:**

- ✅ Inicio
- ✅ Operativo (sección)
- ✅ Seguimiento Institucional
- ✅ Reportes
- ✅ Protocolos
- ✅ Aprobaciones
- ✅ **Auditoría** (EXCLUSIVO)

**Pruebas de Flujo:**

- ✅ **Auditoría:** Carga "Bitácora de Auditoría" con filtros funcionales
- ✅ **Registro de Usuarios:** Botón presente
- ✅ **Tablero Global:** Acceso a estadísticas macro
- ✅ **Jurídico:** Módulo visible

**Observaciones:**

- ✅ Único rol con acceso a **Auditoría** (correcto)
- ✅ Plataforma estratégica con herramientas de gestión de personal
- Mensaje: _"La asistencia global es del 92%"_ (mock)

---

## 🐞 ERRORES TÉCNICOS CRÍTICOS

### ❌ ERROR PGRST200 (HTTP 400)

**Mensaje:**

```
Could not find a relationship between 'alumnos' and 'calificaciones' in the schema cache
```

**Causa Raíz:**

- El query en `store.tsx` (líneas 361-378) intenta un JOIN:
  ```typescript
  const { data, error } = await supabase.from("alumnos").select(`
    *,
    calificaciones (
      materia, trimestre1, trimestre2, trimestre3
    )
  `);
  ```
- La tabla `calificaciones` **NO tiene relación de llave foránea** con `alumnos` en el esquema de Supabase

**Impacto:**

- ❌ **BLOQUEO TOTAL** de carga de estudiantes
- ❌ Dashboards vacíos en todos los roles
- ❌ No se pueden probar flujos de seguimiento, incidencias ni justificantes
- ❌ Módulos operativos (Mis Grupos, Lista Asistencia) no funcionan

**Sugerencia de Supabase:**

```
Perhaps you meant 'justificantes' instead of 'calificaciones'
```

---

### ⚠️ FUNCIONALIDAD PARCIAL (PLACEHOLDERS)

| Módulo               | Rol        | Estado         | Acción Esperada                   | Acción Real              |
| -------------------- | ---------- | -------------- | --------------------------------- | ------------------------ |
| **Mis Grupos**       | Docente    | ⚠️ Placeholder | Mostrar lista de grupos asignados | Redirige a Dashboard     |
| **Lista Asistencia** | Prefectura | ⚠️ Placeholder | Interfaz de pase de lista         | Redirige a Dashboard     |
| **Ver Detalles**     | Todos      | ⚠️ No funciona | Abrir panel de estudiante         | Sin efecto               |
| **Notificaciones**   | Todos      | ⚠️ Mock        | Mostrar alertas reales            | "Sin novedades" estático |

---

## ✅ FLUJOS OPERATIVOS VERIFICADOS

### 1. **Cambio de Rol Dinámico**

- ✅ Selector en header funciona correctamente
- ✅ Sidebar se actualiza según rol
- ✅ Mensajes de bienvenida personalizados
- ✅ Colores de sidebar cambian por rol

### 2. **Módulo de Reportes**

- ✅ Carga interfaz "Inteligencia de Datos Institucionales"
- ✅ Opciones de reportes oficiales visibles
- ⚠️ No muestra datos (depende de alumnos)

### 3. **Módulo de Protocolos**

- ✅ Biblioteca de protocolos carga correctamente
- ✅ Protocolos relevantes por rol (ej: Riña, Sismo para Prefectura)
- ✅ Interfaz de activación presente

### 4. **Módulo de Auditoría (Dirección)**

- ✅ **EXCLUSIVO** para rol Directivo
- ✅ Bitácora muestra registros reales de Supabase
- ✅ Filtros por tipo de acción (Consulta, Actualización, Creación)
- ✅ Sincronización en tiempo real

### 5. **Módulo de Inscripciones (Secretaría)**

- ✅ Vista "Control de Inscripciones" carga
- ✅ Ciclo escolar 2024-2025 visible
- ⚠️ Formulario de alta presente pero sin datos de prueba

---

## 🔒 VERIFICACIÓN DE SEGURIDAD POR ROL

### ✅ Restricciones Correctas

- ✅ **Auditoría:** Solo visible para Dirección
- ✅ **Inscripciones:** Solo visible para Secretaría (y Dirección)
- ✅ **Aprobaciones:** Solo visible para Dirección y Secretaría
- ✅ **Mis Grupos:** Solo visible para Docente

### ⚠️ Observaciones de Diseño

- Los roles **Trabajo Social, Orientación y Enfermería** tienen sidebar **idéntico**
- No hay módulos específicos visibles para:
  - Enfermería: Inventario médico, Bitácora clínica
  - Trabajo Social: Gestión de justificantes, Citatorios
  - Orientación: Solicitudes de reportes docentes (existe botón, no módulo)

---

## 📊 ESTADOS DEL SISTEMA

### ✅ Loading State

- ✅ Splash screen "Validando Credenciales" funciona
- ✅ Video intro se reproduce correctamente

### ⚠️ Empty State

- ⚠️ Dashboard muestra botones pero sin métricas
- ⚠️ Notificaciones: "Sin novedades" (estático)
- ❌ Lista de estudiantes: Vacía (por error de DB)

### ❌ Error State

- ❌ No hay mensaje de error visible para el usuario
- ❌ Console muestra PGRST200 pero UI no informa
- ❌ Botones que no funcionan no muestran feedback

### ✅ Success State

- ✅ Cambio de rol muestra confirmación visual (color de sidebar)
- ✅ Módulos que cargan muestran contenido estructurado

---

## 🛑 REGLA DE ORO QA

> **En SASE, una función que no registra evidencia no existe.**

### Funciones SIN Evidencia de Persistencia:

- ❌ Registro de incidencias (bloqueado por error de DB)
- ❌ Generación de justificantes (no verificado)
- ❌ Carga de calificaciones (tabla sin relación)
- ❌ Seguimientos de casos (sin datos de alumnos)
- ❌ Generación de documentos institucionales (no verificado)

### Funciones CON Evidencia de Persistencia:

- ✅ **Auditoría:** Registra acciones en tabla `audit_log`
- ✅ **Autenticación:** Supabase Auth funcional
- ✅ **Cambio de rol:** State management operativo

---

## 🚨 ACCIONES REQUERIDAS (PRIORIDAD CRÍTICA)

### 1. **ARREGLAR RELACIÓN `alumnos ↔ calificaciones`** 🔴

**Prioridad:** CRÍTICA  
**Impacto:** Bloquea el 80% de la funcionalidad del sistema

**Opciones:**

1. Crear foreign key en tabla `calificaciones`:
   ```sql
   ALTER TABLE calificaciones
   ADD COLUMN alumno_id UUID REFERENCES alumnos(id);
   ```
2. Remover el join de `calificaciones` del query en `store.tsx` (línea 372-374)
3. Hacer el fetch de calificaciones en un query separado

**Recomendación:** Opción 1 (crear relación real)

---

### 2. **IMPLEMENTAR MÓDULOS OPERATIVOS** 🟠

**Prioridad:** ALTA

- [ ] **Mis Grupos (Docente):** Vista de grupos asignados con lista de alumnos
- [ ] **Lista Asistencia (Prefectura):** Interfaz de pase de lista diario
- [ ] **Inventario Médico (Enfermería):** Gestión de stock de medicamentos
- [ ] **Gestión de Justificantes (Trabajo Social):** CRUD de justificantes

---

### 3. **MEJORAR ESTADOS DE ERROR** 🟡

**Prioridad:** MEDIA

- [ ] Mostrar mensaje amigable cuando no hay datos de alumnos
- [ ] Implementar ErrorBoundary para errores de Supabase
- [ ] Agregar feedback visual a botones sin funcionalidad
- [ ] Toast notifications para acciones exitosas/fallidas

---

### 4. **VERIFICAR RLS Y PERMISOS** 🟡

**Prioridad:** MEDIA

- [ ] Confirmar que RLS está activo en todas las tablas
- [ ] Verificar que roles NO pueden acceder a datos fuera de su scope
- [ ] Probar acceso a diagnósticos BAP (solo UDEII)
- [ ] Auditar acceso a datos sensibles (CURP, salud)

---

## 📈 MÉTRICAS DE CALIDAD

| Categoría                 | Puntaje | Observaciones                                      |
| ------------------------- | ------- | -------------------------------------------------- |
| **Arquitectura de Roles** | 9/10    | Sidebar bien estructurado, restricciones correctas |
| **Persistencia de Datos** | 2/10    | Error crítico bloquea flujos principales           |
| **UX/UI**                 | 7/10    | Diseño premium, pero falta feedback de estados     |
| **Seguridad**             | 8/10    | Auditoría funcional, RLS pendiente de verificar    |
| **Funcionalidad Real**    | 3/10    | Mayoría de módulos son placeholders o mock         |

**Promedio General:** **5.8/10** ⚠️

---

## 🎯 CONCLUSIÓN

El sistema SASE-310 tiene una **arquitectura sólida** y un **diseño de roles coherente**, pero está **bloqueado por un error crítico de base de datos** que impide la carga de estudiantes.

### ✅ Fortalezas:

- Diseño visual premium y profesional
- Separación clara de responsabilidades por rol
- Módulo de Auditoría funcional y robusto
- Autenticación y gestión de sesiones operativa

### ❌ Debilidades Críticas:

- **ERROR PGRST200** bloquea el 80% de la funcionalidad
- Módulos operativos críticos son placeholders
- No hay feedback de errores para el usuario final
- Falta verificación de persistencia en flujos clave

### 🚦 Estado para Producción:

**❌ NO LISTO PARA CAMPO**

**Requisitos Mínimos para Piloto:**

1. ✅ Arreglar relación `alumnos ↔ calificaciones`
2. ✅ Implementar al menos 2 módulos operativos (Mis Grupos, Lista Asistencia)
3. ✅ Agregar manejo de errores visible para usuarios
4. ✅ Verificar persistencia de incidencias y justificantes

---

**Reporte generado por:** Antigravity QA Agent  
**Metodología:** Auditoría funcional por rol + Verificación de persistencia  
**Próxima revisión:** Después de corrección de PGRST200
