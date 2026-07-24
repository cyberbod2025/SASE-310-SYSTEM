import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("../src/components/personal/registroPersonalPersistence", () => ({
  verifyOfficialStaff: vi.fn(),
  submitStaffAccessRequest: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { RegistroPersonal } from "../src/components/RegistroPersonal";

describe("RegistroPersonal", () => {
  it("muestra un formulario mínimo con correo institucional y estado pendiente", () => {
    render(<RegistroPersonal onBack={vi.fn()} />);

    fireEvent.change(screen.getByTitle("Ingrese su nombre de pila"), {
      target: { value: "Ana" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
    fireEvent.click(screen.getByRole("button", { name: /Docente/ }));
    fireEvent.click(screen.getByRole("button", { name: /Siguiente/ }));
    fireEvent.click(
      screen.getByRole("button", { name: /Continuar con la solicitud/ }),
    );

    expect(
      screen.getByTitle("Ingrese su correo institucional @sase.mx"),
    ).toHaveAttribute("placeholder", "nombre.apellido@sase.mx");
    expect(screen.getByTitle("Ingrese su CURP de 18 caracteres")).toBeVisible();
    expect(screen.getByDisplayValue("09DES4310M")).toHaveAttribute("readonly");
    expect(screen.getByText(/No se crearán credenciales/)).toBeVisible();
    expect(screen.queryByText(/Fecha de Nacimiento/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/RFC/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Bóveda de recuperación/i)).not.toBeInTheDocument();
  });

  it("no conserva secretos ni afirmaciones engañosas en el componente", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/RegistroPersonal.tsx"),
      "utf8",
    ).toLowerCase();

    expect(source).not.toContain("confirmpassword");
    expect(source).not.toContain("preguntaseguridad");
    expect(source).not.toContain("respuestaseguridad");
    expect(source).not.toContain("fechanacimiento");
    expect(source).not.toContain("rfc_parcial");
    expect(source).not.toContain("encriptando");
    expect(source).not.toContain("control total");
    expect(source).not.toContain("desbloquear funciones");
    expect(source).toContain("solicitud enviada");
    expect(source).toContain("no constituye una");
  });
});
