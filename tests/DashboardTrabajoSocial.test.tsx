import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DashboardTrabajoSocial } from "../src/components/dashboards/DashboardTrabajoSocial";

// -- HOISTED MOCKS --
const mocks = vi.hoisted(() => ({
  addJustificante: vi.fn(),
  addIncident: vi.fn(),
  printDocument: vi.fn(),
  setPrintModal: vi.fn(),
}));

// -- MOCK STORE --
vi.mock("../src/store", () => ({
  useApp: () => ({
    students: [
      {
        id: "1",
        name: "Social Student",
        group: "1º A",
        justificantes: [], // Empty history
        incidents: [],
        socioeconomicData: undefined,
      },
    ],
    addJustificante: mocks.addJustificante,
    addIncident: mocks.addIncident,
    printDocument: mocks.printDocument,
    setPrintModal: mocks.setPrintModal,
  }),
}));

// -- MOCK COMPLEX COMPONENTS --
vi.mock("../src/components/PrintButtons", () => ({
  PrintButtons: () => <button>Imprimir</button>,
}));

vi.mock("../src/components/VoiceInput", () => ({
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
    expect(
      screen.getByRole("heading", { name: /TRABAJO/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Justificantes/i }),
    ).toBeInTheDocument();
  });

  it("Voice Input updates Textarea", () => {
    render(<DashboardTrabajoSocial />);
    const micBtn = screen.getByText("Mic");
    fireEvent.click(micBtn);

    const textArea = screen.getByPlaceholderText(
      /DATOS_ADICIONALES/i
    );
    expect((textArea as HTMLTextAreaElement).value).toContain(
      "Texto Simulado",
    );
  });

  it("Submit is disabled without Student", () => {
    render(<DashboardTrabajoSocial />);
    const submitBtn = screen.getByText(/TIMBRAR_REGISTRO_OFICIAL/i);
    // Should be disabled initially
    expect(submitBtn).toBeDisabled();
  });
});
