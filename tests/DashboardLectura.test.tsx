import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DashboardLectura } from "../src/components/dashboards/DashboardLectura";

const mocks = vi.hoisted(() => ({
  saveEvidence: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("../src/store", () => ({
  useApp: () => ({
    saveEvidence: mocks.saveEvidence,
  }),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

describe("DashboardLectura", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const openEvidenceModal = () => {
    render(<DashboardLectura />);
    fireEvent.click(screen.getByRole("button", { name: /Portafolio/i }));
    fireEvent.click(screen.getByText(/Subir Bitácora/i));
  };

  it("persists Lectura evidence through the existing saveEvidence store action", async () => {
    mocks.saveEvidence.mockResolvedValue({ success: true });
    openEvidenceModal();

    fireEvent.change(screen.getByPlaceholderText("PROYECTO_ASOCIADO"), {
      target: { value: "Lectura en Espiral" },
    });
    fireEvent.change(screen.getByPlaceholderText("Escriba los detalles aquí..."), {
      target: { value: "Bitácora del círculo lector." },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Guardar$/i }));

    await waitFor(() => {
      expect(mocks.saveEvidence).toHaveBeenCalledWith({
        title: "Evidencia de lectura: Lectura en Espiral",
        fileType: "registro_lectura",
        notes: "Bitácora del círculo lector.",
        proyectoNombre: "Lectura en Espiral",
      });
      expect(mocks.toastSuccess).toHaveBeenCalledWith("Acción registrada correctamente");
    });
  });

  it("does not show success when saveEvidence reports a persistence error", async () => {
    mocks.saveEvidence.mockResolvedValue({ success: false, error: "RLS" });
    openEvidenceModal();

    fireEvent.change(screen.getByPlaceholderText("PROYECTO_ASOCIADO"), {
      target: { value: "Lectura en Espiral" },
    });
    fireEvent.change(screen.getByPlaceholderText("Escriba los detalles aquí..."), {
      target: { value: "Bitácora del círculo lector." },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Guardar$/i }));

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith("Error al registrar acción");
    });
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
  });
});
