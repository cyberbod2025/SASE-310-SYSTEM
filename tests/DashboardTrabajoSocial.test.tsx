import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DashboardTrabajoSocial } from "../src/components/dashboards/DashboardTrabajoSocial";
import { persistHomeVisit } from "../src/components/trabajoSocial/trabajoSocialPersistence";
import { CaseState, IncidentType } from "../src/types";

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
  }),
}));

vi.mock("../src/components/trabajoSocial/trabajoSocialPersistence", () => ({
  loadSocialTracking: vi.fn().mockResolvedValue({
    contacts: [],
    visits: [],
    agreements: [],
    interventions: [],
    citatorios: [1, 2, 3].map((numero) => ({
      id: `citatorio-${numero}`,
      caseId: "student-critical",
      numero,
      fecha: `2026-04-0${numero}`,
      respuesta: "sin_respuesta",
    })),
  }),
  persistAgreement: vi.fn().mockImplementation(({ studentId, agreement, responsible }) => Promise.resolve({
    id: "persisted-agreement",
    caseId: studentId,
    acuerdo: agreement,
    responsable: responsible,
    estado: "en_proceso",
  })),
  persistAgreementStatus: vi.fn().mockResolvedValue(undefined),
  persistCitatorio: vi.fn().mockResolvedValue("persisted-citatorio"),
  persistCitatorioAttendance: vi.fn().mockResolvedValue(undefined),
  persistFamilyContact: vi.fn().mockResolvedValue(undefined),
  persistHomeVisit: vi.fn().mockImplementation(({ studentId, observations }) => Promise.resolve({
    id: "persisted-visit",
    caseId: studentId,
    fecha: "2026-07-18",
    observaciones: observations,
    contextoFamiliar: "Contexto familiar reservado para expediente institucional.",
  })),
  persistIntervention: vi.fn().mockImplementation(({ studentId, reason, result, notes }) => Promise.resolve({
    id: `intervention-${result || "registered"}`,
    caseId: studentId,
    fecha: "2026-07-18",
    accion: reason,
    resultado: result || "registrado",
    notas: notes || null,
  })),
}));

describe("DashboardTrabajoSocial", () => {
  it("renders role header and execution queue", () => {
    render(<DashboardTrabajoSocial />);

    expect(screen.getByText("TRABAJO SOCIAL")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Intervención en campo/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Casos asignados/i })).toBeInTheDocument();
    expect(screen.getAllByText("Alumno Sin Respuesta").length).toBeGreaterThan(0);
  }, 15000);

  it("highlights three unanswered citatorios as a critical institutional rule", async () => {
    render(<DashboardTrabajoSocial />);

    await waitFor(() => expect(screen.getAllByText(/3 citatorios sin respuesta/i).length).toBeGreaterThan(0));
    expect(screen.getByRole("alert")).toHaveTextContent(/Padres no han respondido a 3 citatorios/i);
  }, 15000);

  it("registers a quick family contact without creating a new incident", async () => {
    render(<DashboardTrabajoSocial />);

    fireEvent.change(screen.getByPlaceholderText(/Resultado breve del contacto/i), {
      target: { value: "Tutor confirma llamada de seguimiento." },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Llamada$/i }));

    await waitFor(() => expect(screen.getByText("Contacto familiar registrado y guardado.")).toBeInTheDocument());
    expect(screen.getByText("Tutor confirma llamada de seguimiento.")).toBeInTheDocument();
  }, 15000);

  it("blocks final closure and exposes escalation path instead", () => {
    render(<DashboardTrabajoSocial />);

    expect(screen.getByText(/Cierre final bloqueado/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Registrar escalamiento a Dirección/i })).toBeEnabled();
    expect(screen.queryByRole("button", { name: /Cerrar caso/i })).not.toBeInTheDocument();
  }, 15000);

  it("persists a home visit before showing it in the institutional log", async () => {
    render(<DashboardTrabajoSocial />);

    fireEvent.change(screen.getByPlaceholderText(/Observaciones de visita/i), {
      target: { value: "Se verificaron los acuerdos con la familia." },
    });
    fireEvent.click(screen.getByRole("button", { name: /Registrar visita realizada/i }));

    await waitFor(() => expect(screen.getAllByText("Se verificaron los acuerdos con la familia.").length).toBeGreaterThan(0));
    expect(screen.getByText("Visita domiciliaria guardada en la memoria institucional.")).toBeInTheDocument();
  }, 15000);

  it("creates a persistent agreement with a named responsible person", async () => {
    render(<DashboardTrabajoSocial />);

    fireEvent.change(screen.getByPlaceholderText(/Acuerdo verificable/i), {
      target: { value: "Asistir a la reunión semanal." },
    });
    fireEvent.change(screen.getByPlaceholderText(/Responsable del acuerdo/i), {
      target: { value: "Tutor" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Registrar acuerdo/i }));

    await waitFor(() => expect(screen.getByText("Asistir a la reunión semanal.")).toBeInTheDocument());
    expect(screen.getByText("Responsable: Tutor")).toBeInTheDocument();
  }, 15000);

  it("keeps visit evidence in the form when persistence fails", async () => {
    vi.mocked(persistHomeVisit).mockRejectedValueOnce(new Error("RLS denied"));
    render(<DashboardTrabajoSocial />);

    const input = screen.getByPlaceholderText(/Observaciones de visita/i);
    fireEvent.change(input, {
      target: { value: "Evidencia que no debe perderse." },
    });
    fireEvent.click(screen.getByRole("button", { name: /Registrar visita realizada/i }));

    await waitFor(() => expect(screen.getByDisplayValue("Evidencia que no debe perderse.")).toBeInTheDocument());
    expect(screen.queryByText("Visita domiciliaria guardada en la memoria institucional.")).not.toBeInTheDocument();
  }, 15000);

  it("adds a persisted escalation to the intervention history", async () => {
    render(<DashboardTrabajoSocial />);

    fireEvent.click(screen.getByRole("button", { name: /Registrar escalamiento a Dirección/i }));

    await waitFor(() => expect(screen.getByText("escalado")).toBeInTheDocument());
    expect(screen.getByText("Escalamiento registrado para revisión de Dirección.")).toBeInTheDocument();
  }, 15000);
});
