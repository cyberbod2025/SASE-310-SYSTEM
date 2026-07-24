import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const securitySource = readFileSync(
  resolve(process.cwd(), "server/aiSecurity.ts"),
  "utf8",
).toLowerCase();
const geminiSource = readFileSync(
  resolve(process.cwd(), "api/ai/gemini.ts"),
  "utf8",
).toLowerCase();
const openRouterSource = readFileSync(
  resolve(process.cwd(), "api/ai/openrouter.ts"),
  "utf8",
).toLowerCase();

describe("Proxies de IA gobernados", () => {
  it("exige perfil canónico activo, seguro y una lista cerrada de campos", () => {
    expect(securitySource).toContain('.from("perfiles_usuario")');
    expect(securitySource).toContain('.eq("estado_cuenta", "activo")');
    expect(securitySource).toContain(
      '.eq("seguridad_status", "active")',
    );
    expect(securitySource).not.toContain('.from("profiles")');
    expect(securitySource).toContain(
      '"prompt",\n  "model",\n  "purpose",\n  "contexttype"',
    );
    expect(securitySource).toContain("containssensitivepersonaldata(prompt)");
    expect(securitySource).toContain("ia-institucional:${ratekey}");
  });

  it("audita sin conservar prompt ni respuesta", () => {
    expect(securitySource).toContain("ia_solicitud_autorizada");
    expect(securitySource).toContain("ia_respuesta_recibida");
    expect(securitySource).toContain("ia_proveedor_fallido");
    const newValues =
      securitySource.match(/new_values:\s*\{([\s\S]*?)\n\s*\},\n\s*\}\);/)
        ?.[1] || "";
    expect(newValues).toContain("caracteres_entrada");
    expect(newValues).toContain("caracteres_salida");
    expect(newValues).not.toContain("request.prompt");
    expect(newValues).not.toContain("text:");
  });

  it("Gemini audita antes de contactar al proveedor y devuelve solo borradores", () => {
    const auditIndex = geminiSource.indexOf(
      '"ia_solicitud_autorizada"',
    );
    const fetchIndex = geminiSource.indexOf("await fetch(");
    expect(auditIndex).toBeGreaterThan(-1);
    expect(fetchIndex).toBeGreaterThan(auditIndex);
    expect(geminiSource).toContain(
      "authorizeinstitutionalairequest",
    );
    expect(geminiSource).toContain("draft: true");
    expect(geminiSource).not.toContain("errordata");
    expect(geminiSource).not.toContain("statustext");
  });

  it("OpenRouter audita antes de contactar al proveedor y no filtra errores crudos", () => {
    const auditIndex = openRouterSource.indexOf(
      '"ia_solicitud_autorizada"',
    );
    const fetchIndex = openRouterSource.indexOf("await fetch(");
    expect(auditIndex).toBeGreaterThan(-1);
    expect(fetchIndex).toBeGreaterThan(auditIndex);
    expect(openRouterSource).toContain(
      "authorizeinstitutionalairequest",
    );
    expect(openRouterSource).toContain("draft: true");
    expect(openRouterSource).not.toContain("errordata");
    expect(openRouterSource).not.toContain("statustext");
  });
});
