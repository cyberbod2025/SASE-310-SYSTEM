# Especificación 010 — Memoria institucional UDEII / BAP

Estado: Implementado; validación de base local pendiente por ausencia de Docker

## Problema

El tablero UDEII muestra el resumen `alumnos.datos_bap`, pero al registrar un ajuste:

- reemplaza la lista completa de ajustes;
- actualiza la interfaz antes de comprobar la escritura;
- ignora el objeto `error` devuelto por Supabase;
- no registra una secuencia histórica en `seguimiento_bap`;
- no permite iniciar seguimiento para un alumno sin resumen BAP previo;
- presenta una recomendación estadística fija sin evidencia persistida.

Este comportamiento no prueba memoria institucional ni trazabilidad.

## Objetivo

Convertir UDEII en un corte vertical persistente que permita:

1. iniciar o continuar un caso BAP para cualquier alumno visible;
2. registrar detecciones, ajustes, seguimientos y cierres como eventos inmutables;
3. conservar autoría, responsable, observaciones y fecha de revisión;
4. actualizar el resumen vigente de `alumnos.datos_bap` sin borrar ajustes anteriores;
5. consultar el historial por alumno al recargar;
6. negar operaciones sin sesión o rol institucional autorizado;
7. mostrar indicadores calculados únicamente desde información persistida.

## Fuente de verdad

- Resumen vigente: `public.alumnos.datos_bap`.
- Memoria histórica: `public.seguimiento_bap`.
- Identidad y rol: `auth.uid()` + `public.perfiles_usuario`.
- Cliente: `src/lib/supabaseClient.ts`, reexportado por `src/supabase/client.ts`.

## Actores

- Escritura: `udeii` y `system_admin`.
- Lectura: `udeii`, `orientacion`, `directivo`, `subdireccion` y `system_admin`.
- Ningún acceso anónimo.

## Reglas funcionales

- Un evento BAP debe indicar alumno, tipo de evento, barrera, ajuste o acción, estatus y autor.
- El historial es append-only desde el cliente: una corrección genera un nuevo evento.
- Una escritura se considera exitosa únicamente cuando la función transaccional devuelve el evento persistido.
- Los ajustes nuevos se agregan al resumen vigente; no sustituyen silenciosamente los anteriores.
- Los formularios conservan la evidencia capturada cuando Supabase rechaza la operación.
- El tablero no debe afirmar tendencias o porcentajes sin datos persistidos que los sustenten.

## Criterios de aceptación

- El historial se carga desde `seguimiento_bap` y se filtra por los alumnos visibles.
- Registrar un evento inserta historial y actualiza `datos_bap` en una sola transacción.
- RLS y privilegios explícitos protegen la tabla.
- La función transaccional valida sesión, rol y argumentos antes de mutar.
- El tablero permite seleccionar cualquier alumno e iniciar seguimiento.
- Pruebas cubren carga, éxito, denegación y preservación del formulario ante error.
- Lint, type-check, pruebas, build y auditoría de migraciones terminan sin errores críticos.

## Fuera de alcance

- Notificaciones automáticas a familias.
- Exportación masiva de información sensible.
- Diagnóstico clínico o pedagógico generado por IA.
- Adjuntos y evidencia documental.
