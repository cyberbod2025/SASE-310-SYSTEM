-- Ejecutar manualmente SOLO después de migrar el frontend de Feria a Edge Functions.
-- No incluir este archivo en migraciones hasta confirmar el corte.

begin;

revoke execute on function public.registrar_progreso_v2(uuid, uuid, integer) from authenticated;
revoke execute on function public.finalizar_trivia_v2(uuid, uuid, integer) from authenticated;

-- Recomendado en el mismo corte si ya no hay clientes directos:
-- revoke execute on function public.increment_visitantes(uuid) from authenticated;
-- revoke execute on function public.decrement_visitantes(uuid) from authenticated;

commit;
