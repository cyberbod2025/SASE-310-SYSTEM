import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DashboardPromotora } from "../src/components/dashboards/DashboardPromotora";

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

describe("DashboardPromotora", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const openEvidenceModal = () => {
    render(<DashboardPromotora />);
    fireEvent.click(screen.getByRole("button", { name: /Evidencias/i }));
    fireEvent.click(screen.getByText(/Subir Evidencia/i));
  };

  it("persists Promotora evidence through the existing saveEvidence store action", async () => {
    mocks.saveEvidence.mockResolvedValue({ success: true });
    openEvidenceModal();

    fireEvent.change(screen.getByPlaceholderText("TÍTULO_DEL_EVENTO"), {
      target: { value: "Feria de la Salud" },
    });
    fireEvent.change(screen.getByPlaceholderText("Escriba los detalles aquí..."), {
      target: { value: "Evidencia logística de jornada comunitaria." },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Guardar$/i }));

    await waitFor(() => {
      expect(mocks.saveEvidence).toHaveBeenCalledWith({
        title: "Evidencia de promotoría: Feria de la Salud",
        fileType: "registro_promotoria",
        notes: "Evidencia logística de jornada comunitaria.",
        proyectoNombre: "Feria de la Salud",
      });
      expect(mocks.toastSuccess).toHaveBeenCalledWith("Acción registrada correctamente");
    });
  });

  it("does not show success when saveEvidence reports a persistence error", async () => {
    mocks.saveEvidence.mockResolvedValue({ success: false, error: "RLS" });
    openEvidenceModal();

    fireEvent.change(screen.getByPlaceholderText("TÍTULO_DEL_EVENTO"), {
      target: { value: "Feria de la Salud" },
    });
    fireEvent.change(screen.getByPlaceholderText("Escriba los detalles aquí..."), {
      target: { value: "Evidencia logística de jornada comunitaria." },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Guardar$/i }));

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith("Error al registrar acción");
    });
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
  });
});
