import { describe, expect, it } from "vitest";
import { AppModule, UserRole } from "../src/types";
import { detectSasitoIntent } from "../src/components/ai/sasito/sasitoIntentEngine";
import { resolveSasitoAction } from "../src/components/ai/sasito/sasitoActionCatalog";
import { buildSasitoContext } from "../src/components/ai/sasito/sasitoContextProvider";
import { createSasitoBridgeResponse, isSasitoL3Enabled, trySasitoL3Bridge } from "../src/components/ai/sasito/sasitoBridge";

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

describe("Sasito Nivel 3 bridge seguro", () => {
  it("permanece apagado por defecto y deja intacto el flujo legado", () => {
    expect(isSasitoL3Enabled({})).toBe(false);
    expect(isSasitoL3Enabled({ VITE_ENABLE_SASITO_L3: "false" })).toBe(false);

    const response = trySasitoL3Bridge({
      text: "registrar incidencia",
      currentUserRole: UserRole.DOCENTE,
      env: { VITE_ENABLE_SASITO_L3: "false" },
    });

    expect(response).toBeNull();
  });

  it("con flag activa detecta Registro Rapido y responde como sugerencia permitida para docente", () => {
    const response = trySasitoL3Bridge({
      text: "registrar incidencia",
      currentUserRole: UserRole.DOCENTE,
      env: { VITE_ENABLE_SASITO_L3: "true" },
    });

    expect(response).not.toBeNull();
    expect(response?.intent.intent).toBe("open_quick_register");
    expect(response?.action.executionType).toBe("open_modal");
    expect(response?.text).toMatch(/Puedo ayudarte a Abrir Registro Rapido/);
    expect(response?.didExecuteAction).toBe(false);
  });

  it("con flag activa captura incidencia generica antes del flujo legacy", () => {
    const response = trySasitoL3Bridge({
      text: "incidencia",
      currentUserRole: UserRole.DOCENTE,
      env: { VITE_ENABLE_SASITO_L3: "true" },
    });

    expect(response).not.toBeNull();
    expect(response?.intent.intent).toBe("open_quick_register");
    expect(response?.didExecuteAction).toBe(false);
  });

  it("con flag activa deniega Registro Rapido para alumno sin ejecutar acciones", () => {
    const response = trySasitoL3Bridge({
      text: "registrar incidencia",
      currentUserRole: UserRole.ALUMNO,
      env: { VITE_ENABLE_SASITO_L3: "true" },
    });

    expect(response).not.toBeNull();
    expect(response?.intent.intent).toBe("open_quick_register");
    expect(response?.action.executionType).toBe("deny");
    expect(response?.state).toBe("alert");
    expect(response?.text).toMatch(/no tiene autorizado/i);
    expect(response?.didExecuteAction).toBe(false);
  });

  it("con flag activa detecta Diagnostico Colectivo sin navegar automaticamente", () => {
    const response = trySasitoL3Bridge({
      text: "diagnostico colectivo",
      currentUserRole: UserRole.DOCENTE,
      env: { VITE_ENABLE_SASITO_L3: "true" },
    });

    expect(response).not.toBeNull();
    expect(response?.intent.intent).toBe("open_collective_diagnosis");
    expect(response?.action.moduleTarget).toBe(AppModule.DIAGNOSTICO);
    expect(response?.action.executionType).toBe("navigate");
    expect(response?.text).toMatch(/no navegare automaticamente/i);
    expect(response?.didExecuteAction).toBe(false);
  });

  it("con flag activa pide seleccionar caso para explicar que sigue", () => {
    const response = trySasitoL3Bridge({
      text: "que sigue",
      currentUserRole: UserRole.ORIENTACION,
      env: { VITE_ENABLE_SASITO_L3: "true" },
    });

    expect(response).not.toBeNull();
    expect(response?.intent.intent).toBe("explain_next_step");
    expect(response?.action.executionType).toBe("suggest_only");
    expect(response?.text).toMatch(/Selecciona un caso institucional/i);
    expect(response?.didExecuteAction).toBe(false);
  });

  it("con flag activa responde seguro para texto desconocido sin caer a acciones legacy", () => {
    const response = trySasitoL3Bridge({
      text: "abre cualquier cosa",
      currentUserRole: UserRole.DOCENTE,
      env: { VITE_ENABLE_SASITO_L3: "true" },
    });

    expect(response).not.toBeNull();
    expect(response?.handled).toBe(false);
    expect(response?.intent.intent).toBe("unknown");
    expect(response?.action.executionType).toBe("deny");
    expect(response?.didExecuteAction).toBe(false);
  });

  it("el bridge no recibe callbacks ni ejecuta acciones reales", () => {
    const response = createSasitoBridgeResponse({
      text: "abrir diagnostico colectivo",
      currentUserRole: UserRole.DOCENTE,
    });

    expect(response.safeMode).toBe(true);
    expect(response.didExecuteAction).toBe(false);
    expect(response.action.executionType).toBe("navigate");
  });
});
