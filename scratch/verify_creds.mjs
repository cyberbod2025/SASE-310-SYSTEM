
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://uvnetpnjinxzhggoqmwz.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2bmV0cG5qaW54emhnZ29xbXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNzEzMzksImV4cCI6MjA4MTg0NzMzOX0.JyWCrAGDvaKpmcn3HRJHjoJmdbTg7VfaCXkomeyUBNw";

const supabase = createClient(SUPABASE_URL, ANON_KEY);

const users = [
  { email: 'prefectura@sase.mx', password: 'PruebaSASE2026!' },
  { email: 'docente.smoke@sase.mx', password: 'SmokePass123!' },
  { email: 'new.smoke@sase.mx', password: 'password123' }
];

async function testLogins() {
  console.log("--- Testing Credentials ---");
  for (const user of users) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password
    });

    if (error) {
      console.log(`❌ ${user.email}: FAILED (${error.message})`);
    } else {
      console.log(`✅ ${user.email}: SUCCESS (User ID: ${data.user.id})`);
      await supabase.auth.signOut();
    }
  }
}

testLogins();
