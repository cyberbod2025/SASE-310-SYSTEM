import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan credenciales VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  console.log("=== 1. Extraer la lista de personal (perfiles_usuario) ===");
  const { data: perfiles, error: err1 } = await supabase
    .from('perfiles_usuario')
    .select('id, nombre_completo, rol, email, es_tutor')
    .order('rol', { ascending: true });
    
  if (err1) {
    console.error("Error al obtener perfiles:", err1.message);
  } else {
    // Para simplificar la salida si hay muchos
    console.table(perfiles.slice(0, 10).map(p => ({
        id: p.id,
        nombre: p.nombre_completo,
        rol: p.rol,
        tutor: p.es_tutor
    })));
    console.log(`... y ${perfiles.length - 10} perfiles más.`);
  }

  console.log("\n=== 2. Mapear acceso a módulos ===");
  
  const { data: modulosRoles, error: err2 } = await supabase
    .from('modulos_ecosistema_roles')
    .select('module_id, role');
    
  const { data: modulos, error: err3 } = await supabase
    .from('modulos_ecosistema')
    .select('id, key, name');

  if (err2 || err3) {
    console.error("Error al obtener acceso a módulos:", err2?.message || err3?.message);
  } else {
    const modulosMap = modulos.reduce((acc, m) => {
        acc[m.id] = m.key;
        return acc;
    }, {});
    
    const accesos = modulosRoles.map(mr => ({
        modulo: modulosMap[mr.module_id] || mr.module_id,
        role: mr.role
    }));
    
    // Agrupar por módulo
    const agrupado = accesos.reduce((acc, a) => {
        if (!acc[a.modulo]) acc[a.modulo] = [];
        acc[a.modulo].push(a.role);
        return acc;
    }, {});
    
    console.log("Accesos a Feria, Mate y Diagnóstico Colectivo (y otros):");
    console.table(Object.entries(agrupado).map(([mod, roles]) => ({
      Modulo: mod,
      Roles: roles.join(', ')
    })));
  }

  console.log("\n=== 3. Verificar estado del motor de deriva (Behavior Drift Engine) ===");
  
  const { data: behaviorMetrics, error: err4 } = await supabase
    .from('behavior_metrics')
    .select('id, alumno_id, calidad, consistencia, frecuencia, tendencia, deriva_score, nivel_deriva, fecha')
    .order('fecha', { ascending: false })
    .limit(5);
    
  if (err4) {
    console.error("Error al obtener behavior_metrics:", err4.message);
  } else {
    console.log(`Se encontraron métricas recientes de deriva.`);
    console.table(behaviorMetrics);
  }
}

runAudit();
