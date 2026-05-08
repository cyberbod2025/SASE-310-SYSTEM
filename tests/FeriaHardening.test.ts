import { beforeEach, describe, expect, it, vi } from "vitest";

// Mocks para Supabase y entorno
type MockState = {
  sessionUser: any;
  institutionalProfile: any;
};

const mockState: MockState = {
  sessionUser: null,
  institutionalProfile: null,
};

const createQueryMock = (data: any) => {
  const mock: any = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
    single: vi.fn().mockResolvedValue({ data, error: null }),
    // Para que funcione el Promise.all
    then: (onFullfilled: any) => Promise.resolve({ data: data ? (Array.isArray(data) ? data : [data]) : [], error: null }).then(onFullfilled)
  };
  return mock;
};

const createClientMock = vi.fn(() => ({
  auth: {
    getUser: vi.fn(async () => ({
      data: { user: mockState.sessionUser },
      error: mockState.sessionUser ? null : new Error("Invalid session"),
    })),
  },
  from: vi.fn((table: string) => {
    if (table === "perfiles_usuario") return createQueryMock(mockState.institutionalProfile);
    if (table === "modulos_ecosistema") return createQueryMock({ id: "f1", key: "feria", is_active: true, base_url: "https://feria.test" });
    if (table === "modulos_ecosistema_roles") return createQueryMock([{ is_active: true }]);
    if (table === "modulos_ecosistema_usuarios") return createQueryMock([{ is_active: true }]);
    if (table === "auditoria") return { insert: vi.fn().mockResolvedValue({ error: null }) };
    return createQueryMock(null);
  }),
  rpc: vi.fn().mockResolvedValue({ data: [{ is_active: true }], error: null })
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

function decodePayloadFromUrl(urlString: string) {
  if (!urlString) return {};
  const url = new URL(urlString);
  const token = url.searchParams.get("sase_token");
  if (!token) return {};
  const [payloadBase64Url] = token.split(".");
  const payloadJson = Buffer.from(
    payloadBase64Url.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  ).toString("utf8");
  return JSON.parse(payloadJson);
}

describe("Feria Hardening: Role Mapping", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.SASE_SHARED_SECRET = "test-secret";
    process.env.SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    process.env.FERIA_APP_URL = "https://feria.app";
    process.env.ALLOWED_ORIGINS = "http://localhost:3100";
  });

  const runLaunch = async (role: string, id: string = "u-test") => {
    mockState.sessionUser = { id, email: `${id}@test.mx` };
    mockState.institutionalProfile = { id, rol: role, nombre_completo: `${role} Test`, email: `${id}@test.mx` };

    const { handleModuleLaunch } = await import("../api/modules/lib");
    const req: any = { 
      method: "POST", 
      body: { module: "feria" },
      headers: { 
        authorization: "Bearer token",
        origin: "http://localhost:3100"
      } 
    };
    const res: any = { 
      status: vi.fn().mockReturnThis(), 
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
      end: vi.fn()
    };

    await handleModuleLaunch(req, res);
    return res;
  };

  it("asigna rol 'student' a un Alumno", async () => {
    const res = await runLaunch("alumno", "u-alumno");
    expect(res.status).toHaveBeenCalledWith(200);
    const call = res.json.mock.calls[0][0];
    const payload = decodePayloadFromUrl(call.url);
    
    expect(payload.role).toBe("student");
    expect(payload.sub).toBe("u-alumno");
    expect(payload.module).toBe("feria");
  });

  it("asigna rol 'teacher' a un Docente", async () => {
    const res = await runLaunch("docente", "u-docente");
    expect(res.status).toHaveBeenCalledWith(200);
    const call = res.json.mock.calls[0][0];
    const payload = decodePayloadFromUrl(call.url);
    
    expect(payload.role).toBe("teacher");
  });

  it("asigna rol 'admin' a un Directivo", async () => {
    const res = await runLaunch("directivo", "u-dir");
    expect(res.status).toHaveBeenCalledWith(200);
    const call = res.json.mock.calls[0][0];
    const payload = decodePayloadFromUrl(call.url);
    
    expect(payload.role).toBe("admin");
  });

  it("asigna rol 'admin' a un Admin", async () => {
    const res = await runLaunch("admin", "u-admin");
    expect(res.status).toHaveBeenCalledWith(200);
    const call = res.json.mock.calls[0][0];
    const payload = decodePayloadFromUrl(call.url);
    
    expect(payload.role).toBe("admin");
  });

  it("asigna rol 'staff' a roles de apoyo (Orientación, Trabajo Social, Médico)", async () => {
    const roles = ["orientacion", "trabajo_social", "medico_escolar"];
    for (const role of roles) {
      const res = await runLaunch(role, `u-${role}`);
      expect(res.status).toHaveBeenCalledWith(200);
      const call = res.json.mock.calls[0][0];
      const payload = decodePayloadFromUrl(call.url);
      expect(payload.role).toBe("staff");
    }
  });

  it("asigna rol 'admin' a Developer", async () => {
    const res = await runLaunch("developer", "u-dev");
    expect(res.status).toHaveBeenCalledWith(200);
    const call = res.json.mock.calls[0][0];
    const payload = decodePayloadFromUrl(call.url);
    
    expect(payload.role).toBe("admin");
  });
});
