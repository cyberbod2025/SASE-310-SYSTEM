import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Login } from "../src/components/Login";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  profileSingle: vi.fn(),
  updateUser: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("../src/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      signInWithPassword: mocks.signInWithPassword,
      signOut: mocks.signOut,
      updateUser: mocks.updateUser,
    },
    from: vi.fn(() => ({
      insert: vi.fn(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mocks.profileSingle,
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
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: { id: "user-1", email: "docente@sase.mx" } },
      error: null,
    });
    mocks.signOut.mockResolvedValue({ error: null });
    mocks.profileSingle.mockResolvedValue({
      data: {
        seguridad_status: null,
        blocked_until: null,
        risk_score: 0,
        estatus: "activo",
        estado_cuenta: "activo",
      },
      error: null,
    });
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

  it("bloquea el login cuando el estatus institucional no permite acceso", async () => {
    mocks.profileSingle.mockResolvedValueOnce({
      data: {
        seguridad_status: null,
        blocked_until: null,
        risk_score: 0,
        estatus: "bloqueado",
        estado_cuenta: null,
      },
      error: null,
    });

    render(<Login />);
    fireEvent.change(screen.getByLabelText("Correo Institucional"), {
      target: { value: "docente@sase.mx" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "ClaveSegura123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar al Sistema" }));

    expect(await screen.findByRole("button", { name: "Entrar al Sistema" })).toBeEnabled();
    expect(mocks.toastError).toHaveBeenCalledWith(
      "Acceso denegado: Usuario bloqueado por seguridad institucional.",
    );
    expect(mocks.signOut).toHaveBeenCalled();
  });
});
