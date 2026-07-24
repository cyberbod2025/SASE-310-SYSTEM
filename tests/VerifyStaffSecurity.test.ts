import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const verifySource = readFileSync(
  resolve(process.cwd(), "api/auth/verify-staff.ts"),
  "utf8",
).toLowerCase();
const registerSource = readFileSync(
  resolve(process.cwd(), "api/auth/register-staff.ts"),
  "utf8",
).toLowerCase();

describe("API de registro de personal", () => {
  it("consulta la nómina por el índice y selecciona únicamente el rol", () => {
    expect(verifySource).toContain('.select("role")');
    expect(verifySource).toContain('.in("full_name_normalized", namecandidates)');
    expect(verifySource).toContain('.eq("is_active", true)');
    expect(verifySource).not.toContain('.select("full_name');
    expect(verifySource).not.toContain("(data || []).find");
    expect(verifySource).not.toContain('"developer"');
    expect(verifySource).not.toContain('"system_admin"');
  });

  it("persiste desde el servidor con rate limit y RPC exclusiva", () => {
    expect(registerSource).toContain("isratelimited");
    expect(registerSource).toContain("supabase_service_role_key");
    expect(registerSource).toContain(
      '.rpc("registrar_solicitud_personal"',
    );
    expect(registerSource).not.toContain(
      '.from("solicitudes_alta_personal")',
    );
    expect(registerSource).toContain("allowed_fields");
    expect(registerSource).not.toContain('"password",');
    expect(registerSource).not.toContain('"preguntasseguridad",');
  });
});
