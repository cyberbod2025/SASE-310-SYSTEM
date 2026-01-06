import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DashboardDocente } from "../components/dashboards/DashboardDocente";

// -- HOISTED MOCKS --
const mocks = vi.hoisted(() => ({
  setQuickRegisterOpen: vi.fn(),
  setCurrentModule: vi.fn(),
  toggleTutorMode: vi.fn(),
  addIncident: vi.fn(),
  logAccess: vi.fn(),
}));

// -- MOCK STORE --
vi.mock("../store", () => ({
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
      },
    ],
    isTutorMode: false,
    setQuickRegisterOpen: mocks.setQuickRegisterOpen,
    setCurrentModule: mocks.setCurrentModule,
    toggleTutorMode: mocks.toggleTutorMode,
    logAccess: mocks.logAccess,
    addIncident: mocks.addIncident, // Just in case
  }),
}));

// -- MOCK CHILD COMPONENTS --
// Mock StudentCard explicitly to avoid rendering complex children
vi.mock("../components/StudentCard", () => ({
  StudentCard: ({ student }: any) => (
    <div data-testid="student-card">{student.name}</div>
  ),
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
    expect(screen.getByText(/Bienvenido, Docente/i)).toBeInTheDocument();
    // Updated text matcher (case insensitive, partial match)
    expect(screen.getByText(/Vista Docente/i)).toBeInTheDocument();
  });

  it("displays list of students", () => {
    render(<DashboardDocente />);
    // Should find the mocked StudentCard
    expect(screen.getByTestId("student-card")).toHaveTextContent(
      "Test Student"
    );
  });

  it("Quick Action: Reportar Incidencia", () => {
    render(<DashboardDocente />);

    // Find button by role/text
    const reportBtn = screen.getByRole("button", { name: /Nueva Incidencia/i });
    fireEvent.click(reportBtn);

    expect(mocks.setQuickRegisterOpen).toHaveBeenCalledWith(true);
  });

  it("Quick Action: Toggle Tutor Mode", () => {
    render(<DashboardDocente />);

    const toggleBtn = screen.getByText(/Vista Docente/i);
    fireEvent.click(toggleBtn);

    expect(mocks.toggleTutorMode).toHaveBeenCalled();
  });
});
