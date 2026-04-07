import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "REDACTED_SUPABASE_URL";
const ANON_KEY = "REDACTED_JWT";

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function testFetch() {
  console.log("Signing in with prefectura@sase.mx / REDACTED_PASSWORD");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'prefectura@sase.mx',
    password: 'REDACTED_PASSWORD'
  });

  if (authError) {
    console.error("Auth error:", authError.message);
    return;
  }
  
  console.log("Success! Signed in as", authData.user.email);
}

testFetch();
