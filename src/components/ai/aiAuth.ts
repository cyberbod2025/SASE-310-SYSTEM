import { supabase } from "../../lib/supabaseClient";

export const getAccessToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token ?? null;
};

export const buildAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("No hay una sesión institucional activa.");
  }
  return { Authorization: `Bearer ${token}` };
};
