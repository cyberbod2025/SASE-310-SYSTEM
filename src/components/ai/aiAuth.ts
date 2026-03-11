import { supabase } from "../../supabase/client";

export const getAccessToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token ?? null;
};

export const buildAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};
