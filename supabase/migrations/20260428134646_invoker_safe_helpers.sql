-- Convierte helpers de identidad/ecosistema a SECURITY INVOKER.
-- Mantiene EXECUTE a authenticated para no romper RLS ni llamadas de UI.

alter function public.get_my_role() security invoker;
alter function public.get_my_role_text() security invoker;
alter function public.get_my_rol_safe() security invoker;
alter function public.get_user_role() security invoker;
alter function public.get_my_normalized_email() security invoker;
alter function public.is_staff() security invoker;
alter function public.get_modulos_ecosistema_visibles() security invoker;
