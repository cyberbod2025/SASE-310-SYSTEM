import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DashboardSalud } from "../src/components/dashboards/DashboardSalud";
import { IncidentType } from "../src/types";

const mocks = vi.hoisted(() => ({
  addIncident: vi.fn(),
  students: [] as Array<Record<string, unknown>>,
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("../src/store", () => ({
  useApp: () => ({
    students: mocks.students,
    addIncident: mocks.addIncident,
  }),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: mocks.toastError,
    success: mocks.toastSuccess,
  },
}));

const medicalStudents = [
  {
    id: "student-1",
    name: "Alumno Uno",
    group: "1A",
    incidents: [],
    medicalAlerts: ["Asma"],
  },
  {
    id: "student-2",
    name: "Alumno Dos",
    group: "2B",
    incidents: [],
    medicalAlerts: ["Alergia"],
  },
];

describe("DashboardSalud", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.students = medicalStudents;
    mocks.addIncident.mockResolvedValue(true);
  });

  it("shows success only after all medical incident writes succeed", async () => {
    render(<DashboardSalud />);

    fireEvent.click(screen.getByRole("button", { name: /Emitir alerta institucional/i }));

    await waitFor(() => expect(mocks.addIncident).toHaveBeenCalledTimes(2));
    expect(mocks.addIncident).toHaveBeenCalledWith(
      "student-1",
      IncidentType.SALUD,
      expect.stringContaining("AVISO MEDICO"),
      undefined,
      { showSuccessToast: false },
    );
    expect(mocks.toastSuccess).toHaveBeenCalledWith(
      "Se registraron institucionalmente 2 alertas médicas",
      { duration: 5000 },
    );
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("does not show success when one medical incident write fails", async () => {
    mocks.addIncident
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    render(<DashboardSalud />);

    fireEvent.click(screen.getByRole("button", { name: /Emitir alerta institucional/i }));

    await waitFor(() => expect(mocks.addIncident).toHaveBeenCalledTimes(2));
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledWith(
      expect.stringContaining("1 de 2 incidencias no se guardaron"),
      { duration: 6000 },
    );
  });

  it("does not show success when an incident write throws", async () => {
    mocks.addIncident.mockRejectedValueOnce(new Error("Network error"));
    render(<DashboardSalud />);

    fireEvent.click(screen.getByRole("button", { name: /Emitir alerta institucional/i }));

    await waitFor(() => expect(mocks.toastError).toHaveBeenCalled());
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledWith(
      expect.stringContaining("Puede haber registros parciales"),
      { duration: 6000 },
    );
  });
});
