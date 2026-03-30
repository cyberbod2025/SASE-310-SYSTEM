import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { DashboardSecretaria } from "../src/components/dashboards/DashboardSecretaria";
import { CaseState } from "../src/types";

const mocks = vi.hoisted(() => ({
  logAccess: vi.fn(),
  logAudit: vi.fn(),
  updateStudentAudit: vi.fn(),
  importStudents: vi.fn(),
  resolveSystemNotice: vi.fn(),
  printDocument: vi.fn(),
  setCurrentModule: vi.fn(),
  addIncident: vi.fn(),
}));

vi.mock("../src/store", () => ({
  useApp: () => ({
    students: [
      {
        id: "1",
        name: "Secretaria Student",
        group: "1º A",
        caseState: CaseState.OBSERVADO,
        guardianInfo: { name: "Mother", phonePrimary: "123", address: "Home" },
        matricula: "MAT-001",
        avatar: "https://i.pravatar.cc/150",
        incidents: [],
        justificantes: [],
      },
    ],
    currentModule: "dashboard", // Default
    logAccess: mocks.logAccess,
    logAudit: mocks.logAudit,
    updateStudentAudit: mocks.updateStudentAudit,
    importStudents: mocks.importStudents,
    resolveSystemNotice: mocks.resolveSystemNotice,
    printDocument: mocks.printDocument,
    setCurrentModule: mocks.setCurrentModule,
    addIncident: mocks.addIncident,
    groups: [],
    notices: [],
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
vi.mock("../src/components/AuthProvider", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "test@sase.com" },
    profile: { nombre: "Operador", cargo_institucional: "Control Escolar" },
  }),
}));

vi.mock("../src/components/Inscripciones", () => ({
  Inscripciones: () => <div>Inscripciones Screen</div>,
}));
vi.mock("../src/components/Archivo", () => ({
  Archivo: () => <div>Archivo Screen</div>,
}));

describe("Dashboard Secretaria Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Header correctly", () => {
    render(<DashboardSecretaria />);
    expect(
      screen.getByRole("heading", { name: /CONTROL ADMINISTRATIVO/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/División de Servicios Escolares/i),
    ).toBeInTheDocument();
  }, 10000);

  it("Clicking Modify triggers Log Access", () => {
    render(<DashboardSecretaria />);
    const modifyBtn = screen.getByLabelText(/Modificar Expediente/i);
    fireEvent.click(modifyBtn);

    expect(mocks.logAccess).toHaveBeenCalledWith(
      expect.stringContaining("Consultar"),
      "1",
      "Secretaria Student"
    );
  });

  it("Auditing in Edit Mode triggers Audit", async () => {
    render(<DashboardSecretaria />);

    // 1. Enter Edit Mode
    fireEvent.click(screen.getByLabelText(/Modificar Expediente/i));

    // 2. Click Save
    const auditBtn = screen.getByText(/AUDITAR REGISTRO/i);
    fireEvent.click(auditBtn);

    await waitFor(() => {
      expect(mocks.logAudit).toHaveBeenCalled();
      expect(mocks.updateStudentAudit).toHaveBeenCalled();
    });
  });
});
