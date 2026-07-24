# Especificación 017 — Registro inicial de personal mínimo y honesto

Estado: Implementada y validada estáticamente; aplicación y despliegue
pendientes

## Problema

El registro inicial de personal solicita o conserva datos que no necesita para
crear una solicitud:

- mantiene campos de contraseña que no participan en el alta;
- exige preguntas de recuperación y guarda sus respuestas en texto claro dentro
  de `metadata`;
- solicita fecha de nacimiento para generar un RFC parcial;
- genera una matrícula aleatoria desde la CURP aunque la base de datos asigna la
  matrícula institucional;
- no muestra un campo para correo, pero envía un correo vacío;
- afirma que los datos fueron “encriptados” sin demostrar cifrado de campo;
- anuncia funciones desbloqueadas antes de que Dirección apruebe el acceso.

Así, el formulario puede almacenar secretos innecesarios, producir solicitudes
no aprobables y comunicar un estado institucional que todavía no existe.

## Objetivo

Convertir el registro en una solicitud mínima y verificable:

- nombre y función contrastados con la nómina oficial;
- CURP para identificación;
- correo institucional `nombre.apellido@sase.mx`;
- CCT y turno de adscripción;
- consentimientos;
- folio de referencia;
- estado pendiente hasta resolución institucional.

## Reglas

- No se capturan contraseñas ni respuestas de recuperación en la solicitud.
- No se capturan fecha de nacimiento, RFC parcial ni matrículas aleatorias.
- La matrícula SASE la asigna la base de datos.
- `metadata` solo contiene contexto operativo no secreto.
- La base de datos rechaza claves de secretos dentro de `metadata`.
- Los secretos legados conocidos se eliminan de solicitudes existentes.
- El correo debe usar el dominio institucional y el formato
  `nombre.apellido@sase.mx`.
- La validación de nómina consulta por el nombre normalizado indexado y no
  descarga la nómina completa al proceso API.
- La verificación del navegador es orientativa: la base vuelve a contrastar
  nombre y rol contra `personal_oficial` antes de persistir.
- El cliente público no puede insertar directamente en
  `solicitudes_alta_personal`; usa un endpoint limitado que invoca una función
  exclusiva de `service_role`, deriva el rol autorizado y genera el folio.
- Las cuentas técnicas no son roles de registro público.
- La interfaz dice “solicitud enviada” y no “credenciales activadas”.
- No se afirma cifrado de campo sin evidencia.

## Criterios de aceptación

- `RegistroPersonal` no contiene campos ni estado de contraseña o preguntas de
  seguridad.
- El formulario muestra y valida correo institucional.
- El payload no contiene `preguntas_seguridad`, fecha de nacimiento, RFC
  parcial ni matrícula generada por cliente.
- Existe un servicio tipado con payload mínimo y sesión independiente.
- `verify-staff` usa `full_name_normalized` y selecciona solo el rol necesario.
- La persistencia usa una RPC acotada exclusiva de `service_role`; la inserción
  directa de `anon`/`authenticated` queda revocada.
- La RPC rechaza discrepancias entre la función declarada y la nómina.
- Existe una migración que limpia secretos legados y prohíbe nuevas claves
  sensibles en `metadata`.
- La política de inserción exige correo `nombre.apellido@sase.mx`.
- La copia de proceso y éxito representa el estado pendiente real.
- Existen pruebas de servicio, interfaz, API e invariantes SQL.

## Fuera de alcance

- Sustituir la nómina oficial por un proveedor externo.
- Crear una contraseña durante la solicitud.
- Desplegar la API o aplicar la migración en un proyecto hospedado.
- Diseñar el primer inicio de sesión posterior a la invitación.

## Estado de validación

- Servicio, interfaz, API y migración cubiertos por 11 pruebas enfocadas.
- Suite completa: 46 archivos y 218 pruebas aprobadas.
- `pnpm type-check`, `pnpm build` y empaquetado estático de los handlers:
  aprobados.
- `pnpm lint`: cero errores y cuatro advertencias preexistentes fuera del
  alcance.
- Auditoría estática de migraciones: aprobada con advertencias históricas.
- La migración no está aplicada ni lintada contra PostgreSQL: Docker Desktop no
  está disponible y la base local no pudo iniciar.
