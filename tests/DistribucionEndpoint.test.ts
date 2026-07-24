import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getUser: vi.fn(),
  from: vi.fn(),
  isRateLimited: vi.fn(),
  getRateLimitKey: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: serviceMocks.createClient,
}));

vi.mock("../api/ai/rateLimit", () => ({
  getRateLimitKey: serviceMocks.getRateLimitKey,
  isRateLimited: serviceMocks.isRateLimited,
}));

import handler from "../api/ai/distribucion";

type QueryResult = {
  data: unknown;
  error: unknown;
};

function createQuery(result: QueryResult) {
  const query: any = {};
  query.select = vi.fn(() => query);
  query.eq = vi.fn(() => query);
  query.maybeSingle = vi.fn(() => Promise.resolve(result));
  query.then = (
    resolve: (value: QueryResult) => unknown,
    reject: (reason: unknown) => unknown,
  ) => Promise.resolve(result).then(resolve, reject);
  return query;
}

function createResponse() {
  const state: {
    status?: number;
    body?: unknown;
    headers: Record<string, string>;
    ended: boolean;
  } = {
    headers: {},
    ended: false,
  };

  const response: any = {
    setHeader: vi.fn((name: string, value: string) => {
      state.headers[name] = value;
    }),
    status: vi.fn((status: number) => {
      state.status = status;
      return response;
    }),
    json: vi.fn((body: unknown) => {
      state.body = body;
      return response;
    }),
    end: vi.fn(() => {
      state.ended = true;
      return response;
    }),
  };

  return { response, state };
}

const cycleId = "a1111111-1111-4111-8111-111111111111";
const studentA = "11111111-1111-4111-8111-111111111111";
const studentB = "22222222-2222-4222-8222-222222222222";
const studentC = "33333333-3333-4333-8333-333333333333";
const groupA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const groupB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

function configureAuthorizedQueries(options?: { auditError?: unknown }) {
  const profileQuery = createQuery({
    data: { rol: "directivo", email: "direccion@sase.mx" },
    error: null,
  });
  const cycleQuery = createQuery({
    data: { id: cycleId, nombre: "2026-2027" },
    error: null,
  });
  const enrollmentQuery = createQuery({
    data: [
      {
        alumno_id: studentA,
        alumnos: { puntaje_riesgo: 10 },
      },
      {
        alumno_id: studentC,
        alumnos: { puntaje_riesgo: 80 },
      },
      {
        alumno_id: studentB,
        alumnos: { puntaje_riesgo: 80 },
      },
    ],
    error: null,
  });
  const groupQuery = createQuery({
    data: [
      { id: groupA, nombre: "1B" },
      { id: groupB, nombre: "1A" },
    ],
    error: null,
  });
  const auditInsert = vi.fn().mockResolvedValue({
    data: null,
    error: options?.auditError ?? null,
  });

  serviceMocks.from.mockImplementation((table: string) => {
    if (table === "perfiles_usuario") return profileQuery;
    if (table === "ciclos_escolares") return cycleQuery;
    if (table === "alumno_ciclo") return enrollmentQuery;
    if (table === "grupos") return groupQuery;
    if (table === "auditoria") return { insert: auditInsert };
    throw new Error(`Tabla inesperada: ${table}`);
  });

  return { auditInsert };
}

function createRequest(body: Record<string, unknown>) {
  return {
    method: "POST",
    headers: {
      origin: "http://localhost:3100",
      authorization: "Bearer token-institucional",
      "x-forwarded-for": "127.0.0.1",
    },
    body,
  };
}

describe("api/ai/distribucion", () => {
  beforeEach(() => {
    vi.stubEnv("ALLOWED_ORIGINS", "http://localhost:3100");
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-test");
    serviceMocks.getUser.mockResolvedValue({
      data: {
        user: {
          id: "99999999-9999-4999-8999-999999999999",
          email: "direccion@sase.mx",
        },
      },
      error: null,
    });
    serviceMocks.getRateLimitKey.mockReturnValue("127.0.0.1");
    serviceMocks.isRateLimited.mockResolvedValue(false);
    serviceMocks.createClient.mockReturnValue({
      auth: { getUser: serviceMocks.getUser },
      from: serviceMocks.from,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("genera una propuesta determinista, mínima y auditada", async () => {
    const { auditInsert } = configureAuthorizedQueries();
    const { response, state } = createResponse();

    await handler(
      createRequest({
        cycleId,
        purpose: "Preparar revisión colegiada de grupos para el siguiente corte",
      }),
      response,
    );

    expect(state.status).toBe(200);
    expect(state.body).toMatchObject({
      ciclo_id: cycleId,
      alumnos_considerados: 3,
      grupos_considerados: 2,
      solo_propuesta: true,
      requiere_aprobacion_humana: true,
      sugerencias: [
        {
          alumno_id: studentB,
          grupo_id: groupB,
          grupo_sugerido: "1A",
        },
        {
          alumno_id: studentC,
          grupo_id: groupA,
          grupo_sugerido: "1B",
        },
        {
          alumno_id: studentA,
          grupo_id: groupB,
          grupo_sugerido: "1A",
        },
      ],
    });
    expect(JSON.stringify(state.body)).not.toContain("puntaje");
    expect(JSON.stringify(state.body)).not.toContain("datos_bap");
    expect(auditInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        usuario_id: "99999999-9999-4999-8999-999999999999",
        rol_usuario: "directivo",
        id_registro_objetivo: cycleId,
        proposito:
          "Preparar revisión colegiada de grupos para el siguiente corte",
        origen: "servidor",
        new_values: {
          ciclo_id: cycleId,
          alumnos_considerados: 3,
          grupos_considerados: 2,
          solo_propuesta: true,
        },
      }),
    );
  });

  it("falla cerrado con un rol no autorizado antes de consultar el ciclo", async () => {
    const profileQuery = createQuery({
      data: { rol: "docente", email: "docente@sase.mx" },
      error: null,
    });
    serviceMocks.from.mockImplementation((table: string) => {
      if (table === "perfiles_usuario") return profileQuery;
      throw new Error(`Consulta no autorizada: ${table}`);
    });
    const { response, state } = createResponse();

    await handler(
      createRequest({
        cycleId,
        purpose: "Revisar grupos",
      }),
      response,
    );

    expect(state.status).toBe(403);
    expect(serviceMocks.from).toHaveBeenCalledTimes(1);
  });

  it("no devuelve la propuesta si no puede registrar la auditoría", async () => {
    configureAuthorizedQueries({
      auditError: { code: "42501", message: "RLS denied" },
    });
    const { response, state } = createResponse();

    await handler(
      createRequest({
        cycleId,
        purpose: "Revisión de equilibrio entre grupos",
      }),
      response,
    );

    expect(state.status).toBe(500);
    expect(state.body).toEqual({
      error: "No se pudo registrar la trazabilidad de la propuesta.",
    });
  });

  it("rechaza campos adicionales sin consultar datos del ciclo", async () => {
    const profileQuery = createQuery({
      data: { rol: "directivo", email: "direccion@sase.mx" },
      error: null,
    });
    serviceMocks.from.mockImplementation((table: string) => {
      if (table === "perfiles_usuario") return profileQuery;
      throw new Error(`Consulta inesperada: ${table}`);
    });
    const { response, state } = createResponse();

    await handler(
      createRequest({
        cycleId,
        purpose: "Revisar grupos",
        autoApply: true,
      }),
      response,
    );

    expect(state.status).toBe(400);
    expect(serviceMocks.from).toHaveBeenCalledTimes(1);
  });
});
