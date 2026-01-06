import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DashboardEnfermeria } from "../components/dashboards/DashboardEnfermeria";

const mocks = vi.hoisted(() => ({
  setQuickRegisterOpen: vi.fn(),
  setCurrentModule: vi.fn(),
}));

vi.mock("../store", () => ({
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
  }),
}));

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
    expect(screen.getByText(/Enfermería/i)).toBeInTheDocument();
  });

  it("Opens Quick Consultation modal", () => {
    render(<DashboardEnfermeria />);

    // Find New Consultation card
    const newConsultCard = screen.getByText("Nueva Consulta").closest("div");
    if (newConsultCard) {
      // Click the card (or parent of text)
      // The code has onClick on the card container
      // We can click the text too as events bubble
      fireEvent.click(screen.getByText("Nueva Consulta"));
      expect(mocks.setQuickRegisterOpen).toHaveBeenCalledWith(true);
    } else {
      throw new Error("Card not found");
    }
  });

  it("Counts Active Alerts correctly", () => {
    render(<DashboardEnfermeria />);
    // Text contains: "Urgente: 1 estudiantes"
    // Regex /Urgente:\s*1/i
    const alertLabel = screen.getByText(/Urgente:/i);
    expect(alertLabel.closest("p")).toHaveTextContent(/1/);
  });
});
