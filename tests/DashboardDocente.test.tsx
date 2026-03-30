import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DashboardDocente } from "../src/components/dashboards/DashboardDocente";
import { CaseState, UserRole } from "../src/types";

// -- HOISTED MOCKS --
const mocks = vi.hoisted(() => ({
  setCurrentModule: vi.fn(),
  addIncident: vi.fn(),
  registerAttendance: vi.fn(),
}));

// -- MOCK STORE --
vi.mock("../src/store", () => ({
  useApp: () => ({
    students: [
      {
        id: "1",
        name: "Test Student",
        incidents: [], // IMPORTANT: Must be empty array, not undefined
        medicalAlerts: [], // IMPORTANT: Must be empty array
        // Optional props that might be accessed
        group: "3º B",
        matricula: "2023-001",
        avatar: "https://i.pravatar.cc/150",
        caseState: CaseState.OBSERVADO,
      },
    ],
    currentUserRole: UserRole.DOCENTE,
    setCurrentModule: mocks.setCurrentModule,
    addIncident: mocks.addIncident,
    registerAttendance: mocks.registerAttendance,
  }),
}));

vi.mock("../src/components/AuthProvider", () => ({
  useAuth: () => ({
    signOut: vi.fn(),
  }),
}));

// -- MOCK TOAST --
vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe("Dashboard Docente Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Header correctly", () => {
    render(<DashboardDocente />);
    expect(
      screen.getByText(/DOCENTE_COMMAND_CENTRAL/i),
    ).toBeInTheDocument();
  });

  it("displays list of students", () => {
    render(<DashboardDocente />);
    expect(screen.getAllByText("Test Student").length).toBeGreaterThan(0);
  });

  it("Quick Action: Reportar Incidencia", () => {
    render(<DashboardDocente />);
    const selectToggle = screen.getByTitle(
      /Seleccionar alumno para reporte masivo/i,
    );
    fireEvent.click(selectToggle);

    expect(screen.getByText(/REPORTAR \(1\)/i)).toBeInTheDocument();
  });

  it("shows Pase de Lista tab", () => {
    render(<DashboardDocente />);
    expect(screen.getByText(/Pase de Lista/i)).toBeInTheDocument();
  });
});
