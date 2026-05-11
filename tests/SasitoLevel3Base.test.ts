import { describe, expect, it } from "vitest";
import { AppModule, CaseState, UserRole, type Student } from "../src/types";
import { detectSasitoIntent } from "../src/components/ai/sasito/sasitoIntentEngine";
import { resolveSasitoAction } from "../src/components/ai/sasito/sasitoActionCatalog";
import { buildSasitoContext } from "../src/components/ai/sasito/sasitoContextProvider";
import { createSasitoBridgeResponse, isSasitoL3Enabled, trySasitoL3Bridge } from "../src/components/ai/sasito/sasitoBridge";

const valentina: Student = {
  id: "student-valentina",
  matricula: "VAL-001",
  name: "Valentina Rios",
  group: "3B",
  avatar: "/SASE_ICON.png",
  caseState: CaseState.OBSERVADO,
  incidents: [],
  justificantes: [],
};

const buildContext = (overrides: Parameters<typeof buildSasitoContext>[0] = {}) =>
  buildSasitoContext({
    currentUserRole: UserRole.ORIENTACION,
    students: [valentina],
    ...overrides,
  });

describe("Sasito Nivel 3 intent engine deterministico", () => {
  it("detecta registrar incidencia como open_quick_register", () => {
    const result = detectSasitoIntent({ text: "Necesito registrar incidencia", context: buildContext() });

    expect(result.intent).toBe("open_quick_register");
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it("detecta buscar a Valentina como search_student", () => {
    const result = detectSasitoIntent({ text: "buscar a Valentina Rios", context: buildContext() });

    expect(result.intent).toBe("search_student");
    expect(result.entities.studentId).toBe(valentina.id);
    expect(result.entities.source).toBe("explicit_text");
  });

  it("detecta abrir expediente de Valentina como open_student_record", () => {
    const result = detectSasitoIntent({ text: "abrir expediente de Valentina Rios", context: buildContext() });

    expect(result.intent).toBe("open_student_record");
    expect(result.moduleTarget).toBe(AppModule.EXPEDIENTES);
    expect(result.entities.studentId).toBe(valentina.id);
  });

  it("detecta ver salud del alumno como open_health_module usando selectedStudent", () => {
    const context = buildContext({ selectedStudent: { id: valentina.id, name: valentina.name, group: valentina.group } });
    const result = detectSasitoIntent({ text: "ver salud del alumno", context });

    expect(result.intent).toBe("open_health_module");
    expect(result.moduleTarget).toBe(AppModule.SALUD);
    expect(result.entities.studentId).toBe(valentina.id);
    expect(result.entities.source).toBe("selected_context");
  });

  it("detecta casos de orientacion como open_orientation_cases", () => {
    const result = detectSasitoIntent({ text: "casos de orientación", context: buildContext() });

    expect(result.intent).toBe("open_orientation_cases");
    expect(result.moduleTarget).toBe(AppModule.REPORTES);
  });

  it("detecta diagnostico colectivo como open_collective_diagnosis", () => {
    const result = detectSasitoIntent({ text: "Abrir diagnóstico colectivo para 2B", context: buildContext() });

    expect(result.intent).toBe("open_collective_diagnosis");
    expect(result.moduleTarget).toBe(AppModule.DIAGNOSTICO);
    expect(result.entities.group).toBe("2B");
  });

  it("detecta notificaciones como show_notifications", () => {
    const result = detectSasitoIntent({ text: "ver notificaciones", context: buildContext() });

    expect(result.intent).toBe("show_notifications");
    expect(result.moduleTarget).toBe(AppModule.NOTIFICATIONS);
  });

  it("detecta que sigue como explain_next_step", () => {
    const result = detectSasitoIntent({ text: "¿Qué sigue con este caso?", context: buildContext() });

    expect(result.intent).toBe("explain_next_step");
  });

  it("devuelve unknown para texto ambiguo", () => {
    const result = detectSasitoIntent({ text: "abre cualquier cosa", context: buildContext() });

    expect(result.intent).toBe("unknown");
    expect(result.confidence).toBeLessThan(0.65);
  });

  it("no inventa alumno cuando students esta vacio", () => {
    const context = buildContext({ students: [] });
    const result = detectSasitoIntent({ text: "buscar a Valentina", context });

    expect(result.intent).toBe("search_student");
    expect(result.entities.studentId).toBeUndefined();
  });
});

describe("Sasito Nivel 3 RBAC y resolucion segura", () => {
  it("rol autorizado recibe allow para abrir expediente con alumno", () => {
    const context = buildContext({ currentUserRole: UserRole.ORIENTACION });
    const intent = detectSasitoIntent({ text: "abrir expediente de Valentina Rios", context });
    const action = resolveSasitoAction(intent, context);

    expect(action.decision).toBe("allow");
    expect(action.executionType).toBe("navigate");
    expect(action.moduleTarget).toBe(AppModule.EXPEDIENTES);
  });

  it("rol no autorizado recibe deny", () => {
    const context = buildContext({ currentUserRole: UserRole.ALUMNO });
    const intent = detectSasitoIntent({ text: "abrir expediente de Valentina Rios", context });
    const action = resolveSasitoAction(intent, context);

    expect(action.decision).toBe("deny");
    expect(action.executionType).toBe("deny");
    expect(action.moduleTarget).toBeUndefined();
  });

  it("alumno y guest no abren registro rapido", () => {
    for (const role of [UserRole.ALUMNO, UserRole.GUEST]) {
      const context = buildContext({ currentUserRole: role });
      const intent = detectSasitoIntent({ text: "registrar incidencia", context });
      const action = resolveSasitoAction(intent, context);

      expect(action.decision).toBe("deny");
      expect(action.executionType).toBe("deny");
      expect(action.moduleTarget).toBeUndefined();
    }
  });

  it("docente autorizado recibe allow para Registro Rapido sin ejecutar", () => {
    const context = buildContext({ currentUserRole: UserRole.DOCENTE });
    const intent = detectSasitoIntent({ text: "registrar incidencia", context });
    const action = resolveSasitoAction(intent, context);

    expect(action.decision).toBe("allow");
    expect(action.executionType).toBe("open_modal");
  });

  it("docente sin can_view_sensitive no abre Salud", () => {
    const context = buildContext({ currentUserRole: UserRole.DOCENTE, selectedStudent: { id: valentina.id, name: valentina.name, group: valentina.group } });
    const intent = detectSasitoIntent({ text: "ver salud del alumno", context });
    const action = resolveSasitoAction(intent, context);

    expect(action.decision).toBe("deny");
    expect(action.denialReason).toBe("permission");
    expect(action.moduleTarget).toBeUndefined();
  });

  it("roles no autorizados no abren Diagnostico Colectivo", () => {
    const context = buildContext({ currentUserRole: UserRole.ORIENTACION });
    const intent = detectSasitoIntent({ text: "diagnostico colectivo", context });
    const action = resolveSasitoAction(intent, context);

    expect(action.decision).toBe("deny");
    expect(action.executionType).toBe("deny");
    expect(action.moduleTarget).toBeUndefined();
  });

  it("sin selectedCase, que sigue pide seleccionar caso", () => {
    const context = buildContext({ currentUserRole: UserRole.ORIENTACION, selectedCase: null });
    const intent = detectSasitoIntent({ text: "que sigue", context });
    const action = resolveSasitoAction(intent, context);

    expect(action.decision).toBe("needs_context");
    expect(action.executionType).toBe("suggest_only");
    expect(action.effectiveMessage).toMatch(/Selecciona un caso institucional/i);
  });

  it("selectedCase habilita explain_next_step como suggest_only", () => {
    const context = buildContext({
      currentUserRole: UserRole.ORIENTACION,
      selectedCase: { id: "case-1", studentId: valentina.id, studentName: valentina.name, status: "abierto" },
    });
    const intent = detectSasitoIntent({ text: "que sigue con este caso", context });
    const action = resolveSasitoAction(intent, context);

    expect(intent.entities.caseId).toBe("case-1");
    expect(action.decision).toBe("suggest_only");
    expect(action.effectiveMessage).not.toMatch(/Selecciona un caso institucional antes/i);
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

  it("con flag activa detecta Registro Rapido y responde como accion permitida para docente", () => {
    const response = trySasitoL3Bridge({
      text: "registrar incidencia",
      currentUserRole: UserRole.DOCENTE,
      env: { VITE_ENABLE_SASITO_L3: "true" },
    });

    expect(response).not.toBeNull();
    expect(response?.intent.intent).toBe("open_quick_register");
    expect(response?.decision).toBe("allow");
    expect(response?.action.executionType).toBe("open_modal");
    expect(response?.text).toMatch(/no abrire modales automaticamente/i);
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
    expect(response?.decision).toBe("deny");
    expect(response?.action.executionType).toBe("deny");
    expect(response?.state).toBe("alert");
    expect(response?.text).toMatch(/no tiene autorizado/i);
    expect(response?.didExecuteAction).toBe(false);
  });

  it("con flag activa detecta Diagnostico Colectivo sin navegar automaticamente", () => {
    const response = trySasitoL3Bridge({
      text: "diagnostico colectivo para 3C",
      currentUserRole: UserRole.DOCENTE,
      env: { VITE_ENABLE_SASITO_L3: "true" },
    });

    expect(response).not.toBeNull();
    expect(response?.intent.intent).toBe("open_collective_diagnosis");
    expect(response?.intent.entities.group).toBe("3C");
    expect(response?.action.moduleTarget).toBe(AppModule.DIAGNOSTICO);
    expect(response?.action.executionType).toBe("navigate");
    expect(response?.text).toMatch(/no navegare automaticamente/i);
    expect(response?.didExecuteAction).toBe(false);
  });

  it("con flag activa pide contexto para que sigue si no hay caso", () => {
    const response = trySasitoL3Bridge({
      text: "que sigue",
      currentUserRole: UserRole.ORIENTACION,
      env: { VITE_ENABLE_SASITO_L3: "true" },
    });

    expect(response).not.toBeNull();
    expect(response?.intent.intent).toBe("explain_next_step");
    expect(response?.decision).toBe("needs_context");
    expect(response?.text).toMatch(/Selecciona un caso institucional/i);
    expect(response?.didExecuteAction).toBe(false);
  });

  it("notificaciones vacio no inventa pendientes", () => {
    const response = createSasitoBridgeResponse({
      text: "ver notificaciones",
      currentUserRole: UserRole.DOCENTE,
      notifications: [],
    });

    expect(response.intent.intent).toBe("show_notifications");
    expect(response.text).toMatch(/No detecto notificaciones pendientes/i);
    expect(response.didExecuteAction).toBe(false);
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
    expect(response?.decision).toBe("deny");
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
    expect(response.plan.didExecuteAction).toBe(false);
  });
});
