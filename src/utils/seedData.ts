// seedData.ts — Deshabilitado para producción
// Los datos reales se gestionan directamente desde Supabase.
// Este archivo se mantiene como referencia de estructura.

export const seedDatabase = async () => {
  console.warn(
    "⚠️ seedDatabase está deshabilitado en producción. Los datos se gestionan desde Supabase.",
  );
  return { success: ["Seed deshabilitado en producción"], errors: [] };
};
