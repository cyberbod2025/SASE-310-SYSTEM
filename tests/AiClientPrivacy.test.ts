import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { routeAI } from "../src/components/ai/aiRouter";
import { generarSintesisInstitucionalLocal } from "../src/modules/expedientes/serviciosExpediente";

const authMocks = vi.hoisted(() => ({
  buildAuthHeaders: vi.fn().mockResolvedValue({
    Authorization: "Bearer token-institucional",
  }),
}));

vi.mock("../src/components/ai/aiAuth", () => ({
  buildAuthHeaders: authMocks.buildAuthHeaders,
}));

const guardsSource = readFileSync(
  resolve(process.cwd(), "src/components/ai/guards.ts"),
  "utf8",
).toLowerCase();
const clientSource = readFileSync(
  resolve(process.cwd(), "src/components/ai/aiClient.ts"),
  "utf8",
).toLowerCase();
const expedienteSource = readFileSync(
  resolve(process.cwd(), "src/modules/expedientes/serviciosExpediente.ts"),
  "utf8",
).toLowerCase();
const documentosSource = readFileSync(
  resolve(process.cwd(), "src/modules/documentos/GeneradorDocumentos.tsx"),
  "utf8",
).toLowerCase();

describe("Clientes de IA y privacidad", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("elimina placeholders y no serializa el contexto completo", () => {
    expect(guardsSource).not.toContain("placeholder");
    expect(guardsSource).not.toContain("simulad");
    expect(guardsSource).not.toContain("@@@");
    expect(clientSource).not.toContain("json.stringify(request.context)");
    expect(clientSource).toContain('contexttype: "asistente_institucional"');
  });

  it("routeAI envía propósito, contexto y autenticación, y exige borrador", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          text: "Borrador general",
          tokens: 12,
          draft: true,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      routeAI("Prepare un aviso general.", undefined, {
        purpose: "Preparar un aviso general sujeto a revisión",
        contextType: "borrador_documento",
      }),
    ).resolves.toEqual({ text: "Borrador general", tokens: 12 });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBe(
      "Bearer token-institucional",
    );
    expect(JSON.parse(options.body)).toMatchObject({
      prompt: "Prepare un aviso general.",
      purpose: "Preparar un aviso general sujeto a revisión",
      contextType: "borrador_documento",
    });
  });

  it("el expediente genera una síntesis local sin tráfico externo", () => {
    expect(expedienteSource).not.toContain("/api/ai/");
    expect(expedienteSource).not.toContain("nombre: ${alumno");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = generarSintesisInstitucionalLocal(
      [
        {
          id: "inc-1",
          fecha: "2026-07-24",
          tipo: "conducta",
          descripcion: "Dato reservado",
          estado: "abierto",
          reporta: "Prefectura",
        },
      ],
      [],
    );

    expect(result).toContain("1 incidencias");
    expect(result).toContain("no determina culpabilidad");
    expect(result).not.toContain("Dato reservado");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("el generador de documentos de caso usa un borrador local", () => {
    expect(documentosSource).not.toContain('fetch("/api/ai/gemini"');
    expect(documentosSource).toContain(
      "borrador local generado; revise los hechos",
    );
  });
});
