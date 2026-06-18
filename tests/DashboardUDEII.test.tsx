import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DashboardUDEII } from "../src/components/dashboards/DashboardUDEII";

const mocks = vi.hoisted(() => ({
  updateBapInfo: vi.fn(),
  printDocument: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

const testData = vi.hoisted(() => ({
  bapStudent: {
    id: "student-bap-1",
    name: "Alumno BAP",
    group: "1A",
    bapInfo: {
      hasBAP: true,
      diagnosisPrivate: "Barrera de lectoescritura",
      accommodations: ["Lectura guiada"],
      lastUpdated: "2026-01-01T00:00:00.000Z",
    },
  },
}));

vi.mock("../src/store", () => ({
  useApp: () => ({
    students: [testData.bapStudent],
    updateBapInfo: mocks.updateBapInfo,
    printDocument: mocks.printDocument,
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

describe("DashboardUDEII", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const openAdjustmentModal = () => {
    render(<DashboardUDEII />);
    fireEvent.click(
      screen.getByRole("button", {
        name: /Actualizar ajustes razonables de Alumno BAP/i,
      }),
    );
  };

  it("disables UDEII tools that are still in preparation", () => {
    render(<DashboardUDEII />);

    expect(
      screen.getByRole("button", { name: /EXPORTAR_LOG_BAP/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Manual de Estrategias/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Notificar a Tutores/i }),
    ).toBeDisabled();
  });

  it("updates BAP adjustments through the existing updateBapInfo store action", async () => {
    mocks.updateBapInfo.mockResolvedValue({ success: true });
    openAdjustmentModal();

    fireEvent.change(screen.getByPlaceholderText("Escriba los detalles aquí..."), {
      target: { value: "Ajuste de lectura asistida" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Guardar$/i }));

    await waitFor(() => {
      expect(mocks.updateBapInfo).toHaveBeenCalledWith("student-bap-1", {
        ...testData.bapStudent.bapInfo,
        accommodations: ["Ajuste de lectura asistida"],
      });
      expect(mocks.toastSuccess).toHaveBeenCalledWith("Acción registrada correctamente");
    });
  });

  it("does not show modal success when updateBapInfo reports a persistence error", async () => {
    mocks.updateBapInfo.mockResolvedValue({ success: false, error: "RLS" });
    openAdjustmentModal();

    fireEvent.change(screen.getByPlaceholderText("Escriba los detalles aquí..."), {
      target: { value: "Ajuste de lectura asistida" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Guardar$/i }));

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith("Error al registrar acción");
    });
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
  });

  it("keeps BAP print connected to the existing printDocument action", () => {
    render(<DashboardUDEII />);

    fireEvent.click(
      screen.getByRole("button", { name: /Imprimir bitácora BAP de Alumno BAP/i }),
    );

    expect(mocks.printDocument).toHaveBeenCalledWith({
      type: "BITACORA",
      studentId: "student-bap-1",
      data: {
        ...testData.bapStudent.bapInfo,
        accommodations: ["Lectura guiada"],
        details: "Estrategias de intervención para barreras identificadas.",
      },
    });
  });
});
