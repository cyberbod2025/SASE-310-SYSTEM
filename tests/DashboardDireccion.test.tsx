import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { DashboardDireccion } from "../components/dashboards/DashboardDireccion";

// -- HOISTED MOCKS --
const mocks = vi.hoisted(() => ({
  printContent: vi.fn(),
}));

// -- MOCK STORE --
vi.mock("../store", () => ({
  useApp: () => ({
    students: [
      {
        id: "1",
        name: "Student One",
        incidents: [{}, {}], // 2 Incidents
        caseState: "Patrón Detectado", // Risk case
      },
      {
        id: "2",
        name: "Student Two",
        incidents: [], // 0 Incidents
        caseState: "Cerrado",
      },
    ],
  }),
}));

// -- MOCK PRINT MODULE --
vi.mock("../components/PrintButtons", () => ({
  printContent: mocks.printContent,
}));

describe("Dashboard Direccion Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Header correctly", () => {
    render(<DashboardDireccion />);

    expect(screen.getByText(/Dirección Escolar/i)).toBeInTheDocument();
    expect(screen.getByText(/Tablero de Mando/i)).toBeInTheDocument();
  });

  it("KPIs calculate correctly based on Store data", () => {
    render(<DashboardDireccion />);

    // Total Incidents: 2 (from Student 1)
    // Finding text "2" within the KPI card for Incidents
    const incidentsCard = screen
      .getByText(/Incidencias del Mes/i)
      .closest("div");
    expect(incidentsCard).toHaveTextContent("2");

    // Risk Cases: 1 (Student 1)
    const riskCard = screen.getByText(/Casos en Riesgo/i).closest("div");
    expect(riskCard).toHaveTextContent("1");
  });

  it("Institutional Checklist toggles state", () => {
    render(<DashboardDireccion />);

    const checkbox = screen
      .getByText(/Firmar actas/i)
      .closest("li")
      ?.querySelector("input");
    expect(checkbox).not.toBeChecked(); // Initial false

    if (checkbox) {
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked(); // State updated
    } else {
      throw new Error("Checkbox not found");
    }
  });

  it("Export Report triggers print function", () => {
    render(<DashboardDireccion />);

    const exportBtn = screen.getByText(/Exportar Informe/i);
    fireEvent.click(exportBtn);

    expect(mocks.printContent).toHaveBeenCalledWith(
      expect.stringContaining("Resumen Dirección"),
      expect.stringContaining("Resumen Ejecutivo")
    );
  });
});
