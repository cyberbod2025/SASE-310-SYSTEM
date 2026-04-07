# 📄 CONTEXTO_SASE.md

## Fuente de Verdad del Sistema SASE-310

Este documento define qué es SASE-310, para qué existe y cómo debe comportarse cuando esté al 100%.
**Cualquier decisión técnica, de diseño o de IA debe alinearse con este archivo.**

### 1. Misión del Sistema

SASE-310 (Sistema de Acompañamiento y Seguimiento Escolar) es la infraestructura digital central de la **Escuela Secundaria Diurna No. 310 “Presidentes de México”**.

Su misión es transformar la gestión escolar reactiva en una **estrategia preventiva, humana y pedagógica**, asegurando que ningún alumno pase desapercibido ante riesgos académicos, conductuales, emocionales o de salud.

> _SASE no existe para castigar. SASE existe para detectar, acompañar, dar seguimiento y documentar._

---

### 2. Principios Rectores (Cómo piensa SASE)

- **Acompañamiento** antes que sanción.
- **Seguimiento** antes que olvido.
- **Evidencia** antes que opinión.
- **Prevención** antes que crisis.
- **Humanidad** antes que burocracia.

> **“SASE acompaña procesos, no persigue errores.”**

---

### 3. Pilares Tecnológicos (State-of-the-Art con sentido)

🟢 **Backend Proactivo — Supabase**

- Almacena datos reales y persistentes.
- Aplica **Row Level Security (RLS)** como principio innegociable.
- Mantiene auditoría inalterable de accesos y acciones sensibles.
- Distingue roles institucionales con precisión quirúrgica.

🔵 **Frontend Cinemático — React + Vite**

- Interfaz premium (**Glassmorphism**) para dignificar el entorno laboral.
- Arquitectura diseñada para reducir la carga cognitiva del personal.
- Enfoque **Desktop-First** para uso institucional intensivo.

🟣 **Inteligencia de Acompañamiento — IA Contextual**

- Analiza datos en tiempo real para detectar lo que el ojo humano olvida.
- Sugiere acciones basadas en normativa, nunca las impone.
- Se comporta como un **Copiloto Institucional**, no como un juez.

---

### 4. Diccionario de Roles y Promesa de Valor

Cada perfil aporta una pieza única al cuidado del alumno:

- **Dirección:** Visión macro, decisiones estratégicas y gestión de personal.
- **Prefectura:** Primera línea operativa (patio, retardos, uniformes).
- **Docente:** Sensor académico y acompañante del aprendizaje diario.
- **Secretaría:** Guardián de la integridad documental (CURP, expedientes).
- **Trabajo Social / Orientación:** Analistas humanos, contención y crisis.
- **Enfermería:** Especialista en salud y bitácora clínica de emergencia.
- **UDEII:** Especialista en inclusión y barreras para el aprendizaje (BAP).

---

### 5. Motor de Escalación (Lógica Central)

SASE opera bajo la detección de **patrones**, no por eventos aislados:

1.  **Observación (1–2 incidencias):** Registro silencioso para historial.
2.  **Patrón Detectado (3 incidencias):** Notificación automática a especialistas.
3.  **Intervención (4+ incidencias):** Generación automática de Actas, Citatorios y Minutas con trazabilidad total.

---

### 6. El "Eje de Oro": Atención a Padres

El sistema garantiza que la comunicación con la familia sea profesional y documentada:

- Validación de horarios de servicio para citas.
- Generación automática de minutas con acuerdos vinculantes.
- Programación de seguimientos automáticos (semanal/mensual).
- _Lo que no se documenta, se olvida. SASE existe para que no se olvide nada._

---

### 7. Seguridad, Ética y Privacidad

- **Auditoría Total:** Todo acceso a datos sensibles (CURP, salud) se registra (Usuario + Tiempo).
- **Privacidad por Diseño:** Solo los roles autorizados ven diagnósticos; el resto recibe "Alertas de Cuidado".
- **Marco Normativo:** Alineado con la **Nueva Escuela Mexicana (NEM)** y los Protocolos de Convivencia Escolar.

---

### 8. Rol de la Inteligencia Artificial (Límites Éticos)

La IA en SASE:

- ❌ **No** toma decisiones finales, **no** sanciona y **no** sustituye al humano.
- ✅ **Observa**, **detecta patrones**, **sugiere** y **acompaña**.

---

### 9. Checklist de “Listo para Campo” (Producción)

1. Cero errores 400 en consola (Integridad de DB).
2. Datos reales persistidos en Supabase (sin mocks).
3. Generación de PDFs institucionales operativa.
4. Notificaciones entre roles en tiempo real.
5. Seguimientos visibles y trazables.
6. IA contextual operando con datos del contexto escolar real.

---

### 10. Regla Suprema

**Si una decisión técnica o de diseño contradice este documento, la decisión es incorrecta.**
