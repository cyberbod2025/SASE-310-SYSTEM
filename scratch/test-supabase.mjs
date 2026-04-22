
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Faltan credenciales en .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log(`Probando conexión a: ${SUPABASE_URL}`);
  const { data, error } = await supabase.from("perfiles_usuario").select("count", { count: "exact", head: true });
  
  if (error) {
    console.error("Error de conexión:", error.message);
    process.exit(1);
  } else {
    console.log("Conexión exitosa. Filas en perfiles_usuario:", data);
  }
}

testConnection();
