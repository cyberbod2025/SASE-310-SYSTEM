import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { CaseState } from "../src/types";
import { DashboardPrefectura } from "../src/components/dashboards/DashboardPrefectura";

const mocks = vi.hoisted(() => {
  const toast = Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  });

  return {
    addIncident: vi.fn(),
    printContent: vi.fn(),
    openQuickRegister: vi.fn(),
    registerAttendance: vi.fn(),
    printDocument: vi.fn(),
    referStudentToOrientation: vi.fn(),
    toast,
    toastSuccess: toast.success,
    toastError: toast.error,
  };
});

vi.mock("../src/store", () => ({
  useApp: () => ({
    students: [
      {
        id: "1",
        name: "Test Prefectura",
        matricula: "2024-PREF",
        group: "1º A",
        incidents: [],
        justificantes: [],
        avatar: "https://i.pravatar.cc/150",
        caseState: CaseState.OBSERVADO,
        puntajeRiesgo: 65,
      },
    ],
    addIncident: mocks.addIncident,
    setCurrentModule: vi.fn(),
    openQuickRegister: mocks.openQuickRegister,
    dailyStats: { attendanceCount: 0, lateCount: 0 },
    registerAttendance: mocks.registerAttendance,
    printDocument: mocks.printDocument,
  }),
}));

vi.mock("../src/components/prefectura/prefecturaPersistence", () => ({
  referStudentToOrientation: mocks.referStudentToOrientation,
}));

vi.mock("../src/components/PrintButtons", () => ({
  printContent: mocks.printContent,
}));

vi.mock("react-hot-toast", () => ({
  default: mocks.toast,
}));

const selectStudent = () => {
  const input = screen.getByPlaceholderText(/MATRÍCULA/i);
  fireEvent.change(input, { target: { value: "2024-PREF" } });
  fireEvent.keyDown(input, { key: "Enter" });
};

describe("Dashboard Prefectura Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.addIncident.mockResolvedValue(true);
    mocks.registerAttendance.mockResolvedValue(true);
    mocks.referStudentToOrientation.mockResolvedValue({
      caseId: "case-1",
      responsibleId: "orientation-1",
      responsibleName: "Orientadora Activa",
      reusedOpenCase: false,
    });
  });

  it("presenta Prefectura como acompañamiento escolar", () => {
    render(<DashboardPrefectura />);

    expect(
      screen.getByRole("heading", {
        name: /ACOMPAÑAMIENTO ESCOLAR/i,
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/SEGUIMIENTO OPERATIVO/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Notificar Tutor/i }),
    ).not.toBeInTheDocument();
  });

  it("confirma asistencia e incidencia antes de anunciar el retardo", async () => {
    render(<DashboardPrefectura />);
    const input = screen.getByPlaceholderText(/MATRÍCULA/i);
    fireEvent.change(input, { target: { value: "2024-PREF" } });
    fireEvent.click(screen.getByRole("button", { name: /^Retardo$/i }));

    await waitFor(() => {
      expect(mocks.registerAttendance).toHaveBeenCalledWith("1", "retardo");
      expect(mocks.addIncident).toHaveBeenCalledWith(
        "1",
        expect.stringContaining("Retardo"),
        "Retardo (Entrada)",
      );
      expect(mocks.toastSuccess).toHaveBeenCalledWith(
        expect.stringContaining("registrado"),
      );
    });
  });

  it("no presenta éxito si la incidencia es rechazada", async () => {
    mocks.addIncident.mockResolvedValueOnce(false);
    render(<DashboardPrefectura />);
    const input = screen.getByPlaceholderText(/MATRÍCULA/i);
    fireEvent.change(input, { target: { value: "2024-PREF" } });
    fireEvent.click(screen.getByRole("button", { name: /^Retardo$/i }));

    await waitFor(() => expect(mocks.addIncident).toHaveBeenCalled());
    expect(mocks.toastSuccess).not.toHaveBeenCalledWith(
      expect.stringContaining("Retardo registrado"),
    );
  });

  it("canaliza a Orientación sin crear una incidencia paralela", async () => {
    render(<DashboardPrefectura />);
    selectStudent();
    fireEvent.click(
      screen.getByRole("button", { name: /Canalizar a Orientación/i }),
    );

    const confirm = screen.getByRole("button", { name: /^Confirmar$/i });
    expect(confirm).toBeDisabled();

    fireEvent.change(
      screen.getByRole("textbox", {
        name: /Motivo de canalización a Orientación/i,
      }),
      { target: { value: "Necesita seguimiento de acuerdos de convivencia." } },
    );
    fireEvent.click(confirm);

    await waitFor(() => {
      expect(mocks.referStudentToOrientation).toHaveBeenCalledWith({
        studentId: "1",
        reason: "Necesita seguimiento de acuerdos de convivencia.",
        summary:
          "Referencia de Prefectura. Incidencias visibles al momento: 0.",
        priority: "alta",
      });
      expect(mocks.toastSuccess).toHaveBeenCalledWith(
        expect.stringContaining("Orientadora Activa"),
      );
    });
    expect(mocks.addIncident).not.toHaveBeenCalled();
  });

  it("conserva el motivo si la canalización falla", async () => {
    mocks.referStudentToOrientation.mockRejectedValueOnce({
      code: "42501",
      message: "RLS denied",
    });
    render(<DashboardPrefectura />);
    selectStudent();
    fireEvent.click(
      screen.getByRole("button", { name: /Canalizar a Orientación/i }),
    );

    const reason = screen.getByRole("textbox", {
      name: /Motivo de canalización a Orientación/i,
    });
    fireEvent.change(reason, {
      target: { value: "Motivo que debe conservarse." },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Confirmar$/i }));

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        "No se pudo confirmar la canalización.",
      );
    });
    expect(reason).toHaveValue("Motivo que debe conservarse.");
    expect(
      screen.getByRole("heading", { name: /Canalizar a Orientación/i }),
    ).toBeInTheDocument();
  });
});
