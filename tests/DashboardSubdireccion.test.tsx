import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DashboardSubdireccion } from "../src/components/dashboards/DashboardSubdireccion";
import { AppModule, CaseState } from "../src/types";

const mocks = vi.hoisted(() => ({
  setCurrentModule: vi.fn(),
}));

vi.mock("../src/store", () => ({
  useApp: () => ({
    setCurrentModule: mocks.setCurrentModule,
    students: [
      {
        id: "student-intervention",
        name: "Alumno Intervención",
        group: "3A",
        caseState: CaseState.INTERVENCION,
      },
    ],
  }),
}));

describe("DashboardSubdireccion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("disables Subdirección actions that are still in preparation", () => {
    render(<DashboardSubdireccion />);

    expect(
      screen.getByRole("button", { name: /EXP_ZONA\.PDF/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /FORZAR_SYNC/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /AUTORIZAR_PASO/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Gestionar Suplencia/i }),
    ).toBeDisabled();
  });

  it("connects available Subdirección actions to real module navigation", () => {
    render(<DashboardSubdireccion />);

    fireEvent.click(screen.getByRole("button", { name: /VER_HISTORIAL_COMPLETO/i }));
    fireEvent.click(screen.getByRole("button", { name: /Inyectar Protocolo/i }));
    fireEvent.click(screen.getByRole("button", { name: /Validar NEEM/i }));

    expect(mocks.setCurrentModule).toHaveBeenCalledWith(AppModule.REPORTES);
    expect(mocks.setCurrentModule).toHaveBeenCalledWith(AppModule.PROTOCOLOS);
    expect(mocks.setCurrentModule).toHaveBeenCalledWith(AppModule.PLANEACION_NEM);
  });
});