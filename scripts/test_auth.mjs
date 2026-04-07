import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://uvnetpnjinxzhggoqmwz.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2bmV0cG5qaW54emhnZ29xbXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNzEzMzksImV4cCI6MjA4MTg0NzMzOX0.JyWCrAGDvaKpmcn3HRJHjoJmdbTg7VfaCXkomeyUBNw";

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function testFetch() {
  console.log("Signing in with prefectura@sase.mx / PruebaSASE2026!");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'prefectura@sase.mx',
    password: 'PruebaSASE2026!'
  });

  if (authError) {
    console.error("Auth error:", authError.message);
    return;
  }
  
  console.log("Success! Signed in as", authData.user.email);
}

testFetch();
