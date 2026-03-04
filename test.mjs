import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
const supa = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
);
const { data, error } = await supa.from("eventos").select("*").limit(1);
console.log("Error:", error);
