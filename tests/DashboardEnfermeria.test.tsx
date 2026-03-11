import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DashboardEnfermeria } from "../src/components/dashboards/DashboardEnfermeria";

const mocks = vi.hoisted(() => ({
  setQuickRegisterOpen: vi.fn(),
  setCurrentModule: vi.fn(),
  updateSuministroStock: vi.fn(),
  addIncident: vi.fn(),
}));

vi.mock("../src/store", () => ({
  useApp: () => ({
    students: [
      {
        id: "1",
        name: "Sick Student",
        group: "2º A",
        incidents: [],
        medicalAlerts: ["Asma"], // 1 Alert
        date: new Date().toISOString(),
      },
    ],
    setQuickRegisterOpen: mocks.setQuickRegisterOpen,
    setCurrentModule: mocks.setCurrentModule,
    updateSuministroStock: mocks.updateSuministroStock,
    addIncident: mocks.addIncident,
    suministros: [
      { id: "med-1", nombre: "Paracetamol", cantidad: 2, cantidadMaxima: 10 },
    ],
  }),
}));

const supabaseMocks = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  ilike: vi.fn(),
  single: vi.fn(),
}));

vi.mock("../src/supabase/client", () => {
  supabaseMocks.ilike.mockReturnValue({ single: supabaseMocks.single });
  supabaseMocks.single.mockResolvedValue({ data: null, error: null });
  supabaseMocks.select.mockReturnValue({ ilike: supabaseMocks.ilike });
  supabaseMocks.from.mockReturnValue({ select: supabaseMocks.select });

  return {
    supabase: {
      from: supabaseMocks.from,
    },
  };
});

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Dashboard Enfermeria Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Header correctly", () => {
    render(<DashboardEnfermeria />);
    expect(
      screen.getByRole("heading", { name: /MEDICAL/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/SISTEMA TÁCTICO DE SALUD INSTITUCIONAL/i),
    ).toBeInTheDocument();
  });

  it("Opens Quick Consultation modal", () => {
    render(<DashboardEnfermeria />);

    fireEvent.click(screen.getByText(/REGISTRAR TRIAGE/i));
    expect(mocks.setQuickRegisterOpen).toHaveBeenCalledWith(true);
  });

  it("Counts Active Alerts correctly", () => {
    render(<DashboardEnfermeria />);
    const alertLabel = screen.getByText(/ALERTAS/i);
    expect(alertLabel.closest("p")).toHaveTextContent(/1/);
  });
});
