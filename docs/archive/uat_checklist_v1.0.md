# Checklist de Pruebas de Usuario (UAT) — SASE v1.0

**Versión:** `v1.0-alertas-riesgo`

Este documento detalla los puntos críticos que deben ser validados por el equipo directivo y técnico para asegurar la estabilidad operativa del Sistema de Alertas de Riesgo.

## 1. Dashboard de Dirección

- [ ] **Visibilidad del Widget**: ¿El widget "Sistema de Alertas de Riesgo" aparece correctamente en el grid?
- [ ] **Clasificación por Colores**: ¿Los alumnos con Alerta Crítica aparecen en Rojo/Rose? ¿Media en Ámbar?
- [ ] **Ordenamiento**: ¿Los alumnos con mayor número de incidencias aparecen al principio de la lista?
- [ ] **Interactividad**: ¿Al pasar el mouse (hover) se activan los efectos visuales premium?

## 2. Expediente Integral del Alumno

- [ ] **Consolidación de Datos**: ¿El conteo de incidencias coincide con la tabla operativa?
- [ ] **Datos de Salud**: ¿Se muestran correctamente las atenciones médicas (si existen)?
- [ ] **Vínculo de Gamificación**: ¿Aparecen los puntos y el nickname de "Islas del Saber" en el expediente?
- [ ] **Integridad**: ¿Alumnos sin registros en ciertos módulos aparecen con "0" en lugar de errores?

## 3. Vista de Riesgo (`alumnos_en_riesgo`)

- [ ] **Filtro Automático**: ¿Están excluidos correctamente los alumnos con incidencias < 3 y sin seguimiento social/BAP?
- [ ] **Lógica de Alerta**: ¿Un alumno con 5 incidencias tiene asignado el nivel `ALERTA_CRITICA`?
- [ ] **Seguimiento Social**: ¿Los alumnos con registros en Trabajo Social se marcan automáticamente?

## 4. Integración con Matrix de Decisión

- [ ] **Carga de Caso**: ¿Al hacer clic en el botón de "Acción/Ojo" del widget de alertas, se carga el nombre del alumno en la Matrix?
- [ ] **Protocolos**: ¿Al hacer clic en "Ver Protocolo", el sistema redirige correctamente al módulo de protocolos?
- [ ] **Limpieza de Selección**: ¿El botón "Cerrar Vista" de la Matrix limpia la selección actual?

## 5. Sincronización en Tiempo Real (Supabase)

- [ ] **Carga Inicial**: ¿Los datos se cargan en menos de 2 segundos al entrar al dashboard?
- [ ] **Persistencia**: ¿Los cambios realizados en los módulos operativos se reflejan en las vistas de alerta?

---

SASE - Fase de Control de Calidad Institucional
