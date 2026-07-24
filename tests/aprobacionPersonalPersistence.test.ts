import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  invoke: vi.fn(),
}));

vi.mock("../src/lib/supabaseClient", () => ({
  supabase: {
    auth: { getUser: mocks.getUser },
    functions: { invoke: mocks.invoke },
  },
}));

import {
  approveStaffRequest,
  rejectStaffRequest,
} from "../src/components/personal/aprobacionPersonalPersistence";

describe("aprobacionPersonalPersistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "approver-1" } },
      error: null,
    });
  });

  it("aprueba mediante una sola llamada canónica sin enviar actor ni permisos", async () => {
    mocks.invoke.mockResolvedValue({
      data: {
        approved: true,
        primaryRole: "docente_tutor",
        approvedRoles: ["docente", "docente_tutor"],
        userId: "user-1",
        alreadyExisted: false,
        metadataSynchronized: true,
      },
      error: null,
    });

    await expect(
      approveStaffRequest({
        requestId: "request-1",
        matriculaSase: "emp-310-001",
        grupos: [" 1a ", "1A"],
        materias: [" Matemáticas "],
        esTutor: true,
        grupoTutor: " 1a ",
      }),
    ).resolves.toMatchObject({
      approved: true,
      primaryRole: "docente_tutor",
      userId: "user-1",
    });

    expect(mocks.invoke).toHaveBeenCalledWith("approve-staff", {
      body: {
        action: "aprobar",
        solicitudId: "request-1",
        matricula_sase: "EMP-310-001",
        grupos: ["1A"],
        materias: ["Matemáticas"],
        es_tutor: true,
        grupo_tutor: "1A",
      },
    });
    const body = mocks.invoke.mock.calls[0][1].body;
    expect(body).not.toHaveProperty("aprobado_por");
    expect(body).not.toHaveProperty("rol");
    expect(body).not.toHaveProperty("permisos");
    expect(body).not.toHaveProperty("userId");
  });

  it("rechaza mediante el endpoint canónico y exige un motivo suficiente", async () => {
    mocks.invoke.mockResolvedValue({
      data: {
        approved: false,
        rejected: true,
        requestId: "request-2",
      },
      error: null,
    });

    await expect(
      rejectStaffRequest(
        "request-2",
        "La adscripción no pudo confirmarse documentalmente.",
      ),
    ).resolves.toEqual({
      approved: false,
      rejected: true,
      requestId: "request-2",
    });

    expect(mocks.invoke).toHaveBeenCalledWith("approve-staff", {
      body: {
        action: "rechazar",
        solicitudId: "request-2",
        reason: "La adscripción no pudo confirmarse documentalmente.",
      },
    });

    await expect(rejectStaffRequest("request-3", "breve")).rejects.toThrow(
      "entre 10 y 1000 caracteres",
    );
  });

  it("falla cerrado sin sesión y ante confirmaciones inválidas", async () => {
    mocks.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    await expect(
      approveStaffRequest({
        requestId: "request-1",
        matriculaSase: "EMP-310-001",
        grupos: [],
        materias: [],
        esTutor: false,
        grupoTutor: null,
      }),
    ).rejects.toThrow("La sesión institucional no está disponible.");
    expect(mocks.invoke).not.toHaveBeenCalled();

    mocks.invoke.mockResolvedValueOnce({ data: { approved: true }, error: null });
    await expect(
      approveStaffRequest({
        requestId: "request-1",
        matriculaSase: "EMP-310-001",
        grupos: [],
        materias: [],
        esTutor: false,
        grupoTutor: null,
      }),
    ).rejects.toThrow("no devolvió una confirmación válida");
  });
});
