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
  console.log("Dropping trigger...");
  // Use a hack to drop the trigger via SQL if possible? No.
  // I already have a migration for that.
  
  const email = `final.test.${Date.now()}@sase.mx`;
  console.log(`Creating user ${email}...`);
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: "Password123!",
    email_confirm: true
  });

  if (error) {
    console.error("❌ Error:", error.message);
  } else {
    console.log("✅ Success! User ID:", data.user.id);
  }
}

main();
