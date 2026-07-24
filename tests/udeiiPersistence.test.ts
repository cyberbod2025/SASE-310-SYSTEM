import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const getUser = vi.fn();
  const queryResult = {
    data: [] as unknown[],
    error: null as unknown,
  };
  const order = vi.fn(() => Promise.resolve(queryResult));
  const inFilter = vi.fn(() => ({ order }));
  const select = vi.fn(() => ({ in: inFilter }));
  const from = vi.fn(() => ({ select }));
  const rpcSingle = vi.fn();
  const rpc = vi.fn(() => ({ single: rpcSingle }));

  return {
    from,
    getUser,
    inFilter,
    order,
    queryResult,
    rpc,
    rpcSingle,
    select,
  };
});

vi.mock("../src/supabase/client", () => ({
  supabase: {
    auth: { getUser: mocks.getUser },
    from: mocks.from,
    rpc: mocks.rpc,
  },
}));

import {
  loadBapTracking,
  persistBapEvent,
} from "../src/components/udeii/udeiiPersistence";

const persistedRow = {
  id: "bap-event-1",
  alumno_id: "student-1",
  tipo_evento: "ajuste",
  tipo_bap: "Barrera de acceso a textos",
  ajuste_razonable: "Material con tipografía ampliada",
  estatus: "en_seguimiento",
  observaciones: "Revisar respuesta en clase.",
  responsable: "Docente titular",
  fecha_revision: "2026-07-25",
  creado_por: "udeii-user",
  creado_en: "2026-07-18T16:00:00.000Z",
};

describe("udeiiPersistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "udeii-user" } },
      error: null,
    });
    mocks.queryResult.data = [];
    mocks.queryResult.error = null;
  });

  it("loads BAP history filtered to visible students", async () => {
    mocks.queryResult.data = [persistedRow];

    const records = await loadBapTracking(["student-1", "student-2"]);

    expect(mocks.from).toHaveBeenCalledWith("seguimiento_bap");
    expect(mocks.inFilter).toHaveBeenCalledWith(
      "alumno_id",
      ["student-1", "student-2"],
    );
    expect(mocks.order).toHaveBeenCalledWith(
      "creado_en",
      { ascending: false },
    );
    expect(records[0]).toMatchObject({
      id: "bap-event-1",
      studentId: "student-1",
      eventType: "ajuste",
      responsible: "Docente titular",
    });
  });

  it("keeps legacy BAP records without inventing missing authorship or dates", async () => {
    mocks.queryResult.data = [{
      ...persistedRow,
      id: "legacy-bap-event",
      responsable: null,
      creado_por: null,
      creado_en: null,
    }];

    const records = await loadBapTracking(["student-1"]);

    expect(records[0]).toMatchObject({
      id: "legacy-bap-event",
      responsible: "Responsable no documentado",
      authorId: null,
      createdAt: null,
    });
  });

  it("registers a BAP event through the transactional RPC", async () => {
    mocks.rpcSingle.mockResolvedValue({
      data: {
        ...persistedRow,
        datos_bap: {
          hasBAP: true,
          diagnosisPrivate: "Barrera de acceso a textos",
          accommodations: ["Material con tipografía ampliada"],
          lastUpdated: "2026-07-18T16:00:00.000Z",
        },
      },
      error: null,
    });

    const result = await persistBapEvent({
      studentId: "student-1",
      eventType: "ajuste",
      barrierType: "Barrera de acceso a textos",
      action: "Material con tipografía ampliada",
      status: "en_seguimiento",
      observations: "Revisar respuesta en clase.",
      responsible: "Docente titular",
      reviewDate: "2026-07-25",
    });

    expect(mocks.rpc).toHaveBeenCalledWith(
      "registrar_evento_bap",
      expect.objectContaining({
        p_alumno_id: "student-1",
        p_tipo_evento: "ajuste",
        p_ajuste_razonable: "Material con tipografía ampliada",
        p_responsable: "Docente titular",
      }),
    );
    expect(result.record.id).toBe("bap-event-1");
    expect(result.bapInfo.accommodations).toEqual([
      "Material con tipografía ampliada",
    ]);
  });

  it("fails closed before querying when the institutional session is absent", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    await expect(loadBapTracking(["student-1"]))
      .rejects.toThrow("La sesión institucional no está disponible.");
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("propagates RLS or RPC authorization errors", async () => {
    mocks.rpcSingle.mockResolvedValue({
      data: null,
      error: {
        code: "42501",
        message: "El rol institucional no puede registrar seguimiento BAP.",
      },
    });

    await expect(persistBapEvent({
      studentId: "student-1",
      eventType: "seguimiento",
      barrierType: "Participación",
      action: "Acompañamiento en equipo",
      status: "activo",
      responsible: "UDEII",
    })).rejects.toMatchObject({ code: "42501" });
  });
});
