import { describe, expect, it } from "vitest";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function readRepoFile(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("Feria Edge security contract", () => {
  it("prepara revocación sin ejecutarla en migraciones", () => {
    const migration = readRepoFile("supabase/migrations/20260502011206_feria_edge_security.sql");
    const revokeScript = readRepoFile("supabase/sql/feria_rpc_revoke_after_edge_cutover.sql");

    expect(migration).not.toContain(
      "revoke execute on function public.registrar_progreso_v2(uuid, uuid, integer) from authenticated;",
    );
    expect(migration).not.toContain(
      "revoke execute on function public.finalizar_trivia_v2(uuid, uuid, integer) from authenticated;",
    );
    expect(revokeScript).toContain(
      "revoke execute on function public.registrar_progreso_v2(uuid, uuid, integer) from authenticated;",
    );
    expect(revokeScript).toContain(
      "revoke execute on function public.finalizar_trivia_v2(uuid, uuid, integer) from authenticated;",
    );
  });

  it("usa sesiones opacas e internas de Edge en lugar de RPCs legacy", () => {
    const migration = readRepoFile("supabase/migrations/20260502011206_feria_edge_security.sql");
    const progress = readRepoFile("supabase/functions/student-progress/index.ts");
    const finishTrivia = readRepoFile("supabase/functions/student-finish-trivia/index.ts");
    const progressGet = readRepoFile("supabase/functions/student-progress-get/index.ts");

    expect(migration).toContain("token_hash text not null unique");
    expect(migration).toContain("grant execute on function public.internal_feria_registrar_progreso");
    expect(migration).toContain("grant execute on function public.internal_feria_finalizar_trivia");
    expect(progress).toContain("resolveStudentSession");
    expect(progress).toContain('rpc("internal_feria_registrar_progreso"');
    expect(finishTrivia).toContain("evaluateTriviaAnswers");
    expect(finishTrivia).toContain('rpc("internal_feria_finalizar_trivia"');
    expect(progressGet).toContain('rpc("internal_feria_get_progress"');
    expect(progress).not.toContain('rpc("registrar_progreso_v2"');
    expect(finishTrivia).not.toContain('rpc("finalizar_trivia_v2"');
  });

  it("declara funciones con autenticación propia explícita", () => {
    const config = readRepoFile("supabase/config.toml");

    for (const name of [
      "student-login",
      "student-progress",
      "student-finish-trivia",
      "student-progress-get",
    ]) {
      expect(config).toContain(`[functions.${name}]\nverify_jwt = false`);
    }
  });
});
