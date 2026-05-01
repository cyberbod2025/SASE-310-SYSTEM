import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DashboardTrabajoSocial } from "../src/components/dashboards/DashboardTrabajoSocial";
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

describe("DashboardTrabajoSocial", () => {
  it("renders role header and execution queue", () => {
    render(<DashboardTrabajoSocial />);

    expect(screen.getByText("TRABAJO SOCIAL")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Intervención en campo/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Casos asignados/i })).toBeInTheDocument();
    expect(screen.getAllByText("Alumno Sin Respuesta").length).toBeGreaterThan(0);
  });

  it("highlights three unanswered citatorios as a critical institutional rule", () => {
    render(<DashboardTrabajoSocial />);

    expect(screen.getAllByText(/3 citatorios sin respuesta/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("alert")).toHaveTextContent(/Padres no han respondido a 3 citatorios/i);
  });

  it("registers a quick family contact without creating a new incident", () => {
    render(<DashboardTrabajoSocial />);

    fireEvent.change(screen.getByPlaceholderText(/Resultado breve del contacto/i), {
      target: { value: "Tutor confirma llamada de seguimiento." },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Llamada$/i }));

    expect(screen.getByText("Contacto familiar registrado.")).toBeInTheDocument();
    expect(screen.getByText("Tutor confirma llamada de seguimiento.")).toBeInTheDocument();
  });

  it("blocks final closure and exposes escalation path instead", () => {
    render(<DashboardTrabajoSocial />);

    expect(screen.getByText(/Cierre final bloqueado/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Escalar a Direccion/i })).toBeEnabled();
    expect(screen.queryByRole("button", { name: /Cerrar caso/i })).not.toBeInTheDocument();
  });
});
