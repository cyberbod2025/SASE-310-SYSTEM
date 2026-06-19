import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { DashboardSecretaria } from "../src/components/dashboards/DashboardSecretaria";
import { CaseState, UserRole } from "../src/types";

const mocks = vi.hoisted(() => ({
  logAccess: vi.fn(),
  logAudit: vi.fn(),
  updateStudentAudit: vi.fn(),
  importStudents: vi.fn(),
  resolveSystemNotice: vi.fn(),
  printDocument: vi.fn(),
  setCurrentModule: vi.fn(),
  setIsAssistantOpen: vi.fn(),
  setIsFeedbackOpen: vi.fn(),
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
        curp: "CURP001",
        avatar: "https://i.pravatar.cc/150",
        incidents: [],
        justificantes: [],
        documentationComplete: true,
        documentos: [{ id: "doc-1", tipo: "CITATORIO", folio: "F-1", fecha: "2026-04-01", titulo: "Constancia", contenido: "", firmas: [], studentId: "1", creado_por: "test" }],
      },
    ],
    currentModule: "dashboard", // Default
    currentUserRole: UserRole.SECRETARIA,
    currentUserProfile: { alcances: {} },
    logAccess: mocks.logAccess,
    logAudit: mocks.logAudit,
    updateStudentAudit: mocks.updateStudentAudit,
    importStudents: mocks.importStudents,
    resolveSystemNotice: mocks.resolveSystemNotice,
    printDocument: mocks.printDocument,
    setCurrentModule: mocks.setCurrentModule,
    setIsAssistantOpen: mocks.setIsAssistantOpen,
    setIsFeedbackOpen: mocks.setIsFeedbackOpen,
    groups: [{ id: "g-1", nombre: "1º A", ciclo_escolar: "2026" }],
    notices: [],
    notifications: [],
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
    mocks.logAudit.mockResolvedValue({ success: true });
  });


  it("renders Header correctly", () => {
    render(<DashboardSecretaria />);
    expect(screen.getByText(/División de Servicios Escolares/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /CONTROL ADMINISTRATIVO/i })).toBeInTheDocument();
  }, 10000);

  it("Selecting a student triggers Log Access", () => {
    render(<DashboardSecretaria />);
    fireEvent.click(screen.getByTitle(/Modificar Expediente/i));

    expect(mocks.logAccess).toHaveBeenCalledWith(
      "Consultar Expediente (Usuario: Operador)",
      "1",
      "Secretaria Student"
    );
  });

  it("Validating an expediente triggers Audit", async () => {
    render(<DashboardSecretaria />);

    fireEvent.click(screen.getByTitle(/Modificar Expediente/i));
    fireEvent.click(screen.getByTitle(/Confirmar revisión y registro de este expediente/i));

    await waitFor(() => {
      expect(mocks.logAudit).toHaveBeenCalled();
      expect(mocks.updateStudentAudit).toHaveBeenCalled();
    });
  });

  it("disables bulk import button with Próximamente label", () => {
    render(<DashboardSecretaria />);
    const btn = screen.getByRole("button", { name: /INICIAR IMPORTACIÓN/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent(/Próximamente/i);
  });
});
