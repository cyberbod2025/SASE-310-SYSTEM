import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  resolve(process.cwd(), "api/ai/distribucion.ts"),
  "utf8",
).toLowerCase();

describe("Endpoint de distribución escolar - invariantes de seguridad", () => {
  it("falla cerrado y autoriza con el perfil institucional canónico", () => {
    expect(source).toContain("orígenes cors no configurados");
    expect(source).toContain("origen no permitido");
    expect(source).toContain("auth.getuser(accesstoken)");
    expect(source).toContain('.from("perfiles_usuario")');
    expect(source).toContain('.eq("estado_cuenta", "activo")');
    expect(source).toContain('.eq("seguridad_status", "active")');
    expect(source).not.toContain('.from("profiles")');
    expect(source).not.toContain("vite_supabase");
  });

  it("limita rol, frecuencia y cuerpo antes de consultar el ciclo", () => {
    expect(source).toContain(
      'const allowed_fields = new set(["cycleid", "purpose"])',
    );
    expect(source).toContain("rol institucional no autorizado");
    expect(source).toContain("isratelimited(`distribucion:${ratekey}`");
    expect(source).toContain("identificador de ciclo inválido");
    expect(source).toContain("propósito inválido");

    const authenticationIndex = source.indexOf("auth.getuser(accesstoken)");
    const cycleQueryIndex = source.indexOf('.from("ciclos_escolares")');
    expect(authenticationIndex).toBeGreaterThan(-1);
    expect(cycleQueryIndex).toBeGreaterThan(authenticationIndex);
  });

  it("consulta campos mínimos y no extrae nombres, BAP ni datos de tutor", () => {
    expect(source).toContain(
      '.select("alumno_id, alumnos (puntaje_riesgo)")',
    );
    expect(source).not.toContain("nombre_completo");
    expect(source).not.toContain("datos_bap");
    expect(source).not.toContain("datos_tutor");
    expect(source).not.toContain("curp");
  });

  it("audita la propuesta y no persiste asignaciones", () => {
    expect(source).toContain('.from("auditoria").insert({');
    expect(source).toContain("sugerencia_distribucion_generada");
    expect(source).toContain("id_registro_objetivo: cycleid");
    expect(source).toContain("proposito: normalizedpurpose");
    expect(source).toContain('origen: "servidor"');
    expect(source).not.toContain('.from("alumno_ciclo").update(');
  });

  it("declara que el resultado es una propuesta humana y oculta errores internos", () => {
    expect(source).toContain("solo_propuesta: true");
    expect(source).toContain("requiere_aprobacion_humana: true");
    expect(source).not.toContain("error: error.message");
    expect(source).not.toContain("error: err.message");
  });
});
