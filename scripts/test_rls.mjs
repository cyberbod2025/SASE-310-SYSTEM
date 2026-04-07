import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "REDACTED_SUPABASE_URL";
const ANON_KEY = "REDACTED_JWT";

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function testFetch() {
  console.log("Signing in...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'prefectura@sase.mx',
    password: 'REDACTED_PASSWORD'
  });

  if (authError) {
    console.error("Auth error:", authError.message);
    return;
  }
  
  console.log("Signed in as", authData.user.email);
  
  const { data, error } = await supabase.from("alumnos").select(`
          *,
          incidencias (
            id, tipo, descripcion, creado_en, reportado_por, fecha, estado, reporta, clasificacion, gravedad, notificado_whatsapp
          ),
          justificantes (
            id, folio, fecha_inicio, fecha_fin, motivo, descripcion, creado_en, emitido_por
          ),
          salud (
            padecimiento, documento_url
          ),
          calificaciones (
            id, materia, trimestre1, trimestre2, trimestre3, promedio_final, ciclo_escolar
          ),
          documentos_institucionales (
             id, tipo, folio, fecha, titulo, contenido, narracion_ia, firmas, creado_por
          ),
          objetos_retenidos (
            id, objeto, motivo, fecha, responsable_id, responsable_nombre, responsable_rol, 
            estado, incidencia_id, created_at, fecha_devolucion, entregado_a, entregado_por, 
            lugar_retencion, categoria, observaciones, evidencia_url, autorizado_por
          ),
        `);

    if (error) {
      console.error("Fetch error:", error.message, error.hint, error.details);
    } else {
      console.log(`Success! Fetched ${data.length} students.`);
    }
}

testFetch();
