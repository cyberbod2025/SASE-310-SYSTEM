const publishableKey = process.env.SASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const email = process.env.SASE_PILOT_EMAIL || "docente.feria.smoke@sase.mx";
const password = process.env.SASE_PILOT_PASSWORD || "SmokePass123!";
const baseUrl = process.env.SASE_BASE_URL || "https://sase-310-system-ten.vercel.app";
const supabaseUrl = process.env.SUPABASE_URL || "https://uvnetpnjinxzhggoqmwz.supabase.co";

if (!publishableKey) {
  throw new Error("Falta SASE_PUBLISHABLE_KEY o VITE_SUPABASE_ANON_KEY.");
}

const tokenResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    apikey: publishableKey,
  },
  body: JSON.stringify({ email, password }),
});

const tokenBody = await tokenResponse.text();
console.log("auth status:", tokenResponse.status);
console.log(tokenBody);

if (!tokenResponse.ok) {
  process.exit(1);
}

const accessToken = JSON.parse(tokenBody).access_token;
const launchResponse = await fetch(`${baseUrl}/api/modules/launch`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({ module: "feria" }),
});

console.log("launch status:", launchResponse.status);
console.log(await launchResponse.text());
