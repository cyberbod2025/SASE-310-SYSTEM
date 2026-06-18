import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { DashboardDocente } from "../src/components/dashboards/DashboardDocente";
import { CaseState, IncidentType, UserRole } from "../src/types";

const mocks = vi.hoisted(() => ({
  addIncident: vi.fn(),
  setIsAssistantOpen: vi.fn(),
  profile: { alcances: {} as Record<string, boolean> },
}));

vi.mock("../src/store", () => ({
  useApp: () => ({
    students: [
      {
        id: "1",
        name: "Test Student",
        incidents: [],
        group: "3º B",
        matricula: "2023-001",
        avatar: "https://i.pravatar.cc/150",
        caseState: CaseState.OBSERVADO,
      },
    ],
    currentUserRole: UserRole.DOCENTE,
    currentUserProfile: mocks.profile,
    addIncident: mocks.addIncident,
    setIsAssistantOpen: mocks.setIsAssistantOpen,
  }),
}));

vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

// -- MOCK AUTH PROVIDER --
vi.mock("../src/components/AuthProvider", () => ({
  useAuth: () => ({
    user: { id: "test-user-id", email: "test@sase.mx" },
    isAuthenticated: true,
    role: "docente",
  }),
}));

// -- MOCK INSTITUTIONAL ACTIONS --
vi.mock("../src/hooks/useInstitutionalActions", () => ({
  useInstitutionalActions: () => ({
    escalateCase: vi.fn(),
    sosAlert: vi.fn(),
  }),
}));


describe("Dashboard Docente Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.profile.alcances = {};
    mocks.addIncident.mockResolvedValue(true);
  });

  it("renders DOCENTE header correctly", () => {
    render(<DashboardDocente />);
    expect(screen.getAllByText("DOCENTE")[0]).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Aula en 10 segundos/i })).toBeInTheDocument();
  });

  it("displays anonymized quick student list when names are restricted", () => {
    render(<DashboardDocente />);
    expect(screen.getAllByText("Alumno 1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Identidad reservada").length).toBeGreaterThan(0);
    expect(screen.queryByText("Test Student")).not.toBeInTheDocument();
  });

  it("opens quick form and saves an incident", async () => {
    render(<DashboardDocente />);

    fireEvent.click(screen.getByRole("button", { name: /Reportar incidencia/i }));
    fireEvent.click(screen.getByRole("button", { name: /Conducta/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Guardar$/i }));

    await waitFor(() => {
      expect(mocks.addIncident).toHaveBeenCalledWith(
        "1",
        IncidentType.CONDUCTA,
        "Observación de conducta en clase",
        undefined,
      );
    });
  });

  it("Guardar y continuar keeps quick form open", async () => {
    render(<DashboardDocente />);

    fireEvent.click(screen.getByRole("button", { name: /Reportar incidencia/i }));
    fireEvent.click(screen.getByRole("button", { name: /Falta de material/i }));
    fireEvent.click(screen.getByRole("button", { name: /Guardar y continuar/i }));

    await waitFor(() => expect(mocks.addIncident).toHaveBeenCalled());
    expect(screen.getByRole("heading", { name: /Guardar incidencia/i })).toBeInTheDocument();
  });

  it("blocks reporting when can_register is false", () => {
    mocks.profile.alcances = { can_register: false };
    render(<DashboardDocente />);

    expect(screen.getByRole("button", { name: /Reportar incidencia/i })).toBeDisabled();
  });
});
