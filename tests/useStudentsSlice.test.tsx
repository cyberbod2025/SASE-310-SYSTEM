import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useStudentsSlice } from "../src/store/slices/useStudentsSlice";
import { CaseState, IncidentType, UserRole } from "../src/types";

const supabaseMocks = vi.hoisted(() => ({
  insert: vi.fn(),
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
    supabaseMocks.insert.mockResolvedValue({ error: null });
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
    supabaseMocks.insert.mockResolvedValueOnce({ error: { status: 403, message: "RLS" } });
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
});
