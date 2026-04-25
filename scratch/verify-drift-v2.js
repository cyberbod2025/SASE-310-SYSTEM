import { createClient } from '@supabase/supabase-js';

// Conectar a la instancia LOCAL de Supabase
const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function verifyLocal() {
  console.log("=== Verificación local: Behavior Drift Engine v2 ===\n");

  // 1. Verificar que la columna estado_datos existe
  // Verificar con query directa
  
  // Usar query directa para ver estructura
  const { data: sample, error: err2 } = await supabase
    .from('behavior_metrics')
    .select('id, alumno_id, calidad, consistencia, deriva_score, nivel_deriva, estado_datos')
    .limit(5);
    
  if (err2) {
    console.error("Error leyendo behavior_metrics:", err2.message);
  } else {
    console.log(`  Registros encontrados: ${sample.length}`);
    if (sample.length > 0) {
      console.log("  Columnas disponibles:", Object.keys(sample[0]));
      console.table(sample);
    } else {
      console.log("  (tabla vacía — normal en local sin seed de incidencias)");
    }
  }

  // 2. Probar la función calcular_deriva con datos simulados
  console.log("\n2. Probar función con datos simulados:");
  
  // Primero necesitamos un alumno
  const { data: alumnos } = await supabase
    .from('alumnos')
    .select('id, nombre_completo')
    .limit(1);

  if (!alumnos || alumnos.length === 0) {
    console.log("  No hay alumnos en local. Insertando datos de prueba...");
    
    // Insertar un alumno de prueba
    const { data: alumno, error: insErr } = await supabase
      .from('alumnos')
      .insert({ nombre_completo: 'Test Drift Student', grupo: '1A', matricula: 'TEST001', curp: 'TEST000000HTLNNN00' })
      .select()
      .single();
      
    if (insErr) {
      console.error("  Error insertando alumno:", insErr.message);
      return;
    }
    
    const alumnoId = alumno.id;
    console.log(`  Alumno de prueba creado: ${alumnoId}`);
    
    // Insertar 4 métricas para probar la lógica v2
    const metrics = [
      { alumno_id: alumnoId, calidad: 5.0, consistencia: 4.5, frecuencia: 0, tendencia: 0, fecha: '2026-01-15T00:00:00Z' },
      { alumno_id: alumnoId, calidad: 4.5, consistencia: 4.0, frecuencia: 1, tendencia: -0.5, fecha: '2026-02-15T00:00:00Z' },
      { alumno_id: alumnoId, calidad: 3.5, consistencia: 3.0, frecuencia: 2, tendencia: -1.0, fecha: '2026-03-15T00:00:00Z' },
      { alumno_id: alumnoId, calidad: 2.0, consistencia: 2.0, frecuencia: 4, tendencia: -1.5, fecha: '2026-04-15T00:00:00Z' },
    ];
    
    for (const m of metrics) {
      const { error } = await supabase.from('behavior_metrics').insert(m);
      if (error) {
        console.error("  Error insertando métrica:", error.message);
        return;
      }
    }
    console.log("  4 métricas insertadas.");
    
    // Invocar calcular_deriva
    console.log("  Invocando calcular_deriva...");
    const { error: rpcErr } = await supabase.rpc('calcular_deriva', { alumno: alumnoId });
    if (rpcErr) {
      console.error("  Error en calcular_deriva:", rpcErr.message);
    } else {
      console.log("  ✅ calcular_deriva ejecutó sin errores");
    }
    
    // Verificar resultado
    const { data: result } = await supabase
      .from('behavior_metrics')
      .select('id, fecha, calidad, consistencia, deriva_score, nivel_deriva, estado_datos')
      .eq('alumno_id', alumnoId)
      .order('fecha', { ascending: false });
      
    console.log("\n  Resultados post-cálculo:");
    console.table(result);
    
    // Verificar con menos de 3 registros
    console.log("\n3. Probar con datos insuficientes (< 3 registros):");
    
    const { data: alumno2, error: insErr2 } = await supabase
      .from('alumnos')
      .insert({ nombre_completo: 'Test Insufficient', grupo: '1B', matricula: 'TEST002', curp: 'TEST000000HTLNNN01' })
      .select()
      .single();
      
    if (insErr2) {
      console.error("  Error:", insErr2.message);
      return;
    }
    
    // Solo 2 métricas
    await supabase.from('behavior_metrics').insert([
      { alumno_id: alumno2.id, calidad: 5.0, consistencia: 4.0, frecuencia: 0, tendencia: 0, fecha: '2026-03-01T00:00:00Z' },
      { alumno_id: alumno2.id, calidad: 4.0, consistencia: 3.5, frecuencia: 1, tendencia: -0.5, fecha: '2026-04-01T00:00:00Z' },
    ]);
    
    const { error: rpcErr2 } = await supabase.rpc('calcular_deriva', { alumno: alumno2.id });
    if (rpcErr2) {
      console.error("  Error en calcular_deriva:", rpcErr2.message);
    }
    
    const { data: result2 } = await supabase
      .from('behavior_metrics')
      .select('id, fecha, calidad, consistencia, deriva_score, nivel_deriva, estado_datos')
      .eq('alumno_id', alumno2.id)
      .order('fecha', { ascending: false });
      
    console.table(result2);
    
  } else {
    console.log(`  Alumno encontrado: ${alumnos[0].nombre_completo}`);
  }
  
  console.log("\n=== Verificación completa ===");
}

verifyLocal();
