import { createClient } from "@supabase/supabase-js";

type VercelRequest = any;
type VercelResponse = any;

function isAllowedOrigin(origin: string | undefined): boolean {
  const allowed = process.env.ALLOWED_ORIGINS;
  if (!allowed) return false;
  if (!origin) return false;
  return allowed
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
    .includes(origin);
}

function setCorsHeaders(res: VercelResponse, origin: string | undefined) {
  if (!origin) return;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  res.setHeader("Access-Control-Max-Age", "86400");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
    setCorsHeaders(res, origin);
  }

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ciclo_id } = req.body;

  if (!ciclo_id) {
    return res.status(400).json({ error: "ciclo_id is required" });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: "Missing Supabase credentials" });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Obtener alumnos del ciclo
    const { data: alumnos, error: errAlumnos } = await supabase
      .from("alumno_ciclo")
      .select(`
        alumno_id,
        grado,
        grupo,
        alumnos (
          nombre_completo,
          puntaje_riesgo,
          datos_bap
        )
      `)
      .eq("ciclo_id", ciclo_id)
      .eq("estatus", "activo");

    if (errAlumnos) throw errAlumnos;

    // 2. Obtener grupos del ciclo
    const { data: cicloData } = await supabase
      .from("ciclos_escolares")
      .select("nombre")
      .eq("id", ciclo_id)
      .single();

    const { data: grupos, error: errGrupos } = await supabase
      .from("grupos")
      .select("id, nombre")
      .eq("ciclo_escolar", cicloData?.nombre);

    if (errGrupos) throw errGrupos;

    // --- ALGORITMO DE DISTRIBUCIÓN ---
    const sugerencias: any[] = [];
    const equilibrio: Record<string, number> = {};

    // Inicializar equilibrio
    grupos?.forEach((g: any) => {
      equilibrio[g.nombre] = 0;
    });

    const sortedAlumnos = [...(alumnos || [])].sort((a: any, b: any) => 
      (b.alumnos?.puntaje_riesgo || 0) - (a.alumnos?.puntaje_riesgo || 0)
    );

    let groupIndex = 0;
    sortedAlumnos.forEach((ac: any) => {
      const targetGroup = grupos?.[groupIndex % (grupos.length || 1)];
      if (targetGroup) {
        sugerencias.push({
          alumno_id: ac.alumno_id,
          grupo_sugerido: targetGroup.nombre
        });
        equilibrio[targetGroup.nombre] = (equilibrio[targetGroup.nombre] || 0) + 1;
        groupIndex++;
      }
    });

    return res.status(200).json({
      sugerencias,
      equilibrio
    });

  } catch (err: any) {
    console.error("Error in distribution API:", err);
    return res.status(500).json({ error: err.message });
  }
}

