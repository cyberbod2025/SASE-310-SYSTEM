import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DashboardPrefectura } from "../components/dashboards/DashboardPrefectura";

const mocks = vi.hoisted(() => ({
  addIncident: vi.fn(),
  logAudit: vi.fn(),
  printContent: vi.fn(),
}));

vi.mock("../store", () => ({
  useApp: () => ({
    students: [
      {
        id: "1",
        name: "Test Prefectura",
        matricula: "2024-PREF",
        group: "1º A",
        incidents: [],
        justificantes: [],
      },
    ],
    addIncident: mocks.addIncident,
    logAudit: mocks.logAudit,
    setCurrentModule: vi.fn(),
  }),
}));

vi.mock("../components/PrintButtons", () => ({
  printContent: mocks.printContent,
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Dashboard Prefectura Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Header correctly", () => {
    render(<DashboardPrefectura />);
    expect(screen.getByText(/Control Disciplinario/i)).toBeInTheDocument();
  });

  it("Quick Register adds incident via Store", () => {
    render(<DashboardPrefectura />);

    const input = screen.getByPlaceholderText(/Ej. 2023-4492/i);
    fireEvent.change(input, { target: { value: "2024-PREF" } });

    const btn = screen.getByText("Registrar");
    fireEvent.click(btn);

    expect(mocks.addIncident).toHaveBeenCalledWith(
      "1", // ID found via matricula
      expect.stringContaining("RETARDO"),
      "Retardo (Entrada)"
    );
    expect(mocks.logAudit).toHaveBeenCalled();
  });
});
