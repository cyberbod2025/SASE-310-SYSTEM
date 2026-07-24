import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  resolve(process.cwd(), "api/notifications/whatsapp.ts"),
  "utf8",
).toLowerCase();

describe("Endpoint seguro de notificaciones a tutores", () => {
  it("acepta solo incidentId y deriva los datos institucionales en servidor", () => {
    expect(source).toContain('const allowed_fields = new set(["incidentid"])');
    expect(source).toContain("const { incidentid } = body");
    expect(source).not.toMatch(/const\s*\{\s*to(?:\s|,|})/);
    expect(source).not.toMatch(/const\s*\{\s*message(?:\s|,|})/);
    expect(source).not.toContain("studentname?:");
    expect(source).not.toContain("incidenttype?:");
    expect(source).toContain('"iniciar_notificacion_whatsapp"');
  });

  it("autoriza con el perfil canónico activo y seguro, sin fallback legado", () => {
    expect(source).toContain('.from("perfiles_usuario")');
    expect(source).toContain('.eq("estado_cuenta", "activo")');
    expect(source).toContain('.eq("seguridad_status", "active")');
    expect(source).not.toContain('.from("profiles")');
    expect(source).toContain("supabase_service_role_key");
    expect(source).toContain("isratelimited");
  });

  it("resuelve cada intento y nunca presenta la simulación como entrega", () => {
    expect(source).toContain('"resolver_notificacion_whatsapp"');
    expect(source).toContain('"simulado"');
    expect(source).toContain("delivered: false");
    expect(source).toContain('"enviado"');
    expect(source).toContain("delivered: true");
    expect(source).not.toContain("console.log");
    expect(source).not.toContain("mock_whatsapp");
  });

  it("usa contenido derivado por la RPC y no lo escribe en bitácoras", () => {
    expect(source).toContain("startrow.destinatario");
    expect(source).toContain("startrow.alumno_nombre");
    expect(source).toContain("startrow.incidencia_tipo");
    expect(source).not.toMatch(
      /console\.(?:error|warn|info)\([^)]*destinatario/,
    );
  });
});
