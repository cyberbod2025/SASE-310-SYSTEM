import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "../src/types";

const appMocks = vi.hoisted(() => ({
  currentUserRole: "medico_escolar",
  students: [{
    id: "student-1",
    matricula: "S-001",
    name: "Alumna Salud",
    group: "2A",
    avatar: "",
    incidents: [],
    justificantes: [],
  }],
}));

const persistenceMocks = vi.hoisted(() => ({
  deactivateHealthAlert: vi.fn(),
  loadHealthMemory: vi.fn(),
  persistHealthAlert: vi.fn(),
  persistMedicalAttention: vi.fn(),
  updateMedicalAttention: vi.fn(),
}));

vi.mock("../src/store", () => ({
  useApp: () => appMocks,
}));

vi.mock("../src/components/salud/saludPersistence", () => ({
  deactivateHealthAlert: persistenceMocks.deactivateHealthAlert,
  loadHealthMemory: persistenceMocks.loadHealthMemory,
  persistHealthAlert: persistenceMocks.persistHealthAlert,
  persistMedicalAttention: persistenceMocks.persistMedicalAttention,
  updateMedicalAttention: persistenceMocks.updateMedicalAttention,
}));

import { DashboardSalud } from "../src/components/dashboards/DashboardSalud";

const attention = {
  id: "attention-1",
  studentId: "student-1",
  studentName: "Alumna Salud",
  group: "2A",
  reason: "Dolor de cabeza",
  symptoms: "Cefalea",
  assessment: null,
  vitalSigns: "TA 110/70",
  careProvided: "Reposo e hidratación",
  medication: null,
  familyNotified: true,
  familyPickedUp: false,
  deliveryConditions: null,
  observations: "Revalorar en una hora",
  status: "observacion" as const,
  urgency: "media" as const,
  followUpDate: "2026-07-19",
  exitType: "regreso_clase" as const,
  attendedBy: "medical-user",
  createdBy: "medical-user",
  occurredAt: "2026-07-18T16:00:00.000Z",
  updatedAt: "2026-07-18T16:05:00.000Z",
};

const alert = {
  id: "alert-1",
  studentId: "student-1",
  type: "alergia" as const,
  condition: "Alergia al cacahuate",
  allergies: "Alergia al cacahuate",
  medications: null,
  instructions: "Evitar exposición.",
  active: true,
  updatedBy: "medical-user",
  createdAt: "2026-07-18T15:00:00.000Z",
  updatedAt: "2026-07-18T15:00:00.000Z",
};

describe("DashboardSalud", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appMocks.currentUserRole = UserRole.MEDICO_ESCOLAR;
    persistenceMocks.loadHealthMemory.mockResolvedValue({
      attentions: [attention],
      alerts: [alert],
    });
    persistenceMocks.persistMedicalAttention.mockResolvedValue({
      ...attention,
      id: "attention-new",
      reason: "Golpe leve",
    });
    persistenceMocks.persistHealthAlert.mockResolvedValue({
      ...alert,
      id: "alert-new",
      condition: "Precaución respiratoria",
      type: "padecimiento",
    });
    persistenceMocks.updateMedicalAttention.mockResolvedValue({
      ...attention,
      status: "cerrada",
      observations: "Sin signos de alarma.",
    });
    persistenceMocks.deactivateHealthAlert.mockResolvedValue({
      ...alert,
      active: false,
    });
  });

  it("renders persisted clinical memory without the incident broadcast flow", async () => {
    render(<DashboardSalud />);

    expect(screen.getByRole("heading", { name: "Salud Escolar" }))
      .toBeInTheDocument();
    expect(await screen.findByText("Dolor de cabeza")).toBeInTheDocument();
    expect(screen.getByText("Alergia al cacahuate")).toBeInTheDocument();
    expect(screen.queryByText(/Emitir alerta institucional/i))
      .not.toBeInTheDocument();
  });

  it("registers a protected health alert without using incidents", async () => {
    render(<DashboardSalud />);
    await screen.findByText("Alergia al cacahuate");

    fireEvent.click(screen.getByRole("button", {
      name: /Registrar alerta clínica/i,
    }));
    fireEvent.change(screen.getByLabelText("Tipo de alerta"), {
      target: { value: "Padecimiento" },
    });
    fireEvent.change(screen.getByLabelText("Condición o precaución"), {
      target: { value: "Precaución respiratoria" },
    });
    fireEvent.change(screen.getByLabelText("Indicaciones institucionales"), {
      target: { value: "Observar signos de dificultad respiratoria." },
    });
    fireEvent.click(screen.getByRole("button", {
      name: /Guardar alerta protegida/i,
    }));

    await waitFor(() => expect(
      persistenceMocks.persistHealthAlert,
    ).toHaveBeenCalledWith({
      studentId: "student-1",
      type: "padecimiento",
      condition: "Precaución respiratoria",
      instructions: "Observar signos de dificultad respiratoria.",
    }));
    expect(await screen.findByText("Precaución respiratoria"))
      .toBeInTheDocument();
  });

  it("keeps captured medical evidence visible after a persistence failure", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    persistenceMocks.persistMedicalAttention.mockRejectedValueOnce(
      new Error("RLS denied"),
    );
    render(<DashboardSalud />);
    await screen.findByText("Dolor de cabeza");

    fireEvent.click(screen.getByRole("button", {
      name: /Registrar atención/i,
    }));
    fireEvent.change(screen.getByLabelText("Motivo de la atención"), {
      target: { value: "Evidencia por conservar" },
    });
    fireEvent.change(
      screen.getByLabelText("Síntomas u observaciones iniciales"),
      { target: { value: "Mareo" } },
    );
    fireEvent.change(screen.getByLabelText("Atención brindada"), {
      target: { value: "Reposo supervisado" },
    });
    fireEvent.change(screen.getByLabelText("Nivel de prioridad"), {
      target: { value: "Media" },
    });
    fireEvent.change(screen.getByLabelText("Estado de la atención"), {
      target: { value: "En observación" },
    });
    fireEvent.change(screen.getByLabelText("¿Familia informada?"), {
      target: { value: "Sí" },
    });
    fireEvent.change(screen.getByLabelText("¿Acudieron por el alumno?"), {
      target: { value: "No" },
    });
    fireEvent.click(screen.getByRole("button", {
      name: /Guardar atención/i,
    }));

    await waitFor(() => expect(
      persistenceMocks.persistMedicalAttention,
    ).toHaveBeenCalled());
    expect(screen.getByDisplayValue("Evidencia por conservar"))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Guardar atención/i }))
      .toBeInTheDocument();
    consoleError.mockRestore();
  });

  it("closes an open attention through the persisted follow-up flow", async () => {
    render(<DashboardSalud />);
    await screen.findByText("Dolor de cabeza");

    fireEvent.click(screen.getByRole("button", {
      name: /Registrar seguimiento/i,
    }));
    fireEvent.change(screen.getByLabelText("Nuevo estado"), {
      target: { value: "Cerrada" },
    });
    fireEvent.change(screen.getByLabelText("Evidencia del seguimiento"), {
      target: { value: "Sin signos de alarma." },
    });
    fireEvent.click(screen.getByRole("button", {
      name: /Guardar seguimiento/i,
    }));

    await waitFor(() => expect(
      persistenceMocks.updateMedicalAttention,
    ).toHaveBeenCalledWith("attention-1", {
      status: "cerrada",
      followUpDate: undefined,
      deliveryConditions: undefined,
      observations: "Sin signos de alarma.",
      exitType: undefined,
    }));
    expect(await screen.findByText("Seguimiento médico actualizado y trazable."))
      .toBeInTheDocument();
  });
});
