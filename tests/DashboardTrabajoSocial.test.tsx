import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DashboardTrabajoSocial } from "../src/components/dashboards/DashboardTrabajoSocial";
import { CaseState, IncidentType } from "../src/types";

// ── Hoisted mocks (must be declared before vi.mock factories are evaluated) ──
const { mockInsert, mockFrom, mockGetUser } = vi.hoisted(() => {
  const mockInsert = vi.fn();
  const mockFrom = vi.fn(() => ({ insert: mockInsert }));
  const mockGetUser = vi.fn();
  return { mockInsert, mockFrom, mockGetUser };
});

// ── Mock supabase client ──────────────────────────────────────────────────────
vi.mock("../src/supabase/client", () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
    auth: { getUser: mockGetUser },
  },
}));

// ── Mock store ────────────────────────────────────────────────────────────────
vi.mock("../src/store", () => ({
  useApp: () => ({
    students: [
      {
        id: "student-critical",
        matricula: "A-001",
        name: "Alumno Sin Respuesta",
        group: "2A",
        avatar: "",
        caseState: CaseState.INTERVENCION,
        puntajeRiesgo: 91,
        incidents: [
          {
            id: "inc-1",
            studentId: "student-critical",
            type: IncidentType.SOCIOEMOCIONAL,
            description: "Seguimiento familiar requerido",
            date: "2026-04-01T10:00:00.000Z",
            reportedBy: "Orientacion",
            gravedad: "critica",
          },
        ],
        justificantes: [],
      },
      {
        id: "student-follow-up",
        matricula: "A-002",
        name: "Alumno En Seguimiento",
        group: "1B",
        avatar: "",
        caseState: CaseState.SEGUIMIENTO,
        puntajeRiesgo: 62,
        incidents: [],
        justificantes: [],
      },
    ],
    createEmergencyAlert: vi.fn(),
    currentUserProfile: null,
  }),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
const setupContactSuccess = () => {
  mockGetUser.mockResolvedValue({ data: { user: { id: "user-abc" } } });
  mockInsert.mockResolvedValue({ error: null });
};

const setupContactFailure = () => {
  mockGetUser.mockResolvedValue({ data: { user: { id: "user-abc" } } });
  mockInsert.mockResolvedValue({ error: { message: "DB connection refused" } });
};

describe("DashboardTrabajoSocial", () => {
  it("renders role header and execution queue", () => {
    setupContactSuccess();
    render(<DashboardTrabajoSocial />);

    expect(screen.getByText("TRABAJO SOCIAL")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Intervención en campo/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Casos asignados/i })).toBeInTheDocument();
    expect(screen.getAllByText("Alumno Sin Respuesta").length).toBeGreaterThan(0);
  });

  it("highlights three unanswered citatorios as a critical institutional rule", () => {
    setupContactSuccess();
    render(<DashboardTrabajoSocial />);

    expect(screen.getAllByText(/3 citatorios sin respuesta/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("alert")).toHaveTextContent(/Padres no han respondido a 3 citatorios/i);
  });

  it("persists family contact to contacts_log on success", async () => {
    setupContactSuccess();
    render(<DashboardTrabajoSocial />);

    fireEvent.change(screen.getByPlaceholderText(/Resultado breve del contacto/i), {
      target: { value: "Tutor confirma llamada de seguimiento." },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Llamada$/i }));

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("contacts_log");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ method: "llamada", outcome: "registrado" })
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText("Contacto familiar registrado y guardado en base de datos institucional.")
      ).toBeInTheDocument();
    });

    // Contact still appears in the local list
    expect(screen.getByText("Tutor confirma llamada de seguimiento.")).toBeInTheDocument();
  });

  it("shows error lastAction when contacts_log insert fails, contact still visible locally", async () => {
    setupContactFailure();
    render(<DashboardTrabajoSocial />);

    fireEvent.change(screen.getByPlaceholderText(/Resultado breve del contacto/i), {
      target: { value: "Llamada sin respuesta." },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Llamada$/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Error al guardar contacto en base de datos. Registro disponible solo en esta sesion.")
      ).toBeInTheDocument();
    });

    // Contact still visible locally even after DB failure
    expect(screen.getByText("Llamada sin respuesta.")).toBeInTheDocument();
  });

  it("citatorio and other local actions do not claim institutional DB persistence in UI text", () => {
    setupContactSuccess();
    render(<DashboardTrabajoSocial />);

    // None of the old fake-success phrases should appear in the initial render
    expect(screen.queryByText(/pendiente de persistencia institucional/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/borrador local - pendiente de persistencia/i)).not.toBeInTheDocument();
  });

  it("blocks final closure and exposes escalation path instead", () => {
    setupContactSuccess();
    render(<DashboardTrabajoSocial />);

    expect(screen.getByText(/Cierre final bloqueado/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Escalar a Dirección \(en preparación\)/i })).toBeEnabled();
    expect(screen.queryByRole("button", { name: /Cerrar caso/i })).not.toBeInTheDocument();
  });
});
