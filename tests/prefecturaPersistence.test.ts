import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("../src/supabase/client", () => ({
  supabase: {
    auth: { getUser: mocks.getUser },
    rpc: mocks.rpc,
  },
}));

import { referStudentToOrientation } from "../src/components/prefectura/prefecturaPersistence";

describe("prefecturaPersistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "prefectura-user" } },
      error: null,
    });
    mocks.rpc.mockResolvedValue({
      data: [{
        caso_id: "case-1",
        responsable_id: "orientation-1",
        responsable_nombre: "Orientadora Activa",
        caso_existente: true,
      }],
      error: null,
    });
  });

  it("devuelve el caso y responsable confirmados por el RPC", async () => {
    const result = await referStudentToOrientation({
      studentId: "student-1",
      reason: "  Seguimiento de acuerdos.  ",
      summary: "  Referencia documentada.  ",
      priority: "alta",
    });

    expect(mocks.rpc).toHaveBeenCalledWith("referir_caso_orientacion", {
      p_alumno_id: "student-1",
      p_motivo: "Seguimiento de acuerdos.",
      p_resumen: "Referencia documentada.",
      p_prioridad: "alta",
    });
    expect(result).toEqual({
      caseId: "case-1",
      responsibleId: "orientation-1",
      responsibleName: "Orientadora Activa",
      reusedOpenCase: true,
    });
  });

  it("falla cerrado sin sesión y propaga denegaciones del RPC", async () => {
    mocks.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    await expect(referStudentToOrientation({
      studentId: "student-1",
      reason: "No debe enviarse.",
      priority: "media",
    })).rejects.toThrow("La sesión institucional no está disponible.");
    expect(mocks.rpc).not.toHaveBeenCalled();

    mocks.rpc.mockResolvedValueOnce({
      data: null,
      error: { code: "42501", message: "RLS denied" },
    });
    await expect(referStudentToOrientation({
      studentId: "student-1",
      reason: "Referencia rechazada.",
      priority: "media",
    })).rejects.toMatchObject({ code: "42501" });
  });

  it("no acepta una respuesta sin caso o responsable confirmado", async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    await expect(referStudentToOrientation({
      studentId: "student-1",
      reason: "Referencia sin confirmación.",
      priority: "media",
    })).rejects.toThrow(
      "Supabase no confirmó la canalización a Orientación.",
    );
  });
});
