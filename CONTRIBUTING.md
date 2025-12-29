# Protocolo de Códificación para IA (Soporte Supabase)

> **⚠️ INSTRUCCIONES CRÍTICAS PARA EL AGENTE (Jules/Gemini):**
> Este proyecto utiliza **Supabase** como Backend-as-a-Service.
> NO trates este proyecto como una aplicación tradicional con base de datos local.

### 1. Stack Tecnológico & Seguridad

- **Frontend:** React (Vite) + TypeScript + Tailwind CSS.
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage).
- **Librería Cliente:** Usa estrictamente `@supabase/supabase-js` (v2).
- **Seguridad (RLS):** NUNCA intentes saltarte las Row Level Security.
  - Usa siempre la `ANON_KEY` en el cliente.
  - Si necesitas privilegios administrativos, pide confirmación para usar una Edge Function o script SQL.

### 2. Manejo de Base de Datos

- **No inventes tablas:** Consulta `types.ts` o `supabase/types.ts` para ver la estructura.
- **Cambios de Esquema:** Si necesitas crear tablas o columnas:
  - Genera un archivo `.sql` en `supabase/migrations/`.
  - NO intentes ejecutar comandos DDL desde el código cliente (React).
- **Tipos TypeScript:**
  - Preferimos los tipos generados automáticamente.
  - Si añades una tabla, recuerda al usuario correr:
    `npx supabase gen types typescript --project-id "tu-id" > supabase/types.ts`

### 3. Flujo de Trabajo (Frontend)

- Usa **Hooks** para la interacción de datos.
- Para datos en tiempo real (Chat, Notificaciones), usa `supabase.channel().on(...)`.
- Maneja los errores de Supabase explícitamente (`if (error) throw error;`).

---

**Ejemplo de Prompt Correcto:**

> "Crea un hook `useIncidents` que se suscriba a los cambios en la tabla 'incidents' para el alumno actual."

**Ejemplo de Prompt Incorrecto:**

> "Crea una base de datos SQLite local para guardar las incidencias." (PROHIBIDO)
