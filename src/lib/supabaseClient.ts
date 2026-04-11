import { createClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/types";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
  ?.trim()
  ?.replace(/[\r\n]+/g, "");

export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
  ?.trim()
  ?.replace(/[\r\n]+/g, "");

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local",
  );
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);

export const supabaseClient = supabase;
