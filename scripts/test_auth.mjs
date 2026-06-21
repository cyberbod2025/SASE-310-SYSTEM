import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !ANON_KEY) {
  console.error("Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function testFetch() {
  const email = process.env.TEST_AUTH_EMAIL || "prefectura@sase.mx";
  const password = process.env.TEST_AUTH_PASS || "";
  if (!password) {
    console.error("Falta TEST_AUTH_PASS en .env.local");
    process.exit(1);
  }
  console.log(`Signing in with ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) {
    console.error("Auth error:", authError.message);
    return;
  }
  
  console.log("Success! Signed in as", authData.user.email);
}

testFetch();
