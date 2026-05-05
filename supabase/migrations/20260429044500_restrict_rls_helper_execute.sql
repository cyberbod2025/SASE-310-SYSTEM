-- Reduce superficie externa de helpers SECURITY DEFINER usados por RLS.

revoke all on function public.get_my_role_text() from public;
grant execute on function public.get_my_role_text() to authenticated;

revoke all on function public.get_my_role() from public;
grant execute on function public.get_my_role() to authenticated;

revoke all on function public.get_user_role() from public;
grant execute on function public.get_user_role() to authenticated;

revoke all on function public.get_my_normalized_email() from public;
grant execute on function public.get_my_normalized_email() to authenticated;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated;

revoke all on function public.is_current_user_smoke_test() from public;
grant execute on function public.is_current_user_smoke_test() to authenticated;
