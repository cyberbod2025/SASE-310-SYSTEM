import "@testing-library/jest-dom/vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BitacoraAuditoria } from "../src/components/BitacoraAuditoria";

const mocks = vi.hoisted(() => ({
  loadAuditPage: vi.fn(),
  registerAuditEvent: vi.fn(),
  buildAuditCsv: vi.fn(),
}));

vi.mock(
  "../src/components/auditoria/auditoriaPersistence",
  async (importOriginal) => {
    const actual = await importOriginal<
      typeof import("../src/components/auditoria/auditoriaPersistence")
    >();
    return {
      ...actual,
      loadAuditPage: mocks.loadAuditPage,
      registerAuditEvent: mocks.registerAuditEvent,
      buildAuditCsv: mocks.buildAuditCsv,
    };
  },
);

const entry = {
  id: "event-1",
  userId: "actor-1",
  userEmail: "direccion@sase.mx",
  userRole: "directivo",
  actionType: "CONSULTA_EXPEDIENTE",
  actionCategory: "CONSULTA" as const,
  actionDescription: "Consultó un expediente.",
  targetTable: "alumnos",
  targetRecordId: "student-1",
  purpose: "Acompañamiento institucional",
  studentId: "student-1",
  studentName: "Alumna Confirmada",
  origin: "cliente_seguro",
  createdAt: null,
};

describe("BitacoraAuditoria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.loadAuditPage.mockResolvedValue({
      entries: [entry],
      total: 1,
      hasMore: false,
      nextCursor: null,
    });
    mocks.registerAuditEvent.mockResolvedValue("audit-export");
    mocks.buildAuditCsv.mockReturnValue("csv-content");
    vi.stubGlobal(
      "URL",
      Object.assign(URL, {
        createObjectURL: vi.fn(() => "blob:audit"),
        revokeObjectURL: vi.fn(),
      }),
    );
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
      () => undefined,
    );
  });

  it("muestra responsables, propósito y fechas nulas sin inventarlas", async () => {
    render(<BitacoraAuditoria />);

    expect(
      await screen.findAllByText("direccion@sase.mx"),
    ).not.toHaveLength(0);
    expect(screen.getAllByText("Alumna Confirmada")).not.toHaveLength(0);
    expect(
      screen.getAllByText("Acompañamiento institucional"),
    ).not.toHaveLength(0);
    expect(screen.getAllByText("Sin fecha")).not.toHaveLength(0);
    expect(screen.getAllByText("No documentada")).not.toHaveLength(0);
    expect(
      screen.getByText(/Registro append-only para clientes/i),
    ).toBeInTheDocument();
  });

  it("aplica filtros institucionales al RPC", async () => {
    render(<BitacoraAuditoria />);
    await screen.findAllByText("direccion@sase.mx");

    fireEvent.change(
      screen.getByPlaceholderText("Acción, correo, registro o propósito"),
      { target: { value: "expediente" } },
    );
    fireEvent.change(screen.getByPlaceholderText("directivo"), {
      target: { value: "subdireccion" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Aplicar filtros" }),
    );

    await waitFor(() => {
      expect(mocks.loadAuditPage).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: "expediente",
          role: "subdireccion",
        }),
        null,
      );
    });
  });

  it("falla cerrado y presenta el error de autorización", async () => {
    mocks.loadAuditPage.mockRejectedValueOnce(
      new Error("El rol institucional no puede consultar Caja Negra."),
    );

    render(<BitacoraAuditoria />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El rol institucional no puede consultar Caja Negra.",
    );
    expect(screen.getByText("0 filas cargadas de 0 resultados")).toBeVisible();
  });

  it("registra el propósito antes de generar un CSV real", async () => {
    render(<BitacoraAuditoria />);
    await screen.findAllByText("direccion@sase.mx");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Descargar 1 filas visibles",
      }),
    );

    await waitFor(() => {
      expect(mocks.registerAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: "EXPORTACION_CAJA_NEGRA",
          purpose: "Resguardo autorizado de trazabilidad institucional",
        }),
      );
      expect(mocks.buildAuditCsv).toHaveBeenCalledWith([entry]);
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
    });
  });
});
