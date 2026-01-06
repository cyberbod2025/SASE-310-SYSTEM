import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local"
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
