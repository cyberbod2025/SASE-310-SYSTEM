import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  order: vi.fn(),
  approve: vi.fn(),
  reject: vi.fn(),
  toast: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("../src/lib/supabaseClient", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: mocks.order,
      })),
    })),
  },
}));

vi.mock(
  "../src/components/personal/aprobacionPersonalPersistence",
  () => ({
    approveStaffRequest: mocks.approve,
    rejectStaffRequest: mocks.reject,
  }),
);

vi.mock("react-hot-toast", () => ({
  default: Object.assign(mocks.toast, {
    error: mocks.toastError,
    success: mocks.toastSuccess,
  }),
}));

import { AprobacionesPersonal } from "../src/components/AprobacionesPersonal";

const request = {
  id: "request-1",
  created_at: "2026-07-24T12:00:00.000Z",
  matricula_sase: "EMP-310-001",
  rol_solicitado: ["docente"],
  turno: "vespertino",
  nombres: "ANA",
  apellido_paterno: "PÉREZ",
  apellido_materno: "LÓPEZ",
  curp: "PELA000101MDFRPN01",
  correo_institucional: "ana.perez@sase.mx",
  telefono: null,
  materias: ["Matemáticas"],
  grupos: ["1A"],
  es_tutor: false,
  grupo_tutor: null,
  area_cobertura: null,
  observaciones: null,
  estado: "PENDIENTE",
  observaciones_validacion: null,
};

describe("AprobacionesPersonal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.order.mockResolvedValue({ data: [request], error: null });
    mocks.approve.mockResolvedValue({
      approved: true,
      primaryRole: "docente",
      approvedRoles: ["docente"],
      userId: "user-1",
      alreadyExisted: false,
      metadataSynchronized: true,
    });
    mocks.reject.mockResolvedValue({
      approved: false,
      rejected: true,
      requestId: "request-1",
    });
  });

  const openRequest = async () => {
    render(<AprobacionesPersonal />);
    fireEvent.click(await screen.findByText("ANA PÉREZ"));
  };

  it("aprueba por el servicio canónico sin simular ni escribir perfiles", async () => {
    await openRequest();

    fireEvent.click(
      screen.getByRole("button", { name: /Aprobar e invitar/ }),
    );

    await waitFor(() => {
      expect(mocks.approve).toHaveBeenCalledWith({
        requestId: "request-1",
        matriculaSase: "EMP-310-001",
        grupos: ["1A"],
        materias: ["Matemáticas"],
        esTutor: false,
        grupoTutor: null,
      });
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith(
      expect.stringContaining("invitación enviada"),
    );
  });

  it("rechaza por el servicio canónico y conserva el motivo", async () => {
    await openRequest();

    fireEvent.change(
      screen.getByPlaceholderText("Especificar motivo si se rechaza..."),
      {
        target: {
          value: "La adscripción no pudo confirmarse documentalmente.",
        },
      },
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Ejecutar Rechazo" }),
    );

    await waitFor(() => {
      expect(mocks.reject).toHaveBeenCalledWith(
        "request-1",
        "La adscripción no pudo confirmarse documentalmente.",
      );
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith(
      "Solicitud rechazada y documentada",
    );
  });
});
