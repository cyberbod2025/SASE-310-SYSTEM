import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !ANON_KEY) {
  console.error("Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env.local");
  process.exit(1);
}

// I will just use the anon key if possible. Wait, anon key cannot update passwords unless the user is logged in. 
// Or better, I can just use signUp, but the user already exists.
