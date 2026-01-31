import { supabase } from "../supabase/client";

/**
 * Executes a mass data load (Seed) for the SASE-310 system.
 * This runs client-side but relies on the logged-in user having access or the anon key allowing these inserts (if testing).
 * Note: In a production environment with strict RLS, this should be a server-side admin function.
 */
export const seedDatabase = async () => {
  console.log("🌱 Starting Seed Process...");
  const errors: any[] = [];
  const success: string[] = [];

  // 1. Grupos (Groups)
  const grupos = [
    "1º A",
    "1º B",
    "1º C",
    "1º D",
    "2º A",
    "2º B",
    "2º C",
    "2º D",
    "3º A",
    "3º B",
    "3º C",
    "3º D",
  ];

  console.log("Procesando grupos oficiales (12)...");
  for (const nombre of grupos) {
    const { error } = await (supabase.from("grupos" as any) as any).insert([
      { nombre, ciclo_escolar: "2025-2026" },
    ]);
    if (error && error.code !== "23505") {
      errors.push({ table: "grupos", error });
    }
  }
  success.push(`Intentada la creación de ${grupos.length} grupos.`);

  // 2. Alumnos de Prueba (Test Students)
  const alumnos = [
    {
      matricula: "2023-4492",
      nombre_completo: "Carlos Alberto Ruiz",
      grupo: "3º B",
      datos_tutor: {
        name: "María Ruiz",
        phonePrimary: "55-1234-5678",
        relationship: "Madre",
      },
      datos_bap: { hasBAP: false },
    },
    {
      matricula: "2023-1122",
      nombre_completo: "Sofia Hernández G.",
      grupo: "2º A",
      datos_tutor: {
        name: "Roberto Hernández",
        phonePrimary: "55-8765-4321",
        relationship: "Padre",
      },
      datos_bap: {
        hasBAP: true,
        diagnosisPrivate: "TDAH",
        accommodations: ["Ubicación preferencial"],
      },
    },
    {
      matricula: "2023-9988",
      nombre_completo: "Juan López Pérez",
      grupo: "3º B",
      datos_tutor: {
        name: "Abuela López",
        phonePrimary: "55-5555-5555",
        relationship: "Tutora",
      },
      datos_bap: { hasBAP: false },
    },
    {
      matricula: "2024-1001",
      nombre_completo: "Valentina Solís",
      grupo: "2º A",
      datos_tutor: {
        name: "Carmen Solís",
        phonePrimary: "55-4444-3333",
        relationship: "Madre",
      },
      datos_bap: {
        hasBAP: true,
        diagnosisPrivate: "Hipoacusia",
        accommodations: ["Lenguaje de Señas"],
      },
    },
  ];

  console.log("Procesando alumnos...");
  for (const alumno of alumnos) {
    // Check if exists first to avoid complex error handling if upsert not enabled
    const { data: existing } = await supabase
      .from("alumnos")
      .select("id")
      .eq("matricula", alumno.matricula)
      .single();

    if (!existing) {
      const { error } = await supabase.from("alumnos").insert([alumno]);
      if (error) errors.push({ table: "alumnos", error });
    }
  }
  success.push(`Intentada la creación de ${alumnos.length} alumnos.`);

  // 3. Incidencias de Prueba (Mock Incidents)
  // Need to fetch IDs first
  const { data: dbStudents } = await supabase
    .from("alumnos")
    .select("id, matricula");
  if (dbStudents) {
    const carlos = dbStudents.find((s) => s.matricula === "2023-4492");
    if (carlos) {
      await supabase.from("incidencias").insert([
        {
          alumno_id: carlos.id,
          tipo: "RETARDO",
          descripcion: "Llegada tarde seed",
          fecha: new Date().toISOString(),
        },
      ]);
    }
    const sofia = dbStudents.find((s) => s.matricula === "2023-1122");
    if (sofia) {
      await supabase.from("incidencias").insert([
        {
          alumno_id: sofia.id,
          tipo: "CONDUCTA",
          descripcion: "Uso de celular seed",
          fecha: new Date().toISOString(),
        },
      ]);
    }
    success.push("Incidencias de prueba creadas.");
  }

  return { success, errors };
};
