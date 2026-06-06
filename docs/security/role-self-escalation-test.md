# Prueba Manual: Prevención de Autoescalamiento de Roles

**Migración:** `20260606150001_prevent_role_self_escalation.sql`
**Fecha:** 2026-06-06
**Tester:**

---

## Prerrequisitos

1. Tener dos cuentas:
   - **Usuario A**: rol `docente` / `docente_tutor`
   - **Usuario B**: rol `directivo` / `system_admin` (cuenta de administración)
2. Conocer el `id` de ambas cuentas (UUID de `auth.users`).
3. Tener acceso a `supabase` SQL Editor (o psql) con `service_role` para verificar datos.
4. Tener acceso autenticado desde la aplicación (frontend) para las pruebas de interfaz.

---

## Caso 1: Usuario normal intenta actualizar su propio rol

### Desde SQL Editor (simula cliente autenticado)

```sql
-- Autenticarse como Usuario A (docente)
-- Esto debe FALLAR con error "new row violates row-level security policy"
UPDATE public.perfiles_usuario
SET rol = 'system_admin'
WHERE id = '<uuid-usuario-a>';
```

**Resultado esperado:** `ERROR: new row violates row-level security policy`

### Desde la aplicación frontend

1. Inicia sesión como Usuario A.
2. Abre la consola del navegador (F12 → Network).
3. Ejecuta desde la consola:
   ```js
   const { data, error } = await supabase
     .from('perfiles_usuario')
     .update({ rol: 'system_admin' })
     .eq('id', supabase.auth.user().id);
   console.log('Error:', error);
   ```
4. **Resultado esperado:** `error` no es nulo, `data` es nulo.

---

## Caso 2: Usuario normal intenta actualizar sus permisos

```sql
UPDATE public.perfiles_usuario
SET permisos = '{"can_approve_staff": true}'
WHERE id = '<uuid-usuario-a>';
```

**Resultado esperado:** `ERROR: new row violates row-level security policy`

---

## Caso 3: Usuario normal intenta actualizar sus alcances

```sql
UPDATE public.perfiles_usuario
SET alcances = '{"can_view_audit": true}'
WHERE id = '<uuid-usuario-a>';
```

**Resultado esperado:** `ERROR: new row violates row-level security policy`

---

## Caso 4: AuthProvider sigue pudiendo leer el rol

```sql
-- Simula SELECT que hace AuthProvider
SELECT id, rol, permisos, alcances
FROM public.perfiles_usuario
WHERE id = '<uuid-usuario-a>';
```

**Resultado esperado:** Debe devolver la fila completa sin error.

Desde la app: Inicia sesión como Usuario A y verifica que la app carga correctamente y muestra el dashboard correspondiente a `docente`.

---

## Caso 5: Usuario administrativo autorizado gestiona roles (flujo permitido)

Los roles sensibles deben actualizarse SOLO mediante Edge Functions que usan `service_role` (bypassean RLS):

```sql
-- Esto solo funciona con service_role, no desde cliente
UPDATE public.perfiles_usuario
SET rol = 'directivo'
WHERE id = '<uuid-usuario-b>';
```

**Resultado esperado:** Con `service_role`: exitoso. Desde cliente: error RLS.

---

## Caso 6: Usuario normal actualiza campos permitidos

```sql
-- Esto DEBE funcionar (campos no protegidos)
UPDATE public.perfiles_usuario
SET nombre_completo = 'Nuevo Nombre',
    telefono = '5512345678',
    preferencias_dashboard = '{"avatar_url": "https://..."}'
WHERE id = '<uuid-usuario-a>';
```

**Resultado esperado:** Éxito. Verificar con SELECT que los cambios persisten.

---

## Caso 7: Profiles — usuario normal no puede cambiar su role

```sql
UPDATE public.profiles
SET role = 'directivo'
WHERE id = '<uuid-usuario-a>';
```

**Resultado esperado:** `ERROR: new row violates row-level security policy`

```sql
-- Sí debe poder actualizar full_name
UPDATE public.profiles
SET full_name = 'Nombre Visible'
WHERE id = '<uuid-usuario-a>';
```

**Resultado esperado:** Éxito.

---

## Verificación post-prueba

```sql
-- Restaurar datos originales si es necesario
-- (solo con service_role)
```

## Checklist

- [ ] Caso 1: rol propio bloqueado
- [ ] Caso 2: permisos propios bloqueados
- [ ] Caso 3: alcances propios bloqueados
- [ ] Caso 4: SELECT de AuthProvider funciona
- [ ] Caso 5: service_role aún puede gestionar roles
- [ ] Caso 6: campos permitidos (nombre, teléfono) sí se actualizan
- [ ] Caso 7: profiles.role bloqueado
