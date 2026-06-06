# Runbook de Pruebas: Prevención de Autoescalamiento de Roles

Este documento detalla la auditoría de seguridad y las pruebas para verificar que los usuarios autenticados no puedan realizar autoescalamiento de roles, permisos o alcances en la base de datos de SASE.

## Casos de Prueba

### Caso 1: Actualización de `rol` en `perfiles_usuario` (Debe fallar)
* **Actor:** Usuario autenticado (ej: docente).
* **Acción:** Intentar cambiar su rol a `admin` o `directivo`.
* **Comando SQL de prueba:**
  ```sql
  -- Simular rol 'docente' con ID de prueba
  SET local role authenticated;
  SET local request.jwt.claim.sub = 'user-uuid-here';
  
  -- Intentar actualizar
  UPDATE public.perfiles_usuario 
  SET rol = 'admin' 
  WHERE id = 'user-uuid-here';
  -- Resultado esperado: Violación de política RLS o 0 filas afectadas.
  ```

### Caso 2: Actualización de `permisos` en `perfiles_usuario` (Debe fallar)
* **Actor:** Usuario autenticado.
* **Acción:** Intentar cambiar el JSONB de `permisos`.
* **Comando SQL de prueba:**
  ```sql
  UPDATE public.perfiles_usuario 
  SET permisos = '{"all": true}'::jsonb 
  WHERE id = 'user-uuid-here';
  -- Resultado esperado: Bloqueado por RLS.
  ```

### Caso 3: Actualización de `alcances` en `perfiles_usuario` (Debe fallar)
* **Actor:** Usuario autenticado.
* **Acción:** Intentar cambiar el JSONB de `alcances`.
* **Comando SQL de prueba:**
  ```sql
  UPDATE public.perfiles_usuario 
  SET alcances = '{"global": true}'::jsonb 
  WHERE id = 'user-uuid-here';
  -- Resultado esperado: Bloqueado por RLS.
  ```

### Caso 4: Actualización de `role` en `profiles` (Debe fallar)
* **Actor:** Usuario autenticado.
* **Acción:** Intentar cambiar `role` en la tabla legacy `profiles`.
* **Comando SQL de prueba:**
  ```sql
  UPDATE public.profiles 
  SET role = 'directivo'::app_role 
  WHERE id = 'user-uuid-here';
  -- Resultado esperado: Bloqueado por RLS.
  ```

### Caso 5: Lectura de perfil (Debe permitirse)
* **Actor:** Usuario autenticado.
* **Acción:** El AuthProvider inicia sesión y lee el rol y datos del perfil mediante `SELECT`.
* **Resultado esperado:** Éxito. Lectura de su propio perfil completamente habilitada.

### Caso 6: Modificación por servicio administrativo (Debe permitirse)
* **Actor:** Servidor / Edge Functions usando `service_role`.
* **Acción:** Crear o aprobar personal modificando roles/permisos.
* **Resultado esperado:** Éxito. El token `service_role` evade RLS por completo.
