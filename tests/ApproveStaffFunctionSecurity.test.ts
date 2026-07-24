import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const functionPath = resolve(
  process.cwd(),
  "supabase/functions/approve-staff/index.ts",
);
const source = readFileSync(functionPath, "utf8");
const normalized = source.toLowerCase();

describe("approve-staff security invariants", () => {
  it("autoriza únicamente con el perfil institucional activo y seguro", () => {
    expect(normalized).toContain('.from("perfiles_usuario")');
    expect(normalized).toContain('.eq("estado_cuenta", "activo")');
    expect(normalized).toContain('.eq("seguridad_status", "active")');
    expect(normalized).not.toContain('.from("profiles")');
    expect(normalized).not.toContain('"admin",');
    expect(normalized).toContain("institutional_email_pattern");
  });

  it("resuelve aprobar y rechazar mediante RPC transaccionales", () => {
    expect(normalized).toContain('"finalizar_aprobacion_personal"');
    expect(normalized).toContain('"rechazar_solicitud_personal"');
    expect(normalized).not.toContain('.from("perfiles_usuario")\n      .upsert');
    expect(normalized).not.toContain(
      '.from("solicitudes_alta_personal")\n      .update',
    );
    expect(normalized).not.toContain('.from("auditoria").insert');
  });

  it("compensa una invitación nueva si falla la transacción", () => {
    expect(normalized).toContain('status === "invited"');
    expect(normalized).toContain("supabase.auth.admin.deleteuser(userid)");
    expect(normalized).toContain("no se pudo compensar la invitación auth");
  });

  it("no concede cuentas técnicas mediante solicitudes públicas", () => {
    const approvableRoles =
      source.match(/const APPROVABLE_ROLES = new Set\(\[([\s\S]*?)\]\);/)?.[1] ??
      "";
    expect(approvableRoles).not.toContain('"developer"');
    expect(approvableRoles).not.toContain('"system_admin"');
    expect(normalized).not.toContain("sim-");
    expect(normalized).not.toContain('"create-user"');
  });
});
