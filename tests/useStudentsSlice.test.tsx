import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useStudentsSlice } from "../src/store/slices/useStudentsSlice";
import { CaseState, IncidentType, UserRole } from "../src/types";

const supabaseMocks = vi.hoisted(() => ({
  insert: vi.fn(),
  incidentSingle: vi.fn(),
  from: vi.fn(),
  removeChannel: vi.fn(),
}));

const notificationMocks = vi.hoisted(() => ({
  sendWhatsAppNotification: vi.fn(),
}));

const testUser = { id: "user-1", email: "docente@sase.mx" } as any;
const testProfile = { nombre_completo: "Docente Prueba" };
const addNotification = vi.fn();
const logAudit = vi.fn();
const fetchDailyStats = vi.fn();

vi.mock("../src/supabase/client", () => {
  const buildFetchStudentsQuery = () => Promise.resolve({
    data: [
      {
        id: "student-1",
        matricula: "S-001",
        curp: "CURPTEST",
        nombre_completo: "Alumno Prueba",
        grupo: "3B",
        estado_semaforo: CaseState.OBSERVADO,
        datos_tutor: { phonePrimary: "5512345678" },
        incidencias: [],
        justificantes: [],
        salud: [],
        calificaciones: [],
        documentos_institucionales: [],
        objetos_retenidos: [],
        behavior_metrics: [],
      },
    ],
    error: null,
  });

  return {
    supabase: {
      from: supabaseMocks.from,
      channel: vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn(),
      })),
      removeChannel: supabaseMocks.removeChannel,
    },
    buildFetchStudentsQuery,
  };
});

vi.mock("../src/utils/notifications", () => ({
  sendWhatsAppNotification: notificationMocks.sendWhatsAppNotification,
}));

vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

const renderStudentsSlice = () =>
  renderHook(() =>
    useStudentsSlice(
      testUser,
      UserRole.DOCENTE,
      addNotification,
      logAudit,
      fetchDailyStats,
      testProfile,
    ),
  );

describe("useStudentsSlice addIncident", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMocks.incidentSingle.mockResolvedValue({
      data: {
        id: "incident-db-confirmed",
        fecha: "2026-07-18T18:00:00.000Z",
        created_at: "2026-07-18T18:00:00.000Z",
      },
      error: null,
    });
    supabaseMocks.insert.mockReturnValue({
      select: vi.fn(() => ({
        single: supabaseMocks.incidentSingle,
      })),
    });
    notificationMocks.sendWhatsAppNotification.mockResolvedValue({ success: true });
    supabaseMocks.from.mockImplementation((table: string) => {
      if (table === "grupos") {
        return {
          select: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
        };
      }

      if (table === "alumnos") {
        return {
          select: vi.fn(() => Promise.resolve({
            data: [
              {
                id: "student-1",
                matricula: "S-001",
                curp: "CURPTEST",
                nombre_completo: "Alumno Prueba",
                grupo: "3B",
                estado_semaforo: CaseState.OBSERVADO,
                datos_tutor: { phonePrimary: "5512345678" },
                incidencias: [],
                justificantes: [],
                salud: [],
                calificaciones: [],
                documentos_institucionales: [],
                objetos_retenidos: [],
                behavior_metrics: [],
              },
            ],
            error: null,
          })),
        };
      }

      if (table === "incidencias") {
        return { insert: supabaseMocks.insert };
      }

      return { select: vi.fn(), insert: supabaseMocks.insert };
    });
  });

  it("no muta estado local si addIncident falla con 403", async () => {
    supabaseMocks.incidentSingle.mockResolvedValueOnce({
      data: null,
      error: { status: 403, message: "RLS" },
    });
    const { result } = renderStudentsSlice();

    await waitFor(() => expect(result.current.students).toHaveLength(1));

    let saved: boolean | undefined;
    await act(async () => {
      saved = await result.current.addIncident(
        "student-1",
        IncidentType.CONDUCTA,
        "Reporte de prueba",
      );
    });

    expect(saved).toBe(false);
    expect(result.current.students[0].incidents).toHaveLength(0);
    expect(notificationMocks.sendWhatsAppNotification).not.toHaveBeenCalled();
  });

  it("conserva el UUID y la fecha confirmados por Postgres", async () => {
    const { result } = renderStudentsSlice();
    await waitFor(() => expect(result.current.students).toHaveLength(1));

    let saved: boolean | undefined;
    await act(async () => {
      saved = await result.current.addIncident(
        "student-1",
        IncidentType.CONDUCTA,
        "Acuerdo de acompañamiento en aula",
      );
    });

    expect(saved).toBe(true);
    expect(supabaseMocks.insert).toHaveBeenCalledWith({
      alumno_id: "student-1",
      tipo: "conducta",
      descripcion: "Acuerdo de acompañamiento en aula",
      reportado_por: "user-1",
      fecha: expect.any(String),
    });
    expect(result.current.students[0].incidents[0]).toMatchObject({
      id: "incident-db-confirmed",
      date: "2026-07-18T18:00:00.000Z",
      description: "Acuerdo de acompañamiento en aula",
    });
  });

  it("no truena cuando descripcion llega undefined", async () => {
    const { result } = renderStudentsSlice();
    await waitFor(() => expect(result.current.students).toHaveLength(1));

    await expect(
      act(async () => {
        await result.current.addIncident("student-1", IncidentType.CONDUCTA, undefined as any);
      }),
    ).resolves.not.toThrow();

    expect(supabaseMocks.insert).not.toHaveBeenCalled();
    expect(result.current.students[0].incidents).toHaveLength(0);
  });

  it("reutiliza escalamiento sin enviar WhatsApp automáticamente tras RPC post-emergencia", async () => {
    const { result } = renderStudentsSlice();
    await waitFor(() => expect(result.current.students).toHaveLength(1));

    let saved: boolean | undefined;
    await act(async () => {
      saved = await result.current.applyIncidentSideEffects({
        studentId: "student-1",
        type: IncidentType.CONDUCTA,
        description: "Pelea con agresion fisica durante emergencia",
        incidentId: "incident-db-1",
        incidentDate: "2026-05-27T10:00:00.000Z",
      });
    });

    expect(saved).toBe(true);
    expect(result.current.students[0].incidents[0].id).toBe("incident-db-1");
    expect(addNotification).toHaveBeenCalled();
    expect(notificationMocks.sendWhatsAppNotification).not.toHaveBeenCalled();
    expect(logAudit).toHaveBeenCalledWith(
      "CREACION",
      expect.stringContaining("Protocolo Activado"),
      "incidencias",
      "incident-db-1",
      "Alumno Prueba",
    );
  });

  it("actualiza stats al aplicar efectos de retardo post-emergencia", async () => {
    const { result } = renderStudentsSlice();
    await waitFor(() => expect(result.current.students).toHaveLength(1));

    await act(async () => {
      await result.current.applyIncidentSideEffects({
        studentId: "student-1",
        type: IncidentType.RETARDO,
        description: "Ingreso tardio posterior a contencion de emergencia",
        incidentId: "incident-db-2",
      });
    });

    expect(fetchDailyStats).toHaveBeenCalled();
  });
});
