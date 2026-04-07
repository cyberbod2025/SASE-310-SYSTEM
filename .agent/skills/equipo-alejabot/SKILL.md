---
name: equipo-alejabot
description: Coordinación de un equipo de agentes inteligentes (Director, Arquitecto, Especialista, Marketer, Investigador, Revisor) para trabajo en paralelo.
---

# Skill: Equipo Alejabot (Multi-Agente)

Esta habilidad permite a Antigravity coordinar un equipo de agentes inteligentes trabajando en paralelo sobre el mismo proyecto, replicando la funcionalidad de "Agent Teams" de Claude Code.

## Configuración del Entorno
El equipo utiliza una carpeta oculta en la raíz del proyecto para comunicarse:
- `.antigravity/team/tasks.json` -> Lista maestra de tareas, estados y dependencias.
- `.antigravity/team/mailbox/` -> Mensajes individuales (.msg).
- `.antigravity/team/broadcast.msg` -> Mensajes globales para todo el equipo.
- `.antigravity/team/locks/` -> Semáforos para evitar edición simultánea de archivos.

## Roles del Equipo
1. **Director (Alejabot)**: El líder. Divide el problema, asigna roles y aprueba planes.
2. **Arquitecto**: Define la estructura y patrones antes de codificar.
3. **Especialista (Frontend/Backend/DB)**: Ejecuta tareas técnicas específicas.
4. **Marketer**: Creación de marca, logos, copywriting y diseño de landing pages.
5. **Investigador**: Búsqueda de información, documentación y análisis de mercado.
6. **Revisor (Devil's Advocate)**: Busca fallos, bugs y problemas de seguridad.

## Protocolo de Orquestación Avanzada

### 1. Modo de Planificación (Gatekeeping)
Antes de realizar cambios significativos, cada agente debe enviar un **Plan de Acción** al buzón de Alejabot.
- El agente se mantiene en modo `READ_ONLY` o `PLANNING` hasta que Alejabot responda con un mensaje de `APPROVED`.

### 2. Mensajería y Difusión (Broadcast)
- **Mensaje Directo**: Coordinación 1 a 1 entre especialistas.
- **Broadcast**: Alejabot puede escribir en `broadcast.msg` para dar instrucciones generales al equipo.
