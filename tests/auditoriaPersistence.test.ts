import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("../src/supabase/client", () => ({
  supabase: {
    auth: { getUser: mocks.getUser },
    rpc: mocks.rpc,
  },
}));

import {
  buildAuditCsv,
  loadAuditPage,
  registerAuditEvent,
} from "../src/components/auditoria/auditoriaPersistence";

const databaseRow = {
  id: "event-1",
  usuario_id: "actor-1",
  email_usuario: "direccion@sase.mx",
  rol_usuario: "directivo",
  tipo_accion: "CONSULTA_EXPEDIENTE",
  categoria_accion: "CONSULTA",
  descripcion_accion: "Consultó un expediente.",
  tabla_objetivo: "alumnos",
  id_registro_objetivo: "student-1",
  proposito: "Acompañamiento institucional",
  alumno_id: "student-1",
  alumno_nombre: "Alumna Confirmada",
  origen: "cliente_seguro",
  fecha: "2026-07-24T12:00:00.000Z",
  total_filtrado: 1,
};

describe("auditoriaPersistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "actor-1" } },
      error: null,
    });
    mocks.rpc.mockResolvedValue({ data: [databaseRow], error: null });
  });

  it("consulta únicamente el contrato mínimo autorizado", async () => {
    const result = await loadAuditPage({
      category: "CONSULTA",
      role: "directivo",
      table: "alumnos",
      search: "expediente",
      from: "2026-07-01",
      to: "2026-07-31",
    });

    expect(mocks.rpc).toHaveBeenCalledWith(
      "consultar_caja_negra",
      expect.objectContaining({
        p_categoria: "CONSULTA",
        p_rol: "directivo",
        p_tabla: "alumnos",
        p_busqueda: "expediente",
        p_desde: "2026-07-01",
        p_hasta: "2026-07-31",
      }),
    );
    expect(result).toMatchObject({
      total: 1,
      hasMore: false,
      entries: [
        {
          id: "event-1",
          userEmail: "direccion@sase.mx",
          actionCategory: "CONSULTA",
          studentName: "Alumna Confirmada",
          purpose: "Acompañamiento institucional",
          createdAt: "2026-07-24T12:00:00.000Z",
        },
      ],
    });
    expect(result.entries[0]).not.toHaveProperty("oldValues");
    expect(result.entries[0]).not.toHaveProperty("newValues");
    expect(result.entries[0]).not.toHaveProperty("ipAddress");
  });

  it("falla cerrado sin sesión o con una respuesta inválida", async () => {
    mocks.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    await expect(loadAuditPage()).rejects.toThrow(
      "La sesión institucional no está disponible.",
    );
    expect(mocks.rpc).not.toHaveBeenCalled();

    mocks.rpc.mockResolvedValueOnce({ data: null, error: null });
    await expect(loadAuditPage()).rejects.toThrow(
      "Supabase no confirmó la consulta de Caja Negra.",
    );
  });

  it("registra sin aceptar identidad, correo ni rol del cliente", async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: "audit-id",
      error: null,
    });

    await expect(
      registerAuditEvent({
        actionType: "CREACION",
        description: "Registró una acción institucional.",
        targetTable: "incidencias",
        targetRecordId: "incident-1",
        purpose: "Seguimiento institucional",
        studentId: "student-1",
      }),
    ).resolves.toBe("audit-id");

    const payload = mocks.rpc.mock.calls[0][1];
    expect(mocks.rpc).toHaveBeenCalledWith(
      "registrar_evento_auditoria",
      expect.objectContaining({
        p_tipo_accion: "CREACION",
        p_alumno_id: "student-1",
      }),
    );
    expect(payload).not.toHaveProperty("usuario_id");
    expect(payload).not.toHaveProperty("email_usuario");
    expect(payload).not.toHaveProperty("rol_usuario");
    expect(payload).not.toHaveProperty("p_old_values");
    expect(payload).not.toHaveProperty("p_new_values");
  });

  it("genera CSV real y neutraliza fórmulas de hoja de cálculo", () => {
    const csv = buildAuditCsv([
      {
        id: "event-1",
        userId: null,
        userEmail: "=HYPERLINK(\"https://example.invalid\")",
        userRole: "directivo",
        actionType: "CONSULTA",
        actionCategory: "CONSULTA",
        actionDescription: "Detalle, con coma",
        targetTable: "alumnos",
        targetRecordId: "student-1",
        purpose: "Seguimiento",
        studentId: "student-1",
        studentName: "Alumna",
        origin: "cliente_seguro",
        createdAt: null,
      },
    ]);

    expect(csv).toContain("ID del evento");
    expect(csv).toContain("NO_DOCUMENTADA");
    expect(csv).toContain(
      "'=HYPERLINK(\"\"https://example.invalid\"\")",
    );
    expect(csv).toContain('"Detalle, con coma"');
  });
});
