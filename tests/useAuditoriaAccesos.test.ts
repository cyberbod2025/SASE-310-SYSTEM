import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

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

import { useAuditoriaAccesos } from "../src/hooks/useAuditoriaAccesos";

describe("useAuditoriaAccesos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.registerAuditEvent.mockResolvedValue("audit-1");
  });

  it("registra el alumno y propósito sin aceptar identidad del cliente", async () => {
    const { result } = renderHook(() => useAuditoriaAccesos());

    await expect(
      result.current.logAccess({
        accion: "abrir_expediente_institucional",
        alumno_id: "62f3a74c-cc15-4d59-a09d-5df4e8780a5a",
        pantalla: "ExpedienteInstitucional",
      }),
    ).resolves.toBe(true);

    expect(mocks.registerAuditEvent).toHaveBeenCalledWith({
      actionType: "ACCESO_SENSIBLE_ABRIR_EXPEDIENTE_INSTITUCIONAL",
      description:
        "Acceso sensible confirmado desde ExpedienteInstitucional.",
      targetTable: "alumnos",
      targetRecordId: "62f3a74c-cc15-4d59-a09d-5df4e8780a5a",
      purpose:
        "Trazabilidad de acceso a información estudiantil sensible",
      studentId: "62f3a74c-cc15-4d59-a09d-5df4e8780a5a",
    });
    const payload = mocks.registerAuditEvent.mock.calls[0][0];
    expect(payload).not.toHaveProperty("usuario");
    expect(payload).not.toHaveProperty("rol");
    expect(payload).not.toHaveProperty("fecha");
    expect(payload).not.toHaveProperty("hora");
  });

  it("no presenta éxito cuando la trazabilidad falla", async () => {
    mocks.registerAuditEvent.mockRejectedValueOnce(new Error("RLS denied"));
    const { result } = renderHook(() => useAuditoriaAccesos());

    await expect(
      result.current.logAccess({
        accion: "consultar_alerta_medica",
        alumno_id: "student-1",
      }),
    ).resolves.toBe(false);

    expect(mocks.toastError).toHaveBeenCalledWith(
      "No se confirmó la trazabilidad del acceso sensible.",
    );
  });
});
