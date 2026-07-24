import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const getUser = vi.fn();
  const mutationSingle = vi.fn();
  const mutationSelect = vi.fn(() => ({ single: mutationSingle }));
  const insert = vi.fn(() => ({ select: mutationSelect }));
  const updateSingle = vi.fn();
  const updateSelect = vi.fn(() => ({ single: updateSingle }));
  const updateEq = vi.fn(() => ({ select: updateSelect }));
  const update = vi.fn(() => ({ eq: updateEq }));
  const queryResults: Record<string, { data: unknown[]; error: unknown }> = {
    seguimiento_social: { data: [], error: null },
    contacts_log: { data: [], error: null },
    citas_padres: { data: [], error: null },
    interventions_log: { data: [], error: null },
  };
  const from = vi.fn((table: string) => ({
    insert,
    update,
    select: vi.fn(() => {
      const query = {
        in: vi.fn(),
        order: vi.fn(),
      };
      query.in.mockReturnValue(query);
      query.order.mockImplementation(() => Promise.resolve(queryResults[table]));
      return query;
    }),
  }));

  return {
    from,
    getUser,
    insert,
    mutationSelect,
    mutationSingle,
    queryResults,
    update,
    updateEq,
    updateSelect,
    updateSingle,
  };
});

vi.mock("../src/supabase/client", () => ({
  supabase: {
    auth: { getUser: mocks.getUser },
    from: mocks.from,
  },
}));

import {
  loadSocialTracking,
  persistAgreementStatus,
  persistCitatorioAttendance,
  persistHomeVisit,
} from "../src/components/trabajoSocial/trabajoSocialPersistence";

describe("trabajoSocialPersistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "staff-trabajo-social" } },
      error: null,
    });
    mocks.queryResults.seguimiento_social = { data: [], error: null };
    mocks.queryResults.contacts_log = { data: [], error: null };
    mocks.queryResults.citas_padres = { data: [], error: null };
    mocks.queryResults.interventions_log = { data: [], error: null };
  });

  it("persists a sensitive home visit with authenticated authorship", async () => {
    mocks.mutationSingle.mockResolvedValue({
      data: {
        id: "visit-1",
        alumno_id: "student-1",
        fecha: "2026-07-18T10:00:00.000Z",
        seguimiento: "Visita verificada.",
        metadata: { contexto_familiar: "Acuerdos confirmados." },
      },
      error: null,
    });

    const result = await persistHomeVisit({
      studentId: "student-1",
      observations: "Visita verificada.",
      familyContext: "Acuerdos confirmados.",
    });

    expect(mocks.from).toHaveBeenCalledWith("seguimiento_social");
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({
      alumno_id: "student-1",
      creado_por: "staff-trabajo-social",
      tipo_evento: "visita_domiciliaria",
      es_sensible: true,
    }));
    expect(result).toMatchObject({
      id: "visit-1",
      caseId: "student-1",
      contextoFamiliar: "Acuerdos confirmados.",
    });
  });

  it("fails closed when there is no authenticated institutional user", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    await expect(persistHomeVisit({
      studentId: "student-1",
      observations: "No debe persistirse.",
    })).rejects.toThrow("La sesión institucional no está disponible.");

    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("propagates database or RLS errors without fabricating persistence", async () => {
    mocks.mutationSingle.mockResolvedValue({
      data: null,
      error: { message: "new row violates row-level security policy" },
    });

    await expect(persistHomeVisit({
      studentId: "student-1",
      observations: "Intento denegado.",
    })).rejects.toMatchObject({
      message: "new row violates row-level security policy",
    });
  });

  it("updates only the status column of an existing agreement", async () => {
    mocks.updateSingle.mockResolvedValue({
      data: { id: "agreement-1" },
      error: null,
    });

    await persistAgreementStatus("agreement-1", "cumplido");

    expect(mocks.update).toHaveBeenCalledWith({ estatus: "cumplido" });
    expect(mocks.updateEq).toHaveBeenCalledWith("id", "agreement-1");
    expect(mocks.updateSelect).toHaveBeenCalledWith("id");
  });

  it("confirms citation attendance only when the affected row is returned", async () => {
    mocks.updateSingle.mockResolvedValue({
      data: { id: "citation-1" },
      error: null,
    });

    await persistCitatorioAttendance("citation-1");

    expect(mocks.update).toHaveBeenCalledWith({ estado: "asistio" });
    expect(mocks.updateEq).toHaveBeenCalledWith("id", "citation-1");
    expect(mocks.updateSelect).toHaveBeenCalledWith("id");
    expect(mocks.updateSingle).toHaveBeenCalledOnce();
  });

  it("loads persistent contacts, citations, visits, and agreements", async () => {
    mocks.queryResults.contacts_log = {
      data: [{
        id: "contact-1",
        student_id: "student-1",
        created_at: "2026-07-18T09:00:00.000Z",
        method: "mensaje",
        outcome: "Tutor confirmó recepción.",
      }],
      error: null,
    };
    mocks.queryResults.citas_padres = {
      data: [{
        id: "citation-1",
        alumno_id: "student-1",
        fecha_cita: "2026-07-19T09:00:00.000Z",
        estado: "pendiente",
      }],
      error: null,
    };
    mocks.queryResults.seguimiento_social = {
      data: [
        {
          id: "visit-1",
          alumno_id: "student-1",
          tipo_evento: "visita_domiciliaria",
          seguimiento: "Visita realizada.",
          acuerdos: null,
          estatus: "realizada",
          fecha: "2026-07-18T10:00:00.000Z",
          metadata: { contexto_familiar: "Seguimiento semanal." },
        },
        {
          id: "agreement-1",
          alumno_id: "student-1",
          tipo_evento: "acuerdo",
          seguimiento: "Responsable: Tutor",
          acuerdos: "Asistir a reunión.",
          estatus: "en_proceso",
          fecha: "2026-07-18T11:00:00.000Z",
          metadata: { responsable: "Tutor" },
        },
      ],
      error: null,
    };
    mocks.queryResults.interventions_log = {
      data: [{
        id: "intervention-1",
        student_id: "student-1",
        created_at: "2026-07-18T12:00:00.000Z",
        reason: "Inicio de seguimiento",
        result: "seguimiento",
        notes: "Responsable asignado.",
      }],
      error: null,
    };

    const tracking = await loadSocialTracking(["student-1"]);

    expect(tracking.contacts[0]).toMatchObject({ id: "contact-1", tipo: "mensaje" });
    expect(tracking.citatorios[0]).toMatchObject({ id: "citation-1", numero: 1 });
    expect(tracking.visits[0]).toMatchObject({ id: "visit-1", contextoFamiliar: "Seguimiento semanal." });
    expect(tracking.agreements[0]).toMatchObject({ id: "agreement-1", responsable: "Tutor" });
    expect(tracking.interventions[0]).toMatchObject({ id: "intervention-1", resultado: "seguimiento" });
  });
});
