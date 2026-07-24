import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const securityMocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getUser: vi.fn(),
  from: vi.fn(),
  getRateLimitKey: vi.fn(),
  isRateLimited: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: securityMocks.createClient,
}));

vi.mock("../api/ai/rateLimit", () => ({
  getRateLimitKey: securityMocks.getRateLimitKey,
  isRateLimited: securityMocks.isRateLimited,
}));

import {
  authorizeInstitutionalAIRequest,
  containsSensitivePersonalData,
} from "../server/aiSecurity";

function createProfileQuery(profile: unknown, error: unknown = null) {
  const query: any = {};
  query.select = vi.fn(() => query);
  query.eq = vi.fn(() => query);
  query.maybeSingle = vi.fn().mockResolvedValue({ data: profile, error });
  return query;
}

const models = new Set(["modelo-institucional"]);

describe("seguridad común de IA", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-test");
    securityMocks.getUser.mockResolvedValue({
      data: {
        user: {
          id: "99999999-9999-4999-8999-999999999999",
          email: "direccion@sase.mx",
        },
      },
      error: null,
    });
    securityMocks.getRateLimitKey.mockReturnValue("127.0.0.1");
    securityMocks.isRateLimited.mockResolvedValue(false);
    securityMocks.from.mockReturnValue(
      createProfileQuery({
        rol: "directivo",
        email: "direccion@sase.mx",
      }),
    );
    securityMocks.createClient.mockReturnValue({
      auth: { getUser: securityMocks.getUser },
      from: securityMocks.from,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("detecta identificadores personales escolares frecuentes", () => {
    expect(
      containsSensitivePersonalData("CURP: PELA000101MDFRPN01"),
    ).toBe(true);
    expect(
      containsSensitivePersonalData("Contacto ana.perez@example.com"),
    ).toBe(true);
    expect(
      containsSensitivePersonalData("Teléfono 55 1234 5678"),
    ).toBe(true);
    expect(
      containsSensitivePersonalData("Alumno: Juan Pérez López"),
    ).toBe(true);
    expect(
      containsSensitivePersonalData('{"datos_tutor":{"phone":"x"}}'),
    ).toBe(true);
  });

  it("permite lenguaje escolar sensible cuando no contiene identificadores", () => {
    expect(
      containsSensitivePersonalData(
        "Proponga acciones formativas ante un reporte de violencia sin datos personales.",
      ),
    ).toBe(false);
  });

  it("autoriza solo después de validar token, perfil, propósito y contexto", async () => {
    const result = await authorizeInstitutionalAIRequest(
      {
        headers: {
          authorization: "Bearer token-institucional",
          "x-forwarded-for": "127.0.0.1",
        },
        body: {
          prompt: "Redacte un recordatorio general para el personal.",
          model: "modelo-institucional",
          purpose: "Preparar un borrador general sujeto a revisión",
          contextType: "borrador_documento",
        },
      },
      models,
      "modelo-institucional",
    );

    expect(result).toMatchObject({
      ok: true,
      value: {
        role: "directivo",
        contextType: "borrador_documento",
        purpose: "Preparar un borrador general sujeto a revisión",
      },
    });
    expect(securityMocks.getUser).toHaveBeenCalledWith(
      "token-institucional",
    );
    expect(securityMocks.isRateLimited).toHaveBeenCalledWith(
      "ia-institucional:99999999-9999-4999-8999-999999999999:127.0.0.1",
      20,
      60_000,
    );
  });

  it("rechaza PII y roles no institucionales", async () => {
    const sensitive = await authorizeInstitutionalAIRequest(
      {
        headers: { authorization: "Bearer token-institucional" },
        body: {
          prompt: "Alumno: Juan Pérez López",
          purpose: "Analizar un caso",
          contextType: "asistente_institucional",
        },
      },
      models,
      "modelo-institucional",
    );
    expect(sensitive).toMatchObject({ ok: false, status: 422 });

    securityMocks.from.mockReturnValueOnce(
      createProfileQuery({ rol: "alumno", email: "alumno@sase.mx" }),
    );
    const unauthorized = await authorizeInstitutionalAIRequest(
      {
        headers: { authorization: "Bearer token-institucional" },
        body: {
          prompt: "Consulta general",
          purpose: "Solicitar apoyo",
          contextType: "asistente_institucional",
        },
      },
      models,
      "modelo-institucional",
    );
    expect(unauthorized).toMatchObject({ ok: false, status: 403 });
  });
});
