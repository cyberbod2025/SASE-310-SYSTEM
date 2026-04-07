<<<<<<< HEAD
import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()?.replace(/[\r\n]+/g, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()?.replace(/[\r\n]+/g, '');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local"
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
=======
import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()?.replace(/[\r\n]+/g, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()?.replace(/[\r\n]+/g, '');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local"
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
>>>>>>> 6b7cfee0048e22f3aeefd2736b20d95b3c864f6f
