import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Login } from "../src/components/Login";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  updateUser: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("../src/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      updateUser: mocks.updateUser,
    },
    from: vi.fn(() => ({
      insert: vi.fn(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

vi.mock("../src/store", () => ({
  useApp: () => ({
    logEvent: vi.fn(),
  }),
}));

vi.mock("../src/components/SaseSplineOrb", () => ({
  SaseSplineOrb: () => <div data-testid="sase-orb" />,
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: mocks.toastError,
    success: mocks.toastSuccess,
  },
}));

function openRecovery() {
  render(<Login />);
  fireEvent.click(screen.getByRole("button", { name: "¿Olvidó su clave?" }));
}

describe("recuperación de clave en Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mocks.updateUser.mockResolvedValue({ error: null });
  });

  it("limpia la CURP al cerrar y volver a abrir la recuperación", () => {
    openRecovery();
    fireEvent.change(screen.getByLabelText("CURP Institucional"), {
      target: { value: "SARR800101HDFNNN01" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Cerrar recuperación" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "¿Olvidó su clave?" }));

    expect(screen.getByLabelText("CURP Institucional")).toHaveValue("");
  });

  it("no avanza a pregunta secreta ni nueva contraseña con solo capturar CURP", () => {
    openRecovery();
    fireEvent.change(screen.getByLabelText("CURP Institucional"), {
      target: { value: "SARR800101HDFNNN01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Revisar Recuperación" }));

    expect(mocks.toastError).toHaveBeenCalledWith(
      "Validación institucional requerida",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "SASE no permite cambiar la clave solo con CURP o pregunta secreta",
    );
    expect(
      screen.queryByLabelText("¿Nombre de su primera escuela primaria?"),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Nueva Contraseña")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Restablecer Clave" }),
    ).not.toBeInTheDocument();
    expect(mocks.updateUser).not.toHaveBeenCalled();
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
  });
});
