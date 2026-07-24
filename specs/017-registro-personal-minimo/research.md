# Investigación

## Hallazgos

- El estado conserva `password` y `confirmPassword`, pero no existen campos
  visibles ni la contraseña se usa para crear Auth.
- Las respuestas de seguridad se guardan sin hash ni cifrado dentro de
  `solicitudes_alta_personal.metadata`.
- La fecha de nacimiento solo alimenta un RFC parcial y una promesa de
  cumpleaños ajena al objetivo del alta.
- La matrícula de cliente incluye parte de la CURP y compite con la matrícula
  asignada por el trigger de base de datos.
- `correoInstitucional` existe en el estado y payload, pero no en la interfaz.
- El endpoint de nómina carga todas las filas activas y busca la coincidencia en
  memoria pese a existir un índice sobre `full_name_normalized`.
- La copia afirma cifrado y acceso preparado sin evidencia ni aprobación.
- La validación de nómina vive en el cliente; un consumidor directo de
  PostgREST puede omitirla y declarar otro rol permitido por la política.

## Decisiones

- Reducir el payload a identidad, adscripción, consentimientos y contexto
  operativo.
- Hacer obligatorio el correo institucional con dominio `sase.mx`.
- Extraer validación y persistencia a un servicio testeable.
- Consultar la nómina por `full_name_normalized`.
- Eliminar claves secretas conocidas de registros existentes.
- Usar una restricción sobre la representación JSON para detectar claves
  sensibles a cualquier profundidad.
- Mantener `verify-staff` como ayuda previa, pero hacer autoritativo un endpoint
  con rate limit que llama una RPC exclusiva de `service_role`; la RPC vuelve a
  consultar `personal_oficial`, compara el rol y realiza la inserción.
- Revocar `INSERT` directo para que el navegador no pueda eludir esa RPC.
