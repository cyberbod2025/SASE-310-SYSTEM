# Investigación

## Evidencia

- `DashboardPrefectura.handleAction` invoca `addIncident` sin `await`.
- `addIncident` devuelve `boolean`, pero guarda en memoria un `tempId` aleatorio
  y no solicita la fila insertada.
- `registerAttendance` no devuelve éxito o fallo.
- El botón “Notificar Tutor” no llama a ninguna pasarela.
- El escalamiento actual inserta una incidencia `conducta` con texto genérico.
- `DashboardOrientacion` solo lista `orientacion_casos` visibles por RLS.
- Un caso asignado mediante `responsable_id` sí aparece y puede ser operado por
  esa persona de Orientación.
- `private.is_institutional_actor` valida sesión, rol y estado activo.

## Decisiones

- Crear un RPC `SECURITY DEFINER` pequeño y explícitamente autorizado.
- No ampliar grants de tablas para Prefectura.
- Asignar al perfil activo de Orientación con menor número de casos abiertos.
- Reutilizar casos abiertos para evitar expedientes paralelos.
- Auditar dentro de la misma transacción.
- Retirar la notificación ficticia en lugar de conectar una pasarela no
  autorizada.

## Riesgo

La migración no podrá aplicarse ni lintarse contra Postgres local mientras
Docker no esté disponible.
