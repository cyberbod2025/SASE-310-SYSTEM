import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DashboardTrabajoSocial } from "../components/dashboards/DashboardTrabajoSocial";

// -- HOISTED MOCKS --
const mocks = vi.hoisted(() => ({
  addJustificante: vi.fn(),
}));

// -- MOCK STORE --
vi.mock("../store", () => ({
  useApp: () => ({
    students: [
      {
        id: "1",
        name: "Social Student",
        group: "1º A",
        justificantes: [], // Empty history
      },
    ],
    addJustificante: mocks.addJustificante,
  }),
}));

// -- MOCK COMPLEX COMPONENTS --
vi.mock("../components/PrintButtons", () => ({
  PrintButtons: () => <button>Imprimir</button>,
}));

vi.mock("../components/VoiceInput", () => ({
  VoiceInput: ({ onTranscript }: any) => (
    <button type="button" onClick={() => onTranscript("Texto Simulado")}>
      Mic
    </button>
  ),
}));

describe("Dashboard Trabajo Social Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Header", () => {
    render(<DashboardTrabajoSocial />);
    expect(screen.getByText(/Trabajo Social/i)).toBeInTheDocument();
    expect(screen.getByText(/Gestión de Justificantes/i)).toBeInTheDocument();
  });

  it("Voice Input updates Textarea", () => {
    render(<DashboardTrabajoSocial />);
    const micBtn = screen.getByText("Mic");
    fireEvent.click(micBtn);

    const textArea = screen.getByPlaceholderText(
      /Detalles para el expediente/i
    );
    expect(textArea).toHaveValue("Texto Simulado");
  });

  it("Submit is disabled without Student", () => {
    render(<DashboardTrabajoSocial />);
    const submitBtn = screen.getByText(/Generar y Timbrar/i);
    // Should be disabled initially
    expect(submitBtn).toBeDisabled();
  });
});
