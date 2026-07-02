import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  gte: vi.fn(),
  lte: vi.fn(),
  contains: vi.fn(),
  limit: vi.fn(),
  insert: vi.fn(),
  single: vi.fn(),
  rows: [] as any[],
}));

vi.mock("../src/lib/supabaseClient", () => {
  const createQuery = () => {
    const query: any = {
      select: mocks.select,
      eq: mocks.eq,
      order: mocks.order,
      gte: mocks.gte,
      lte: mocks.lte,
      contains: mocks.contains,
      limit: mocks.limit,
      insert: mocks.insert,
      single: mocks.single,
      then: (resolve: any) => resolve({ data: mocks.rows, error: null }),
      catch: () => query,
    };

    mocks.select.mockReturnValue(query);
    mocks.eq.mockReturnValue(query);
    mocks.order.mockReturnValue(query);
    mocks.gte.mockReturnValue(query);
    mocks.lte.mockReturnValue(query);
    mocks.contains.mockReturnValue(query);
    mocks.limit.mockReturnValue(query);
    mocks.insert.mockReturnValue(query);
    mocks.single.mockReturnValue(query);

    return query;
  };

  return {
    supabase: {
      from: mocks.from.mockImplementation(() => createQuery()),
    },
  };
});

const { getResumenGrupo } = await import("../src/services/diagnosticosService");

describe("diagnosticosService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rows = [];
  });

  it("filters group summaries by a validated diagnosis period", async () => {
    await getResumenGrupo("2B", "T1-2025");

    expect(mocks.from).toHaveBeenCalledWith("diagnosticos_colectivos_docentes");
    expect(mocks.eq).toHaveBeenCalledWith("grupo", "2B");
    expect(mocks.eq).toHaveBeenCalledWith("periodo", "T1-2025");
  });

  it("rejects unsupported periods before running an unscoped query", async () => {
    await expect(getResumenGrupo("2B", "T4-2099")).rejects.toThrow(/Periodo de diagnóstico no soportado/);

    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("ignores malformed alumnos_reportados payloads without crashing", async () => {
    mocks.rows = [
      {
        conducta_general: "alto",
        aprovechamiento: "bajo",
        asistencia: "bajo",
        alumnos_reportados: JSON.stringify([
          null,
          "noise",
          {
            alumno_id: "A-1",
            nombre: "Alumno Uno",
            behaviors: {
              conducta: "alto",
              asistencia: "bajo",
              observacion: 123,
            },
          },
          {
            alumno_id: "A-2",
            nombre: "Alumno Dos",
            conducta: "medio",
            asistencia: "bajo",
            convivencia: "alto",
          },
        ]),
      },
    ];

    const resumen = await getResumenGrupo("2B");

    expect(resumen.totalDiagnosticos).toBe(1);
    expect(resumen.pctConductaAlta).toBe(100);
    expect(resumen.pctAprovechamientoBajo).toBe(100);
    expect(resumen.pctAsistenciaBaja).toBe(100);
    expect(resumen.alumnosFocoRojo).toBe(2);
    expect(resumen.alumnosCriticos).toEqual([
      { alumnoId: "A-1", nombre: "Alumno Uno", indicadoresAlto: 2 },
      { alumnoId: "A-2", nombre: "Alumno Dos", indicadoresAlto: 2 },
    ]);
  });
});
