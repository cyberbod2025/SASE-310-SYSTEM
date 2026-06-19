import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { DashboardPrefectura } from "../src/components/dashboards/DashboardPrefectura";

const mocks = vi.hoisted(() => ({
  addIncident: vi.fn(),
  logAudit: vi.fn(),
  printContent: vi.fn(),
  openQuickRegister: vi.fn(),
  registerAttendance: vi.fn(),
  printDocument: vi.fn(),
}));

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
      },
    ],
    addIncident: mocks.addIncident,
    logAudit: mocks.logAudit,
    setCurrentModule: vi.fn(),
    openQuickRegister: mocks.openQuickRegister,
    dailyStats: { attendanceCount: 0, lateCount: 0 },
    registerAttendance: mocks.registerAttendance,
    printDocument: mocks.printDocument,
  }),
}));

vi.mock("../src/components/PrintButtons", () => ({
  printContent: mocks.printContent,
}));

vi.mock("react-hot-toast", () => {
  const mockToast = vi.fn();
  (mockToast as any).success = vi.fn();
  (mockToast as any).error = vi.fn();
  return {
    default: mockToast,
    toast: mockToast,
  };
});

describe("Dashboard Prefectura Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.logAudit.mockResolvedValue({ success: true });
    mocks.registerAttendance.mockResolvedValue({ success: true });
    mocks.addIncident.mockResolvedValue(true);
  });

  it("renders Header correctly", () => {
    render(<DashboardPrefectura />);
    expect(
      screen.getByRole("heading", { name: /CENTRO DE CONTROL/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/CONTROL OPERATIVO/i)).toBeInTheDocument();
  });

  it("Quick Register adds incident via Store", async () => {
    render(<DashboardPrefectura />);

    const input = screen.getByPlaceholderText(/MATRÍCULA/i);
    fireEvent.change(input, { target: { value: "2024-PREF" } });

    const btn = screen.getByText("Retardo");
    fireEvent.click(btn);

    await waitFor(() => {
      // Check if the success toast is triggered, which happens at the end of the handler
      expect(mocks.addIncident).toHaveBeenCalledWith(
        "1",
        expect.stringContaining("Retardo"),
        "Retardo (Entrada)"
      );
    });

    await waitFor(() => {
      expect(mocks.logAudit).toHaveBeenCalled();
    });
  });

  it("Quick Register failure of registerAttendance prevents adding incident and audit log", async () => {
    mocks.registerAttendance.mockResolvedValue({ success: false });
    render(<DashboardPrefectura />);

    const input = screen.getByPlaceholderText(/MATRÍCULA/i);
    fireEvent.change(input, { target: { value: "2024-PREF" } });

    const btn = screen.getByText("Retardo");
    fireEvent.click(btn);

    await new Promise((r) => setTimeout(r, 100));

    expect(mocks.addIncident).not.toHaveBeenCalled();
    expect(mocks.logAudit).not.toHaveBeenCalled();
  });

  it("Quick Register failure of addIncident prevents audit log", async () => {
    mocks.addIncident.mockResolvedValue(false);
    render(<DashboardPrefectura />);

    const input = screen.getByPlaceholderText(/MATRÍCULA/i);
    fireEvent.change(input, { target: { value: "2024-PREF" } });

    const btn = screen.getByText("Retardo");
    fireEvent.click(btn);

    await new Promise((r) => setTimeout(r, 100));

    expect(mocks.addIncident).toHaveBeenCalled();
    expect(mocks.logAudit).not.toHaveBeenCalled();
  });

  it("Tutor notification button is disabled with Próximamente label", () => {
    render(<DashboardPrefectura />);

    const input = screen.getByPlaceholderText(/MATRÍCULA/i);
    fireEvent.change(input, { target: { value: "2024-PREF" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    const btn = screen.getByRole("button", { name: /Notificar Tutor/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent(/Próximamente/i);
  });
});
