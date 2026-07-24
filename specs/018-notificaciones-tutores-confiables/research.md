# Investigación

## Hallazgos

- `sendWhatsAppNotification` envía teléfono y texto arbitrario desde el
  navegador.
- `whatsapp.ts` resuelve el rol primero en `perfiles_usuario`, pero no valida
  estado ni seguridad y vuelve a `profiles`.
- La ausencia de credenciales activa un mock con `success: true`.
- El mock imprime teléfono y mensaje en consola.
- La auditoría directa incluye el teléfono completo en la descripción y no
  registra propósito, origen, incidencia ni alumno.
- `StudentAdvancedPanel` marca la incidencia al recibir cualquier éxito,
  incluido el simulado.
- `useStudentsSlice` intenta un WhatsApp externo de forma automática al detectar
  una escalada crítica y no espera su resultado.
- `incidencias.notificado_whatsapp` es un booleano sin memoria de intentos.
- `alumnos.datos_tutor` contiene el contacto del tutor y debe consultarse solo
  en servidor.

## Decisiones

- Usar dos RPC de servicio: inicio antes del efecto externo y resolución
  después del proveedor.
- Persistir solo últimos cuatro dígitos del destinatario.
- Mantener la llamada a Meta fuera de la transacción. Si Meta confirma, pero la
  resolución en base falla, conservar `PENDIENTE` en lugar de registrar un falso
  `FALLIDO`; el índice único impide un reenvío automático hasta reconciliarlo.
- Resolver como `ENVIADO`, `SIMULADO` o `FALLIDO` toda salida cuyo resultado sí
  pudo persistirse.
- Usar `incidentId` como única referencia pública.
- Construir la plantilla con datos persistidos y no con texto libre del cliente.
- Exigir intervención humana para la comunicación externa.
