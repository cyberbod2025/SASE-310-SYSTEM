import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const admin = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const { data, error } = await admin.rpc("exec_sql", { sql: "SELECT * FROM information_schema.columns WHERE table_name = 'perfiles_usuario'" });
  if (error) {
    console.error("Exec SQL failed (likely missing RPC)");
  } else {
    console.table(data);
  }
}

main();
