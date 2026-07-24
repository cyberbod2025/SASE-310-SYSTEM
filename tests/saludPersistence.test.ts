import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const getUser = vi.fn();
  const loadResults: Record<string, { data: unknown[]; error: unknown }> = {
    atenciones_medicas: { data: [], error: null },
    salud: { data: [], error: null },
  };
  const writeResults: Record<string, { data: unknown; error: unknown }> = {
    atenciones_medicas: { data: null, error: null },
    salud: { data: null, error: null },
  };
  const inserts: Record<string, unknown> = {};
  const updates: Record<string, unknown> = {};
  const filters: Array<[string, string, unknown]> = [];

  const from = vi.fn((table: string) => {
    const loadQuery: Record<string, ReturnType<typeof vi.fn>> = {};
    loadQuery.in = vi.fn((column: string, value: unknown) => {
      filters.push([table, column, value]);
      return loadQuery;
    });
    loadQuery.eq = vi.fn((column: string, value: unknown) => {
      filters.push([table, column, value]);
      return loadQuery;
    });
    loadQuery.order = vi.fn(() => Promise.resolve(loadResults[table]));

    const mutationQuery: Record<string, ReturnType<typeof vi.fn>> = {};
    mutationQuery.eq = vi.fn((column: string, value: unknown) => {
      filters.push([table, column, value]);
      return mutationQuery;
    });
    mutationQuery.select = vi.fn(() => ({
      single: vi.fn(() => Promise.resolve(writeResults[table])),
    }));

    return {
      select: vi.fn(() => loadQuery),
      insert: vi.fn((payload: unknown) => {
        inserts[table] = payload;
        return {
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve(writeResults[table])),
          })),
        };
      }),
      update: vi.fn((payload: unknown) => {
        updates[table] = payload;
        return mutationQuery;
      }),
    };
  });

  return {
    filters,
    from,
    getUser,
    inserts,
    loadResults,
    updates,
    writeResults,
  };
});

vi.mock("../src/supabase/client", () => ({
  supabase: {
    auth: { getUser: mocks.getUser },
    from: mocks.from,
  },
}));

import {
  deactivateHealthAlert,
  loadHealthMemory,
  persistHealthAlert,
  persistMedicalAttention,
  updateMedicalAttention,
} from "../src/components/salud/saludPersistence";

const attentionRow = {
  id: "attention-1",
  alumno_id: "student-1",
  nombre_alumno: "Alumna Salud",
  grupo: "2A",
  motivo: "Dolor de cabeza",
  sintomas: "Cefalea",
  diagnostico: null,
  signos_vitales: "TA 110/70",
  atencion_brindada: "Reposo e hidratación",
  tratamiento: "Reposo e hidratación",
  medicamento: null,
  notificacion_padres: "true",
  acudieron_por_el: "false",
  condiciones_entrega: null,
  observaciones: "Revalorar en una hora",
  estado_atencion: "observacion",
  nivel_urgencia: "media",
  fecha_seguimiento: "2026-07-19",
  tipo_salida: "regreso_clase",
  atendido_por: "medical-user",
  generado_por: "medical-user",
  hora: "2026-07-18T16:00:00.000Z",
  updated_at: "2026-07-18T16:05:00.000Z",
};

const alertRow = {
  id: "alert-1",
  alumno_id: "student-1",
  tipo_alerta: "alergia",
  padecimiento: "Alergia al cacahuate",
  alergias: "Alergia al cacahuate",
  medicamentos: null,
  indicaciones: "Evitar exposición y aplicar protocolo familiar.",
  activa: true,
  actualizado_por: "medical-user",
  created_at: "2026-07-18T15:00:00.000Z",
  ultima_actualizacion: "2026-07-18T15:00:00.000Z",
};

describe("saludPersistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.filters.length = 0;
    delete mocks.inserts.atenciones_medicas;
    delete mocks.inserts.salud;
    delete mocks.updates.atenciones_medicas;
    delete mocks.updates.salud;
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "medical-user" } },
      error: null,
    });
    mocks.loadResults.atenciones_medicas = { data: [], error: null };
    mocks.loadResults.salud = { data: [], error: null };
    mocks.writeResults.atenciones_medicas = { data: attentionRow, error: null };
    mocks.writeResults.salud = { data: alertRow, error: null };
  });

  it("loads persisted attentions and active alerts for visible students", async () => {
    mocks.loadResults.atenciones_medicas.data = [attentionRow];
    mocks.loadResults.salud.data = [alertRow];

    const memory = await loadHealthMemory(["student-1", "student-2"]);

    expect(mocks.from).toHaveBeenCalledWith("atenciones_medicas");
    expect(mocks.from).toHaveBeenCalledWith("salud");
    expect(mocks.filters).toContainEqual([
      "atenciones_medicas",
      "alumno_id",
      ["student-1", "student-2"],
    ]);
    expect(mocks.filters).toContainEqual(["salud", "activa", true]);
    expect(memory.attentions[0]).toMatchObject({
      id: "attention-1",
      studentId: "student-1",
      status: "observacion",
      familyNotified: true,
    });
    expect(memory.alerts[0]).toMatchObject({
      id: "alert-1",
      type: "alergia",
      active: true,
    });
  });

  it("preserves legacy gaps with explicit non-documentation labels", async () => {
    mocks.loadResults.atenciones_medicas.data = [{
      ...attentionRow,
      motivo: null,
      sintomas: "",
      atencion_brindada: null,
      tratamiento: "",
      generado_por: null,
    }];

    const memory = await loadHealthMemory(["student-1"]);

    expect(memory.attentions[0]).toMatchObject({
      reason: "Motivo no documentado",
      symptoms: "Observación no documentada",
      careProvided: "Atención no documentada",
      createdBy: null,
    });
  });

  it("registers an attention with authenticated authorship", async () => {
    const persisted = await persistMedicalAttention({
      studentId: "student-1",
      studentName: "Alumna Salud",
      group: "2A",
      reason: "Dolor de cabeza",
      symptoms: "Cefalea",
      careProvided: "Reposo e hidratación",
      familyNotified: true,
      familyPickedUp: false,
      status: "observacion",
      urgency: "media",
      followUpDate: "2026-07-19",
      exitType: "regreso_clase",
    });

    expect(mocks.inserts.atenciones_medicas).toMatchObject({
      alumno_id: "student-1",
      generado_por: "medical-user",
      atendido_por: "medical-user",
      notificacion_padres: "true",
      estado_atencion: "observacion",
    });
    expect(persisted.id).toBe("attention-1");
  });

  it("registers an alert without creating an institutional incident", async () => {
    const persisted = await persistHealthAlert({
      studentId: "student-1",
      type: "alergia",
      condition: "Alergia al cacahuate",
      instructions: "Evitar exposición y aplicar protocolo familiar.",
    });

    expect(mocks.from).not.toHaveBeenCalledWith("incidencias");
    expect(mocks.inserts.salud).toMatchObject({
      alumno_id: "student-1",
      tipo_alerta: "alergia",
      alergias: "Alergia al cacahuate",
      actualizado_por: "medical-user",
      activa: true,
    });
    expect(persisted.type).toBe("alergia");
  });

  it("updates only the permitted follow-up fields", async () => {
    await updateMedicalAttention("attention-1", {
      status: "cerrada",
      observations: "Sin signos de alarma.",
      exitType: "entrega_familiar",
    });

    expect(mocks.filters).toContainEqual([
      "atenciones_medicas",
      "id",
      "attention-1",
    ]);
    expect(mocks.updates.atenciones_medicas).toEqual({
      estado_atencion: "cerrada",
      fecha_seguimiento: null,
      condiciones_entrega: null,
      observaciones: "Sin signos de alarma.",
      tipo_salida: "entrega_familiar",
    });
  });

  it("fails closed without a session and propagates RLS denials", async () => {
    mocks.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    await expect(loadHealthMemory(["student-1"]))
      .rejects.toThrow("La sesión institucional no está disponible.");
    expect(mocks.from).not.toHaveBeenCalled();

    mocks.writeResults.salud = {
      data: null,
      error: { code: "42501", message: "new row violates RLS" },
    };
    await expect(deactivateHealthAlert("alert-1"))
      .rejects.toMatchObject({ code: "42501" });
  });
});
