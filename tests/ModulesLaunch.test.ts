import { beforeEach, describe, expect, it, vi } from "vitest";

type MockReq = {
  method: string;
  body?: unknown;
  headers: Record<string, string>;
};

type MockRes = {
  statusCode: number;
  headers: Record<string, string>;
  body: any;
  ended: boolean;
  setHeader: (key: string, value: string) => void;
  status: (code: number) => MockRes;
  json: (payload: any) => MockRes;
  end: () => MockRes;
};

type MockState = {
  sessionUser: { id: string; email: string; user_metadata?: Record<string, unknown> } | null;
  institutionalProfile: Record<string, unknown> | null;
  legacyProfile: Record<string, unknown> | null;
  moduleRecord: Record<string, unknown> | null;
  roleRules: Array<Record<string, unknown>>;
  userRules: Array<Record<string, unknown>>;
  emailRules: Array<Record<string, unknown>>;
  auditRows: Array<Record<string, unknown>>;
};

const mockState: MockState = {
  sessionUser: null,
  institutionalProfile: null,
  legacyProfile: null,
  moduleRecord: null,
  roleRules: [],
  userRules: [],
  emailRules: [],
  auditRows: [],
};

function resetMockState() {
  mockState.sessionUser = {
    id: "teacher-1",
    email: process.env.TEST_DOCENTE_EMAIL || "pilot.docente@sase.mx",
    user_metadata: { full_name: "Docente Piloto" },
  };
  mockState.institutionalProfile = {
    id: "teacher-1",
    rol: "docente",
    email: process.env.TEST_DOCENTE_EMAIL || "pilot.docente@sase.mx",
    nombre_completo: "Docente Piloto",
    grupo_tutor: "2A",
    grupos: ["2A", "2B"],
  };
  mockState.legacyProfile = null;
  mockState.moduleRecord = {
    id: "module-feria",
    key: "feria",
    name: "Feria de Ciencias",
    base_url: "https://db.example.test/#/docente",
    is_active: true,
  };
  mockState.roleRules = [{ is_active: true, starts_at: null, ends_at: null }];
  mockState.userRules = [];
  mockState.emailRules = [];
  mockState.auditRows = [];
}

function createResponse(): MockRes {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    ended: false,
    setHeader(key: string, value: string) {
      this.headers[key] = value;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
}

class QueryBuilder {
  private filters: Record<string, unknown> = {};

  constructor(private table: string) {}

  select() {
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters[column] = value;
    return this;
  }

  ilike(column: string, value: unknown) {
    this.filters[column] = typeof value === "string" ? value.toLowerCase() : value;
    return this;
  }

  async maybeSingle() {
    switch (this.table) {
      case "perfiles_usuario":
        return { data: mockState.institutionalProfile, error: null };
      case "profiles":
        return { data: mockState.legacyProfile, error: null };
      case "modulos_ecosistema":
        return { data: mockState.moduleRecord, error: null };
      default:
        return { data: null, error: null };
    }
  }

  async then(resolve: (value: any) => unknown) {
    let data: Array<Record<string, unknown>> = [];

    if (this.table === "modulos_ecosistema_roles") {
      data = mockState.roleRules;
    }

    if (this.table === "modulos_ecosistema_usuarios") {
      if (this.filters.user_id) {
        data = mockState.userRules;
      } else if (this.filters.email) {
        data = mockState.emailRules;
      }
    }

    return resolve({ data, error: null });
  }

  async insert(payload: Record<string, unknown>) {
    if (this.table === "auditoria") {
      mockState.auditRows.push(payload);
    }
    return { data: payload, error: null };
  }
}

const createClientMock = vi.fn(() => ({
  auth: {
    getUser: vi.fn(async () => ({
      data: { user: mockState.sessionUser },
      error: mockState.sessionUser ? null : new Error("Invalid session"),
    })),
  },
  from: (table: string) => new QueryBuilder(table),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

function decodePayloadFromUrl(urlString: string) {
  const url = new URL(urlString);
  const token = url.searchParams.get("sase_token");
  expect(token).toBeTruthy();

  const [payloadBase64Url, signature] = token!.split(".");
  const payloadJson = Buffer.from(
    payloadBase64Url.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  ).toString("utf8");

  return {
    url,
    token: token!,
    payload: JSON.parse(payloadJson),
    signature,
  };
}

describe("Launcher de modulos externos", () => {
  beforeEach(() => {
    vi.resetModules();
    resetMockState();
    process.env.SUPABASE_URL = "https://supabase.example.test";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test";
    process.env.SASE_SHARED_SECRET = "secret-test-123";
    process.env.FERIA_APP_URL = "https://feria.example.com/#/docente";
    process.env.DIAGNOSTICO_APP_URL = "https://diagnostico.example.com/";
    process.env.MATE_APP_URL = "https://mate.example.com/";
    process.env.NODE_ENV = "test";
  });

  it("genera URL con hash preservado, sub canonico y firma base64url", async () => {
    const { default: handler } = await import("../api/modules/launch");
    const req: MockReq = {
      method: "POST",
      body: { module: "feria" },
      headers: { authorization: "Bearer test-token" },
    };
    const res = createResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(mockState.auditRows.at(-1)?.tipo_accion).toBe("MODULO_LAUNCH_OK");

    const { url, payload, signature } = decodePayloadFromUrl(res.body.url);
    expect(url.origin + url.pathname).toBe("https://feria.example.com/");
    expect(url.hash).toBe("#/docente");
    expect(payload.sub).toBe("teacher-1");
    expect(payload.uid).toBe("teacher-1");
    expect(payload.email).toBe(process.env.TEST_DOCENTE_EMAIL || "pilot.docente@sase.mx");
    expect(payload.role).toBe("teacher");
    expect(payload.module).toBe("feria");
    expect(payload.institutionId).toBe("09DES4310M");
    expect(payload.groupId).toBe("2A");
    expect(payload.exp - payload.iat).toBeLessThanOrEqual(300);
    expect(signature).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(signature).not.toMatch(/^[a-f0-9]+$/i);
  });

  it("rechaza a usuario sin regla activa y audita denial", async () => {
    const { default: handler } = await import("../api/modules/launch");
    mockState.roleRules = [];
    mockState.userRules = [];
    mockState.emailRules = [];

    const req: MockReq = {
      method: "POST",
      body: { module: "feria" },
      headers: { authorization: "Bearer test-token" },
    };
    const res = createResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/acceso/i);
    expect(mockState.auditRows.at(-1)?.tipo_accion).toBe("MODULO_LAUNCH_DENIED");
  });

  it("launch-feria delega al launcher generico con modulo forzado", async () => {
    const { default: feriaHandler } = await import("../api/auth/launch-feria");
    const req: MockReq = {
      method: "POST",
      body: {},
      headers: { authorization: "Bearer test-token" },
    };
    const res = createResponse();

    await feriaHandler(req, res);

    expect(res.statusCode).toBe(200);
    const { payload, url } = decodePayloadFromUrl(res.body.url);
    expect(payload.module).toBe("feria");
    expect(url.hash).toBe("#/docente");
  });
});
