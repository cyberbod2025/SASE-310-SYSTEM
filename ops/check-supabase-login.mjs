import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const publishableKey = process.env.SASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const email = process.env.SASE_PILOT_EMAIL;
const password = process.env.SASE_PILOT_PASSWORD;

if (!supabaseUrl || !publishableKey || !email || !password) {
  throw new Error("Faltan SUPABASE_URL/VITE_SUPABASE_URL, SASE_PUBLISHABLE_KEY/VITE_SUPABASE_ANON_KEY o credenciales del usuario.");
}

const client = createClient(supabaseUrl, publishableKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await client.auth.signInWithPassword({ email, password });

console.log(
  JSON.stringify(
    {
      ok: !error,
      error: error?.message || null,
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
      hasSession: Boolean(data.session?.access_token),
    },
    null,
    2,
  ),
);
