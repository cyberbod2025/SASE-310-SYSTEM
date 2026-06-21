import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data, error } = await supabase.from('incidencias').select('*').limit(5);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Sample incidencias:', JSON.stringify(data, null, 2));
  }
}

main();
