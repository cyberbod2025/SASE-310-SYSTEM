# Protocolo de Primer Acceso - Fundadores SASE

Para garantizar el acceso seguro y controlado de los usuarios fundadores (Director, Respaldo/Tú, Dev), se implementará el siguiente flujo:

1.  **Credenciales Provisionales**:
    - **Usuario**: Correo Institucional Registrado.
    - **Contraseña Provisional**: `Sase310.2025!` (o una generada aleatoriamente y enviada por canal seguro).

2.  **Primer Login**:
    - El sistema detectará que es el primer acceso de una cuenta administrativa pre-creada.
3.  **Cambio Obligatorio de Contraseña**:
    - Inmediatamente después de autenticarse, el sistema redirigirá a una pantalla de **"Establecer Nueva Contraseña"**.
    - No podrán navegar a ningún módulo hasta completar este paso.

## Acción Técnica Requerida (Developers)

- [ ] Crear usuarios en `auth.users` de Supabase manualmente o vía script para los 3 fundadores con la contraseña provisional.
- [ ] Configurar la política de `change_password_required` (si se usa lógica custom) o simplemente instruir el cambio manual en el primer login.

**Nota:** Dado que Supabase Auth maneja las contraseñas, lo ideal es crear los usuarios invite user by email, lo que les envía un link mágico para poner su password ellos mismos, O crearlos con password fijo y forzar el cambio.
