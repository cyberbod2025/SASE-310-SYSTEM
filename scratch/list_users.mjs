
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://uvnetpnjinxzhggoqmwz.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.log("No service role key provided. Cannot list users.");
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function listUsers() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Error listing users:", error.message);
    return;
  }

  console.log("--- User List ---");
  users.forEach(u => {
    console.log(`- ${u.email} (${u.id})`);
  });
}

listUsers();
