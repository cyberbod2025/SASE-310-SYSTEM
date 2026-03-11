import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { DashboardDireccion } from "../src/components/dashboards/DashboardDireccion";
import { AppModule, CaseState } from "../src/types";

// -- HOISTED MOCKS --
const mocks = vi.hoisted(() => ({
  printContent: vi.fn(),
  setCurrentModule: vi.fn(),
}));

// -- MOCK STORE --
vi.mock("../src/store", () => ({
  useApp: () => ({
    students: [
      {
        id: "1",
        name: "Student One",
        incidents: [{}, {}], // 2 Incidents
        caseState: CaseState.PATRON_DETECTADO,
      },
      {
        id: "2",
        name: "Student Two",
        incidents: [], // 0 Incidents
        caseState: CaseState.CERRADO,
      },
    ],
    setCurrentModule: mocks.setCurrentModule,
  }),
}));

// -- MOCK PRINT MODULE --
vi.mock("../src/components/PrintButtons", () => ({
  printContent: mocks.printContent,
}));

const supabaseMocks = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  gte: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
}));

vi.mock("../src/supabase/client", () => {
  supabaseMocks.gte.mockReturnValue({ order: supabaseMocks.order });
  supabaseMocks.order.mockReturnValue({ limit: supabaseMocks.limit });
  supabaseMocks.limit.mockResolvedValue({ data: [], error: null });
  supabaseMocks.select.mockReturnValue({
    gte: supabaseMocks.gte,
    order: supabaseMocks.order,
  });
  supabaseMocks.from.mockReturnValue({ select: supabaseMocks.select });

  return {
    supabase: {
      from: supabaseMocks.from,
    },
  };
});

describe("Dashboard Direccion Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Header correctly", async () => {
    render(<DashboardDireccion />);
    await waitFor(() => {
      expect(screen.getByText(/COMMAND/i)).toBeInTheDocument();
      expect(screen.getByText(/CENTER/i)).toBeInTheDocument();
    });
  });

  it("KPIs calculate correctly based on Store data", async () => {
    render(<DashboardDireccion />);
    await waitFor(() => {
      const totalCard = screen.getByText(/POBLACIÓN TOTAL/i).closest("div");
      expect(totalCard).toHaveTextContent("2");

      const protocolsCard = screen
        .getByText(/PROTOCOLOS ACTIVOS/i)
        .closest("div");
      expect(protocolsCard).toHaveTextContent("1");
    });
  });

  it("Aprobaciones button routes correctly", async () => {
    render(<DashboardDireccion />);
    const approveBtn = screen.getByText(/Aprobaciones/i);
    fireEvent.click(approveBtn);
    await waitFor(() => {
      expect(mocks.setCurrentModule).toHaveBeenCalledWith(
        AppModule.APROBACIONES_PERSONAL,
      );
    });
  });

  it("Export Report opens preview", async () => {
    render(<DashboardDireccion />);

    const exportBtn = screen.getByText(/Exportar Log/i);
    fireEvent.click(exportBtn);

    expect(
      await screen.findByText(/RESUMEN EJECUTIVO DE OPERACIÓN INSTITUCIONAL/i),
    ).toBeInTheDocument();
  });
});
