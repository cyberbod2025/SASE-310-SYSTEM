const fs = require("fs");
const path = require("path");

const csvPath = "C:\\Users\\cyber\\Desktop\\ALUMNOS_205-2026.CSV";

try {
  const content = fs.readFileSync(csvPath, "utf8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

  const groupsFound = new Set();
  const names = {};
  const duplicates = [];

  // Skip header line 0
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts.length < 3) continue;

    const gr = parts[0].trim();
    const gp = parts[1].trim();
    const name = parts.slice(2).join(",").trim();

    groupsFound.add(`${gr}-${gp}`);

    // Check for duplicates
    if (names[name]) {
      duplicates.push({ name, loc1: names[name], loc2: `${gr}-${gp}` });
    } else {
      names[name] = `${gr}-${gp}`;
    }
  }

  // Define expected groups
  const expectedGroups = [];
  ["1", "2", "3"].forEach((grade) => {
    ["A", "B", "C", "D"].forEach((letter) => {
      expectedGroups.push(`${grade}-${letter}`);
    });
  });

  const foundArray = Array.from(groupsFound);
  const missing = expectedGroups.filter((g) => !foundArray.includes(g));

  console.log("--- RESUMEN DEL CSV ---");
  console.log(`Total de Alumnos: ${lines.length - 1}`);
  console.log(`Grupos Encontrados: ${foundArray.sort().join(", ")}`);

  if (missing.length > 0) {
    console.log(`\n❌ FALTAN ESTOS GRUPOS: ${missing.join(", ")}`);
    // check partials
    const missingGrades = [...new Set(missing.map((m) => m.split("-")[0]))];
    if (missingGrades.length > 0) {
      console.log("   (Parece que faltan secciones enteras de 3er grado)");
    }
  } else {
    console.log("\n✅ ESTÁN LOS 12 GRUPOS COMPLETOS (1º A-D, 2º A-D, 3º A-D)");
  }

  console.log("\n--- VERIFICACIÓN DE DUPLICADOS ---");
  if (duplicates.length === 0) {
    console.log("✅ 0 Duplicados encontrados. La lista está limpia.");
  } else {
    console.log(`⚠️ SE ENCONTRARON ${duplicates.length} DUPLICADOS:`);
    duplicates
      .slice(0, 10)
      .forEach((d) => console.log(`   - ${d.name} (en ${d.loc1} y ${d.loc2})`));
    if (duplicates.length > 10)
      console.log(`   ... y ${duplicates.length - 10} más.`);
  }
} catch (err) {
  console.error("Error leyendo el archivo:", err);
}
