import { afterEach, describe, expect, it, vi } from "vitest";
import {
  submitStaffAccessRequest,
  verifyOfficialStaff,
} from "../src/components/personal/registroPersonalPersistence";

const validRequest = {
  rolDeclarado: "docente",
  turno: "vespertino",
  nombres: "Ana María",
  apellidoPaterno: "Pérez",
  apellidoMaterno: "López",
  curp: "PELA000101MDFRPN01",
  correoInstitucional: "ana.perez@sase.mx",
  cct: "09DES4310M",
  aceptaPrivacidad: true,
  aceptaEtica: true,
  aceptaAuditoria: true,
};

describe("registroPersonalPersistence", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("consulta únicamente los dos órdenes normalizados del nombre", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ match: true, role: "docente" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      verifyOfficialStaff(
        "Ana María Pérez López",
        "Pérez López Ana María",
      ),
    ).resolves.toEqual({ match: true, role: "docente" });

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/verify-staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "ANA MARIA PEREZ LOPEZ",
        alternateFullName: "PEREZ LOPEZ ANA MARIA",
      }),
    });
  });

  it("envía al servidor solo el payload mínimo y recibe un folio pendiente", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          folio: "REQ-2026-A1B2C3D4E5F6",
          estado: "PENDIENTE",
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(submitStaffAccessRequest(validRequest)).resolves.toEqual({
      folio: "REQ-2026-A1B2C3D4E5F6",
    });

    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/register-staff",
      expect.objectContaining({ method: "POST" }),
    );
    expect(body).toEqual({
      rolDeclarado: "docente",
      turno: "vespertino",
      nombres: "ANA MARÍA",
      apellidoPaterno: "PÉREZ",
      apellidoMaterno: "LÓPEZ",
      curp: "PELA000101MDFRPN01",
      correoInstitucional: "ana.perez@sase.mx",
      cct: "09DES4310M",
      aceptaPrivacidad: true,
      aceptaEtica: true,
      aceptaAuditoria: true,
    });
    expect(body).not.toHaveProperty("password");
    expect(body).not.toHaveProperty("preguntasSeguridad");
    expect(body).not.toHaveProperty("fechaNacimiento");
    expect(body).not.toHaveProperty("rfc");
    expect(body).not.toHaveProperty("matricula");
    expect(body).not.toHaveProperty("metadata");
  });

  it("falla antes de la red con correo externo y conserva errores del servidor", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      submitStaffAccessRequest({
        ...validRequest,
        correoInstitucional: "ana@example.com",
      }),
    ).rejects.toThrow("nombre.apellido@sase.mx");
    expect(fetchMock).not.toHaveBeenCalled();

    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: "La función seleccionada no coincide con la nómina oficial.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );
    await expect(submitStaffAccessRequest(validRequest)).rejects.toThrow(
      "no coincide con la nómina oficial",
    );
  });
});
