/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { DashboardOrientacion } from "../src/components/dashboards/DashboardOrientacion";

const mocks = vi.hoisted(() => ({
  openCase: vi.fn(),
  requestDiagnosis: vi.fn(),
  createPlan: vi.fn(),
  deriveSocialWork: vi.fn(),
  escalateDirection: vi.fn(),
  loadCases: vi.fn(),
  loadDocentes: vi.fn(),
  loadHistory: vi.fn(),
  print: vi.fn(),
}));

vi.mock("../src/components/orientacion/orientacionApi", () => ({
  abrirCasoOrientacion: mocks.openCase,
  solicitarDiagnostico: mocks.requestDiagnosis,
  crearPlanIntervencion: mocks.createPlan,
  derivarTrabajoSocial: mocks.deriveSocialWork,
  escalarDireccion: mocks.escalateDirection,
  loadOrientacionCasos: mocks.loadCases,
  loadDocentes: mocks.loadDocentes,
  loadStudentHistory: mocks.loadHistory,
}));

vi.mock("../src/store", () => ({
  useApp: () => ({
    students: [
      {
        id: "student-1",
        name: "Ana Rivera",
        group: "2º A",
        matricula: "2024-1001",
        caseState: "PATRON_DETECTADO",
        puntajeRiesgo: 72,
        estadoSemaforo: "AMARILLO",
      },
    ],
  }),
}));

vi.mock("../src/components/AuthProvider", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "orientacion@sase.mx" },
  }),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Dashboard Orientacion v2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.print.mockReset();
    Object.defineProperty(window, "print", {
      value: mocks.print,
      writable: true,
    });

    mocks.loadCases.mockResolvedValue([
      {
        id: "case-1",
        alumnoId: "student-1",
        alumnoNombre: "Ana Rivera",
        grupo: "2º A",
        matricula: "2024-1001",
        estado: "en_analisis",
        prioridad: "alta",
        motivo: "Acompañamiento por alertas de conducta",
        resumen: "Caso institucional abierto",
        fechaApertura: "2026-05-01T00:00:00Z",
        fechaActualizacion: "2026-05-01T00:00:00Z",
        responsableId: "user-1",
      },
    ]);

    mocks.loadDocentes.mockResolvedValue([
      { id: "doc-1", nombreCompleto: "Mtro. López", rol: "docente" },
    ]);

    mocks.loadHistory.mockResolvedValue({
      summary: { total_incidencias: 3, total_justificantes: 1 },
      incidents: [{ id: "i-1", fecha: "2026-05-01", titulo: "Retardo", detalle: "Llegó tarde", fuente: "Incidencias" }],
      citations: [],
      contacts: [],
      interventions: [],
      teacherReports: [],
      plans: [],
      requests: [],
      followUps: [],
    });

    mocks.openCase.mockResolvedValue("case-new");
    mocks.requestDiagnosis.mockResolvedValue("request-1");
    mocks.createPlan.mockResolvedValue("plan-1");
    mocks.deriveSocialWork.mockResolvedValue(undefined);
    mocks.escalateDirection.mockResolvedValue(undefined);
  });

  it("renderiza el encabezado institucional y la bandeja", async () => {
    render(<DashboardOrientacion />);

    expect(screen.getByRole("heading", { name: /Casos, diagnósticos y evidencia institucional/i })).toBeInTheDocument();
    expect(screen.getByText(/Bandeja persistente/i)).toBeInTheDocument();

    await screen.findByRole("heading", { name: "Ana Rivera" });
    expect(screen.getByText(/Bandeja de casos/i)).toBeInTheDocument();
    expect(screen.getByText(/Historial institucional/i)).toBeInTheDocument();
  });

  it("abre un caso sugerido y solicita diagnóstico", async () => {
    render(<DashboardOrientacion />);

    await screen.findByRole("heading", { name: "Ana Rivera" });

    fireEvent.click(screen.getByRole("button", { name: /abrir caso/i }));
    await waitFor(() => expect(mocks.openCase).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: /enviar solicitud/i }));
    await waitFor(() => expect(mocks.requestDiagnosis).toHaveBeenCalled());
  });
});
