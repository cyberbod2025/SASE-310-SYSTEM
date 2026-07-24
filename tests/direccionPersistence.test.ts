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

import { loadDirectionPanorama } from "../src/components/direccion/direccionPersistence";

const databaseRow = {
  alumno_id: "student-1",
  matricula: "S-001",
  nombre_alumno: "Alumna Dirección",
  grupo: "1A",
  puntaje_riesgo: 72,
  estado_semaforo: "INTERVENCION",
  incidencias_abiertas: 3,
  ultima_incidencia: "2026-07-18T10:00:00.000Z",
  caso_orientacion_id: "case-1",
  estado_orientacion: "escalado_direccion",
  prioridad_orientacion: "alta",
  actualizacion_orientacion: "2026-07-18T11:00:00.000Z",
  seguimientos_orientacion: 2,
  diagnosticos_docentes: 1,
  planes_orientacion_activos: 1,
  proxima_revision_orientacion: "2026-07-20",
  trabajo_social_abiertos: 1,
  ultima_actualizacion_social: "2026-07-18T12:00:00.000Z",
  bap_pendientes: 1,
  proxima_revision_bap: null,
  salud_seguimientos_pendientes: 1,
  proxima_revision_salud: "2026-07-19",
  total_pendientes: 7,
  proxima_accion: "2026-07-19",
  actualizacion_reciente: "2026-07-18T12:00:00.000Z",
  requiere_atencion: true,
  razones_atencion: ["Orientación solicitó decisión directiva"],
  fuentes_activas: ["Incidencias", "Orientación", "Trabajo Social"],
};

describe("direccionPersistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "direction-user" } },
      error: null,
    });
    mocks.rpc.mockResolvedValue({
      data: [databaseRow],
      error: null,
    });
  });

  it("mapea únicamente el panorama agregado confirmado", async () => {
    const result = await loadDirectionPanorama();

    expect(mocks.rpc).toHaveBeenCalledWith(
      "obtener_panorama_direccion",
    );
    expect(result[0]).toMatchObject({
      studentId: "student-1",
      studentName: "Alumna Dirección",
      riskScore: 72,
      openIncidents: 3,
      orientationState: "escalado_direccion",
      teacherDiagnoses: 1,
      totalPendingItems: 7,
      requiresAttention: true,
      attentionReasons: ["Orientación solicitó decisión directiva"],
    });
    expect(result[0]).not.toHaveProperty("clinicalNotes");
    expect(result[0]).not.toHaveProperty("bapDiagnosis");
    expect(result[0]).not.toHaveProperty("socialWorkNotes");
  });

  it("falla cerrado sin sesión y propaga RLS", async () => {
    mocks.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    await expect(loadDirectionPanorama()).rejects.toThrow(
      "La sesión institucional no está disponible.",
    );
    expect(mocks.rpc).not.toHaveBeenCalled();

    mocks.rpc.mockResolvedValueOnce({
      data: null,
      error: { code: "42501", message: "RLS denied" },
    });
    await expect(loadDirectionPanorama()).rejects.toMatchObject({
      code: "42501",
    });
  });

  it("rechaza una respuesta no tabular o sin identidad estudiantil", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: null, error: null });
    await expect(loadDirectionPanorama()).rejects.toThrow(
      "Supabase no confirmó el panorama de Dirección.",
    );

    mocks.rpc.mockResolvedValueOnce({
      data: [{ ...databaseRow, alumno_id: null }],
      error: null,
    });
    await expect(loadDirectionPanorama()).rejects.toThrow(
      "Supabase devolvió un panorama de Dirección inválido.",
    );
  });
});
