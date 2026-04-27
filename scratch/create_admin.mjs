
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://uvnetpnjinxzhggoqmwz.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2bmV0cG5qaW54emhnZ29xbXd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjI3MTMzOSwiZXhwIjoyMDgxODQ3MzM5fQ.rK2fyWiZ7wQyUedDs4HFuf_w17Vrl2cCmkmVU6eBwmQ";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function createAdmin() {
  console.log("Creating admin@sase.mx...");
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@sase.mx',
    password: 'PruebaSASE2026!',
    email_confirm: true,
    user_metadata: { full_name: "Administrador Sistema" }
  });

  if (error) {
    console.error("Error creating admin:", error.message);
  } else {
    console.log("Admin created successfully:", data.user.id);
    // Profile
    const { error: pError } = await supabase.from('perfiles_usuario').upsert({
      id: data.user.id,
      email: 'admin@sase.mx',
      nombre_completo: 'Administrador Sistema',
      rol: 'admin',
      estado_cuenta: 'activo'
    });
    if (pError) console.error("Error creating profile:", pError.message);
    else console.log("Profile created successfully.");
  }
}

createAdmin();
