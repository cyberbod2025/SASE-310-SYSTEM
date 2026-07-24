import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const getUser = vi.fn();
  const results: Record<string, { data: unknown; error: unknown }> = {};
  const writeResults: Record<string, { data: unknown; error: unknown }> = {};
  const inserts: Record<string, unknown> = {};
  const selections: Array<[string, string]> = [];

  const from = vi.fn((table: string) => {
    const query: any = {};
    query.select = vi.fn((columns: string) => {
      selections.push([table, columns]);
      return query;
    });
    query.eq = vi.fn(() => query);
    query.in = vi.fn(() => query);
    query.order = vi.fn(() => query);
    query.limit = vi.fn(() => query);
    query.maybeSingle = vi.fn(() => Promise.resolve(results[table]));
    query.single = vi.fn(() => Promise.resolve(writeResults[table]));
    query.insert = vi.fn((payload: unknown) => {
      inserts[table] = payload;
      return query;
    });
    query.then = (
      resolve: (value: unknown) => unknown,
      reject: (reason: unknown) => unknown,
    ) => Promise.resolve(results[table]).then(resolve, reject);
    return query;
  });

  return {
    from,
    getUser,
    inserts,
    results,
    selections,
    writeResults,
  };
});

vi.mock("../src/supabase/client", () => ({
  supabase: {
    auth: { getUser: mocks.getUser },
    from: mocks.from,
  },
}));

import {
  loadStudentHistory,
  registrarSeguimientoOrientacion,
} from "../src/components/orientacion/orientacionApi";

const emptyResult = () => ({ data: [], error: null });

describe("orientacionApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.selections.length = 0;
    delete mocks.inserts.seguimiento_orientacion;
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "orientation-user" } },
      error: null,
    });
    Object.assign(mocks.results, {
      expediente_integral_alumno: {
        data: {
          alumno_id: "student-1",
          total_incidencias: 1,
          total_justificantes: 0,
        },
        error: null,
      },
      incidencias: emptyResult(),
      citas_padres: emptyResult(),
      contacts_log: emptyResult(),
      interventions_log: emptyResult(),
      diagnosticos_docentes: emptyResult(),
      planes_intervencion: emptyResult(),
      solicitudes_diagnostico: emptyResult(),
      seguimiento_orientacion: emptyResult(),
    });
    mocks.writeResults.seguimiento_orientacion = {
      data: {
        id: "follow-up-1",
        caso_id: "case-1",
        tipo: "entrevista",
        descripcion: "Acuerdo con la familia.",
        evidencia_url: null,
        created_by: "orientation-user",
        created_at: "2026-07-18T17:00:00.000Z",
      },
      error: null,
    };
  });

  it("loads only teacher diagnoses assigned to the individual case", async () => {
    mocks.results.incidencias = {
      data: [{
        id: "incident-1",
        fecha: null,
        tipo: "socioemocional",
        descripcion: "Observación institucional",
        estado: null,
      }],
      error: null,
    };
    mocks.results.diagnosticos_docentes = {
      data: [{
        id: "diagnosis-1",
        created_at: null,
        conducta: "Participa con acompañamiento",
        aprovechamiento: null,
        asistencia: "Regular",
        observaciones: "Requiere instrucciones breves.",
        recomendaciones: null,
      }],
      error: null,
    };

    const history = await loadStudentHistory("student-1", "case-1");

    expect(mocks.from).toHaveBeenCalledWith("diagnosticos_docentes");
    expect(mocks.from).not.toHaveBeenCalledWith("respuestas_docentes");
    expect(mocks.selections).toContainEqual([
      "expediente_integral_alumno",
      "alumno_id, total_incidencias, total_justificantes",
    ]);
    expect(history.incidents[0]).toMatchObject({
      fecha: null,
      fuente: "Estado: No documentado",
    });
    expect(history.teacherReports[0]).toMatchObject({
      id: "diagnosis-1",
      fecha: null,
      titulo: "Diagnóstico docente del caso",
      fuente: "Diagnósticos docentes asignados",
    });
    expect(history.teacherReports[0].detalle).toContain(
      "Participa con acompañamiento",
    );
  });

  it("registers follow-up with authenticated authorship and a confirmed row", async () => {
    const record = await registrarSeguimientoOrientacion({
      casoId: "case-1",
      tipo: "entrevista",
      descripcion: " Acuerdo con la familia. ",
    });

    expect(mocks.inserts.seguimiento_orientacion).toEqual({
      caso_id: "case-1",
      tipo: "entrevista",
      descripcion: "Acuerdo con la familia.",
      evidencia_url: null,
      created_by: "orientation-user",
    });
    expect(record).toMatchObject({
      id: "follow-up-1",
      casoId: "case-1",
      createdBy: "orientation-user",
    });
  });

  it("fails closed without a session and propagates RLS denials", async () => {
    mocks.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    await expect(registrarSeguimientoOrientacion({
      casoId: "case-1",
      tipo: "nota",
      descripcion: "No debe salir del cliente.",
    })).rejects.toThrow("La sesión institucional no está disponible.");
    expect(mocks.from).not.toHaveBeenCalled();

    mocks.writeResults.seguimiento_orientacion = {
      data: null,
      error: { code: "42501", message: "RLS denied" },
    };
    await expect(registrarSeguimientoOrientacion({
      casoId: "case-1",
      tipo: "nota",
      descripcion: "Seguimiento rechazado.",
    })).rejects.toMatchObject({ code: "42501" });
  });
});
