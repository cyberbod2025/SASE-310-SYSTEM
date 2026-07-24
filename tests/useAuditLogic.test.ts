import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "../src/types";

const mocks = vi.hoisted(() => ({
  registerAuditEvent: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock(
  "../src/components/auditoria/auditoriaPersistence",
  () => ({
    registerAuditEvent: mocks.registerAuditEvent,
  }),
);

vi.mock("react-hot-toast", () => ({
  default: { error: mocks.toastError },
}));

vi.mock("../src/supabase/client", () => ({
  supabase: { rpc: vi.fn() },
}));

import { useAuditLogic } from "../src/store/slices/useAuditLogic";

describe("useAuditLogic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.registerAuditEvent.mockResolvedValue("event-1");
  });

  it("no oculta ni suplanta la identidad del rol developer", async () => {
    const audit = useAuditLogic(
      { id: "developer-1", email: "dev@sase.mx" },
      UserRole.DEVELOPER,
    );

    await audit.logAudit(
      "CONSULTA",
      "Consultó un expediente.",
      "alumnos",
      "62f3a74c-cc15-4d59-a09d-5df4e8780a5a",
      "Alumna",
    );

    expect(mocks.registerAuditEvent).toHaveBeenCalledWith({
      actionType: "CONSULTA",
      description: "Consultó un expediente.",
      targetTable: "alumnos",
      targetRecordId: "62f3a74c-cc15-4d59-a09d-5df4e8780a5a",
      purpose: "Consulta autorizada para acompañamiento institucional",
      studentId: "62f3a74c-cc15-4d59-a09d-5df4e8780a5a",
    });
    const payload = mocks.registerAuditEvent.mock.calls[0][0];
    expect(payload).not.toHaveProperty("userId");
    expect(payload).not.toHaveProperty("userEmail");
    expect(payload).not.toHaveProperty("userRole");
    expect(JSON.stringify(payload)).not.toContain("oculto");
    expect(JSON.stringify(payload)).not.toContain("system@esd-310.mx");
  });

  it("informa cuando no se confirma la trazabilidad", async () => {
    mocks.registerAuditEvent.mockRejectedValueOnce(new Error("RLS denied"));
    const audit = useAuditLogic(null, UserRole.DOCENTE);

    await audit.logAudit(
      "CREACION",
      "Registró una incidencia.",
      "incidencias",
      "incident-1",
    );

    expect(mocks.toastError).toHaveBeenCalledWith(
      "La acción pudo completarse, pero no se confirmó su trazabilidad.",
    );
  });
});
