import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.local" });

const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const sql = `
  SELECT 1;
  `;
  const { data, error } = await supabaseAdmin.rpc("exec_sql", { sql_string: sql });
  if (error) {
    const { data: d2, error: e2 } = await supabaseAdmin.rpc("postgres_query", { query: sql });
    console.log("fallback error:", e2);
  } else {
    console.log("Success:", data);
  }
}
main();
