import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DashboardOrientacion } from "../components/dashboards/DashboardOrientacion";

const mocks = vi.hoisted(() => ({
  printContent: vi.fn(),
  setCurrentModule: vi.fn(),
}));

vi.mock("../store", () => ({
  useApp: () => ({
    students: [
      {
        id: "1",
        name: "Pattern Student",
        group: "2º A",
        caseState: "PATRON_DETECTADO", // Triggers alert
        incidents: [{}, {}, {}],
      },
    ],
    setCurrentModule: mocks.setCurrentModule,
    setQuickRegisterOpen: vi.fn(),
  }),
}));

vi.mock("../components/PrintButtons", () => ({
  printContent: mocks.printContent,
}));

// Robust Toast Mock
vi.mock("react-hot-toast", () => {
  const toast: any = vi.fn();
  toast.success = vi.fn();
  toast.error = vi.fn();
  toast.loading = vi.fn();
  return { default: toast };
});

describe("Dashboard Orientacion Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Header correctly", () => {
    render(<DashboardOrientacion />);
    expect(screen.getByText(/Orientación/i)).toBeInTheDocument();
    expect(screen.getByText(/Bienestar Estudiantil/i)).toBeInTheDocument();
  });

  it("Displays Pattern Alert for Risk Student", () => {
    render(<DashboardOrientacion />);
    expect(screen.getByText("Pattern Student")).toBeInTheDocument();
    expect(screen.getByText(/ALERTA CRÍTICA/i)).toBeInTheDocument();
  });

  it("Print Report calls function", () => {
    render(<DashboardOrientacion />);

    const printBtn = screen.getByText("Reporte Semanal");
    fireEvent.click(printBtn);

    expect(mocks.printContent).toHaveBeenCalled();
  });
});
