-- ==============================================================================
-- LIMPIEZA DE DATOS DE PRUEBA (PREVIO A PILOTO)
-- ==============================================================================
-- ADVERTENCIA: Este script borra todos los datos transaccionales.
-- NO borra al Super Admin (Rol: DEVELOPER).

BEGIN;

-- 1. Limpiar Auditoría (Logs de pruebas)
DELETE FROM public.auditoria;

-- 2. Limpiar Solicitudes de Acceso (Pruebas de flujo)
DELETE FROM public.solicitudes_alta_personal;

-- 3. Limpiar Incidencias, Asistencias y Justificantes (Datos dependientes)
DELETE FROM public.incidencias;
DELETE FROM public.justificantes; -- Fix: Tabla que bloqueaba el borrado de perfiles
-- DELETE FROM public.citas_padres;  -- (Deshabilitado: Tabla aun no creada en prodycción)
-- DELETE FROM public.attendance_logs; -- Descomentar si se usó el módulo de asistencia

-- 4. Limpiar Usuarios de Prueba (Mantiene solo al Admin)
-- Borra de perfiles_usuario
DELETE FROM public.perfiles_usuario 
WHERE rol != 'DEVELOPER';

-- Borra de profiles (legacy)
DELETE FROM public.profiles 
WHERE role::text != 'DEVELOPER' AND role::text != 'super_admin';

-- 5. Reiniciar Secuencias (Opcional, para empezar IDs desde 1 si son seriales)
-- ALTER SEQUENCE incidencias_id_seq RESTART WITH 1;

COMMIT;

-- Confirmación
SELECT COUNT(*) as usuarios_restantes FROM public.perfiles_usuario;
