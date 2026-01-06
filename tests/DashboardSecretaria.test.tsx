import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { DashboardSecretaria } from "../components/dashboards/DashboardSecretaria";

const mocks = vi.hoisted(() => ({
  logAccess: vi.fn(),
  logAudit: vi.fn(),
  updateStudentAudit: vi.fn(),
  importStudents: vi.fn(),
}));

vi.mock("../store", () => ({
  useApp: () => ({
    students: [
      {
        id: "1",
        name: "Secretaria Student",
        group: "1º A",
        caseState: "Observado",
        guardianInfo: { name: "Mother", phonePrimary: "123", address: "Home" },
      },
    ],
    currentModule: "dashboard", // Default
    logAccess: mocks.logAccess,
    logAudit: mocks.logAudit,
    updateStudentAudit: mocks.updateStudentAudit,
    importStudents: mocks.importStudents,
  }),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

// Mock sub-components
vi.mock("../components/Inscripciones", () => ({
  Inscripciones: () => <div>Inscripciones Screen</div>,
}));
vi.mock("../components/Archivo", () => ({
  Archivo: () => <div>Archivo Screen</div>,
}));

describe("Dashboard Secretaria Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Header correctly", () => {
    render(<DashboardSecretaria />);
    expect(screen.getByText(/Secretaría Académica/i)).toBeInTheDocument();
    expect(screen.getByText(/Gestión de Expedientes/i)).toBeInTheDocument();
  });

  it("Clicking Consultar triggers Log Access", () => {
    render(<DashboardSecretaria />);

    const consultBtn = screen.getByText("Consultar");
    fireEvent.click(consultBtn);

    expect(mocks.logAccess).toHaveBeenCalledWith(
      expect.stringContaining("Consultar"),
      "1",
      "Secretaria Student"
    );

    // Should reveal details (mocked data presence check)
    expect(screen.getByText("Mother")).toBeInTheDocument();
  });

  it("Saving in Edit Mode triggers Audit", async () => {
    render(<DashboardSecretaria />);

    // 1. Enter Edit Mode
    fireEvent.click(screen.getByText("Consultar"));

    // 2. Click Save
    const saveBtn = screen.getByText("Guardar");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mocks.logAudit).toHaveBeenCalled();
      expect(mocks.updateStudentAudit).toHaveBeenCalled();
    });
  });
});
