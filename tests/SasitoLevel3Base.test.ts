import { describe, expect, it } from "vitest";
import { AppModule, UserRole } from "../src/types";
import { detectSasitoIntent } from "../src/components/ai/sasito/sasitoIntentEngine";
import { resolveSasitoAction } from "../src/components/ai/sasito/sasitoActionCatalog";
import { buildSasitoContext } from "../src/components/ai/sasito/sasitoContextProvider";

describe("Sasito Nivel 3 base", () => {
  it("detecta registrar incidencia como open_quick_register", () => {
    const context = buildSasitoContext({ currentUserRole: UserRole.DOCENTE });
    const result = detectSasitoIntent({ text: "Necesito registrar incidencia", context });

    expect(result.intent).toBe("open_quick_register");
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it("detecta diagnostico colectivo como open_collective_diagnosis", () => {
    const context = buildSasitoContext({ currentUserRole: UserRole.DOCENTE });
    const result = detectSasitoIntent({ text: "Abrir diagnóstico colectivo", context });

    expect(result.intent).toBe("open_collective_diagnosis");
    expect(result.moduleTarget).toBe(AppModule.DIAGNOSTICO);
  });

  it("detecta que sigue como explain_next_step", () => {
    const context = buildSasitoContext({ currentUserRole: UserRole.ORIENTACION });
    const result = detectSasitoIntent({ text: "¿Qué sigue con este caso?", context });

    expect(result.intent).toBe("explain_next_step");
  });

  it("ALUMNO recibe deny para Registro Rapido", () => {
    const context = buildSasitoContext({ currentUserRole: UserRole.ALUMNO });
    const intent = detectSasitoIntent({ text: "registrar incidencia", context });
    const action = resolveSasitoAction(intent, context);

    expect(action.executionType).toBe("deny");
    expect(action.moduleTarget).toBeUndefined();
  });

  it("GUEST recibe deny para Registro Rapido", () => {
    const context = buildSasitoContext({ currentUserRole: UserRole.GUEST });
    const intent = detectSasitoIntent({ text: "registrar incidencia", context });
    const action = resolveSasitoAction(intent, context);

    expect(action.executionType).toBe("deny");
    expect(action.moduleTarget).toBeUndefined();
  });

  it("docente recibe open_modal para Registro Rapido", () => {
    const context = buildSasitoContext({ currentUserRole: UserRole.DOCENTE });
    const intent = detectSasitoIntent({ text: "registrar incidencia", context });
    const action = resolveSasitoAction(intent, context);

    expect(action.executionType).toBe("open_modal");
    expect(action.id).toBe("open_quick_register");
  });

  it("accion no autorizada no navega ni abre modal", () => {
    const context = buildSasitoContext({ currentUserRole: UserRole.DOCENTE });
    const intent = detectSasitoIntent({ text: "abrir modulo de salud", context });
    const action = resolveSasitoAction(intent, context);

    expect(action.executionType).toBe("deny");
    expect(action.executionType).not.toBe("navigate");
    expect(action.executionType).not.toBe("open_modal");
    expect(action.moduleTarget).toBeUndefined();
  });
});
