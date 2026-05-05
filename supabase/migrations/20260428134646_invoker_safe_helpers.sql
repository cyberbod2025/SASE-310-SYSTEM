-- Convierte helpers de identidad/ecosistema a SECURITY INVOKER.
-- Mantiene EXECUTE a authenticated para no romper RLS ni llamadas de UI.
-- Nota: bloques defensivos para tolerar entornos limpios.

DO $$ BEGIN alter function public.get_my_role() security invoker; EXCEPTION WHEN undefined_function THEN NULL; END $$;
DO $$ BEGIN alter function public.get_my_role_text() security invoker; EXCEPTION WHEN undefined_function THEN NULL; END $$;
DO $$ BEGIN alter function public.get_my_rol_safe() security invoker; EXCEPTION WHEN undefined_function THEN NULL; END $$;
DO $$ BEGIN alter function public.get_user_role() security invoker; EXCEPTION WHEN undefined_function THEN NULL; END $$;
DO $$ BEGIN alter function public.get_my_normalized_email() security invoker; EXCEPTION WHEN undefined_function THEN NULL; END $$;
DO $$ BEGIN alter function public.is_staff() security invoker; EXCEPTION WHEN undefined_function THEN NULL; END $$;
DO $$ BEGIN alter function public.get_modulos_ecosistema_visibles() security invoker; EXCEPTION WHEN undefined_function THEN NULL; END $$;

