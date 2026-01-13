const fs = require("fs");
const path = require("path");

const csvPath = "C:\\Users\\cyber\\Desktop\\ALUMNOS_205-2026.CSV";
const outputPath = path.join(
  __dirname,
  "supabase",
  "migrations",
  "20260110_bulk_students_import.sql"
);

try {
  const data = fs.readFileSync(csvPath, "utf8");
  const lines = data.split(/\r?\n/).filter((line) => line.trim() !== "");

  // Headers: Grado,Grupo,Nombre_Completo
  // Skip header
  const rows = lines.slice(1);

  let sqlContent = `-- Importación Masiva de Alumnos desde CSV
-- Generado automáticamente el ${new Date().toISOString()}

INSERT INTO public.alumnos (matricula, nombre_completo, grupo) VALUES
`;

  // Contadores por cohorte (Generación)
  const counters = {
    1: 1, // Entraron en 2025
    2: 1, // Entraron en 2024
    3: 1, // Entraron en 2023
  };

  const values = rows
    .map((line, index) => {
      const parts = line.split(",");
      if (parts.length < 3) return null;

      const grado = parts[0].trim();
      const grupoLetra = parts[1].trim();
      const nombre = parts.slice(2).join(",").trim();

      // Lógica de Matrícula: Año Ingreso (2 dígitos) + Consecutivo (4 dígitos)
      let yearPrefix = "25"; // Default 1ro
      if (grado === "2") yearPrefix = "24";
      if (grado === "3") yearPrefix = "23";

      const count = counters[grado] || 1;
      if (counters[grado]) counters[grado]++; // Increment counter for this grade

      // Ejemplo: 250001, 240150
      const matricula = `${yearPrefix}${count.toString().padStart(4, "0")}`;

      // Formato Grupo: "1º A"
      const grupoFinal = `${grado}º ${grupoLetra}`;

      // Escape single quotes in names
      const nombreSafe = nombre.replace(/'/g, "''");

      return `('${matricula}', '${nombreSafe}', '${grupoFinal}')`;
    })
    .filter((v) => v !== null);

  sqlContent += values.join(",\n") + ";\n";

  // Add Conflict handling just in case
  sqlContent += `
-- Opcional: Si quieres ignorar duplicados de matricula, cambia el INSERT arriba por:
-- INSERT INTO ... VALUES ... ON CONFLICT (matricula) DO NOTHING;
`;

  fs.writeFileSync(outputPath, sqlContent);
  console.log(`✅ Archivo SQL generado exitosamente en: ${outputPath}`);
  console.log(`Total registros procesados: ${values.length}`);
} catch (err) {
  console.error("Error procesando el CSV:", err);
}
