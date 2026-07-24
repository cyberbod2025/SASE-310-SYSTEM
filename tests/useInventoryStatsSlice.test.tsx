import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useInventoryStatsSlice } from "../src/store/slices/useInventoryStatsSlice";

const mocks = vi.hoisted(() => {
  const attendanceInsert = vi.fn();
  const attendanceSingle = vi.fn();
  const attendancePayloads: unknown[] = [];
  const from = vi.fn((table: string) => {
    if (table === "suministros") {
      return {
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      };
    }

    if (table === "attendance_logs") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        insert: attendanceInsert,
      };
    }

    throw new Error(`Tabla inesperada en prueba: ${table}`);
  });

  return {
    attendanceInsert,
    attendancePayloads,
    attendanceSingle,
    from,
  };
});

vi.mock("../src/supabase/client", () => ({
  supabase: { from: mocks.from },
}));

vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe("useInventoryStatsSlice registerAttendance", () => {
  const activeUser = { id: "prefectura-user" };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.attendancePayloads.length = 0;
    mocks.attendanceSingle.mockResolvedValue({
      data: { id: "attendance-1" },
      error: null,
    });
    mocks.attendanceInsert.mockImplementation((payload: unknown) => {
      mocks.attendancePayloads.push(payload);
      return {
        select: vi.fn(() => ({
          single: mocks.attendanceSingle,
        })),
      };
    });
  });

  it("confirma el UUID y fija la fecha de la escuela", async () => {
    const { result } = renderHook(() =>
      useInventoryStatsSlice(activeUser),
    );
    await waitFor(() => expect(mocks.from).toHaveBeenCalledWith("attendance_logs"));

    let saved = false;
    await act(async () => {
      saved = await result.current.registerAttendance(
        "student-1",
        "retardo",
      );
    });

    expect(saved).toBe(true);
    expect(mocks.attendancePayloads[0]).toEqual({
      alumno_id: "student-1",
      estado: "retardo",
      registrado_por: "prefectura-user",
      fecha: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    });
  });

  it("falla cerrado sin sesión o con registro duplicado", async () => {
    const withoutSession = renderHook(() => useInventoryStatsSlice(null));
    let withoutSessionSaved = true;
    await act(async () => {
      withoutSessionSaved = await withoutSession.result.current
        .registerAttendance("student-1", "presente");
    });
    expect(withoutSessionSaved).toBe(false);
    expect(mocks.attendanceInsert).not.toHaveBeenCalled();

    mocks.attendanceSingle.mockResolvedValueOnce({
      data: null,
      error: { code: "23505", message: "duplicate" },
    });
    const withSession = renderHook(() =>
      useInventoryStatsSlice(activeUser),
    );
    let duplicateSaved = true;
    await act(async () => {
      duplicateSaved = await withSession.result.current
        .registerAttendance("student-1", "falta");
    });
    expect(duplicateSaved).toBe(false);
  });
});
