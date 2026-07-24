import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardUDEII } from "../src/components/dashboards/DashboardUDEII";
import { persistBapEvent } from "../src/components/udeii/udeiiPersistence";

const appMocks = vi.hoisted(() => ({
  fetchStudents: vi.fn().mockResolvedValue(undefined),
  printDocument: vi.fn(),
  students: [
    {
      id: "student-bap",
      matricula: "A-001",
      name: "Alumno con Apoyo",
      group: "1A",
      avatar: "",
      incidents: [],
      justificantes: [],
      bapInfo: {
        hasBAP: true,
        diagnosisPrivate: "Barrera de lectoescritura",
        accommodations: ["Lectura acompañada"],
        lastUpdated: "2026-07-17T10:00:00.000Z",
      },
    },
    {
      id: "student-new",
      matricula: "A-002",
      name: "Alumno sin Historial",
      group: "2B",
      avatar: "",
      incidents: [],
      justificantes: [],
      bapInfo: {
        hasBAP: false,
        diagnosisPrivate: "",
        accommodations: [],
        lastUpdated: "",
      },
    },
  ],
}));

const persistenceMocks = vi.hoisted(() => ({
  loadBapTracking: vi.fn(),
  persistBapEvent: vi.fn(),
}));

vi.mock("../src/store", () => ({
  useApp: () => appMocks,
}));

vi.mock("../src/components/udeii/udeiiPersistence", () => ({
  loadBapTracking: persistenceMocks.loadBapTracking,
  persistBapEvent: persistenceMocks.persistBapEvent,
}));

const initialRecord = {
  id: "history-1",
  studentId: "student-bap",
  eventType: "ajuste" as const,
  barrierType: "Barrera de lectoescritura",
  action: "Lectura acompañada",
  status: "en_seguimiento" as const,
  observations: "Revisar semanalmente.",
  responsible: "Docente titular",
  reviewDate: "2026-07-25",
  authorId: "udeii-user",
  createdAt: "2026-07-18T12:00:00.000Z",
};

describe("DashboardUDEII", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistenceMocks.loadBapTracking.mockResolvedValue([initialRecord]);
    persistenceMocks.persistBapEvent.mockResolvedValue({
      record: {
        ...initialRecord,
        id: "history-new",
        studentId: "student-new",
        eventType: "deteccion",
        barrierType: "Barrera de participación",
        action: "Asignar apoyos visuales",
        responsible: "UDEII",
      },
      bapInfo: {
        hasBAP: true,
        diagnosisPrivate: "Barrera de participación",
        accommodations: ["Asignar apoyos visuales"],
        lastUpdated: "2026-07-18T13:00:00.000Z",
      },
    });
  });

  it("renders persisted BAP history and evidence-based metrics", async () => {
    render(<DashboardUDEII />);

    expect(screen.getByRole("heading", { name: /Memoria UDEII/i }))
      .toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Lectura acompañada"))
      .toBeInTheDocument());
    expect(screen.getByText("Responsable: Docente titular"))
      .toBeInTheDocument();
    expect(screen.queryByText(/25%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Próximamente/)).not.toBeInTheDocument();
  });

  it("starts BAP tracking for a student without previous history", async () => {
    render(<DashboardUDEII />);
    await waitFor(() => expect(persistenceMocks.loadBapTracking)
      .toHaveBeenCalled());

    fireEvent.change(
      screen.getByRole("combobox", { name: /Alumno para seguimiento BAP/i }),
      { target: { value: "student-new" } },
    );
    fireEvent.click(screen.getByRole("button", {
      name: /Iniciar o continuar apoyo/i,
    }));

    expect(screen.getByText(/Memoria institucional de Alumno sin Historial/i))
      .toBeInTheDocument();

    const selects = screen.getAllByTitle("Seleccionar opción");
    fireEvent.change(selects[0], {
      target: { value: "Detección de barrera" },
    });
    fireEvent.change(
      screen.getByTitle("Barrera para el aprendizaje o la participación"),
      { target: { value: "Barrera de participación" } },
    );
    fireEvent.change(screen.getAllByTitle("Detalles de la acción")[0], {
      target: { value: "Asignar apoyos visuales" },
    });
    fireEvent.change(selects[1], {
      target: { value: "En seguimiento" },
    });
    fireEvent.change(
      screen.getByTitle("Responsable de la siguiente acción"),
      { target: { value: "UDEII" } },
    );
    fireEvent.click(screen.getByRole("button", {
      name: /Guardar en memoria BAP/i,
    }));

    await waitFor(() => expect(persistenceMocks.persistBapEvent)
      .toHaveBeenCalledWith(expect.objectContaining({
        studentId: "student-new",
        eventType: "deteccion",
        action: "Asignar apoyos visuales",
        responsible: "UDEII",
      })));
    expect(await screen.findByText(
      "Detección guardado en la memoria institucional.",
    )).toBeInTheDocument();
    expect(appMocks.fetchStudents).toHaveBeenCalled();
  });

  it("keeps captured BAP evidence visible when persistence fails", async () => {
    vi.mocked(persistBapEvent).mockRejectedValueOnce(
      new Error("RLS denied"),
    );
    render(<DashboardUDEII />);
    await waitFor(() => expect(persistenceMocks.loadBapTracking)
      .toHaveBeenCalled());

    fireEvent.click(screen.getAllByRole("button", {
      name: /Registrar evento/i,
    })[0]);

    const selects = screen.getAllByTitle("Seleccionar opción");
    fireEvent.change(selects[0], {
      target: { value: "Ajuste razonable" },
    });
    fireEvent.change(
      screen.getByTitle("Barrera para el aprendizaje o la participación"),
      { target: { value: "Evidencia que debe conservarse" } },
    );
    fireEvent.change(screen.getAllByTitle("Detalles de la acción")[0], {
      target: { value: "Ajuste no confirmado" },
    });
    fireEvent.change(selects[1], {
      target: { value: "Activo" },
    });
    fireEvent.change(
      screen.getByTitle("Responsable de la siguiente acción"),
      { target: { value: "UDEII" } },
    );
    fireEvent.click(screen.getByRole("button", {
      name: /Guardar en memoria BAP/i,
    }));

    await waitFor(() => expect(
      screen.getByDisplayValue("Evidencia que debe conservarse"),
    ).toBeInTheDocument());
    expect(screen.getByRole("button", {
      name: /Guardar en memoria BAP/i,
    })).toBeInTheDocument();
  });
});

