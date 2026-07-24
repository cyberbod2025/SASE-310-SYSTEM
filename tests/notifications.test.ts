import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendWhatsAppNotification } from "../src/utils/notifications";

const authMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
}));

vi.mock("../src/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: authMocks.getSession,
    },
  },
}));

describe("sendWhatsAppNotification", () => {
  beforeEach(() => {
    authMocks.getSession.mockResolvedValue({
      data: {
        session: {
          access_token: "token-institucional",
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("envía únicamente el identificador de la incidencia", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          delivered: true,
          status: "sent",
          attemptId: "7609e192-1c05-4a6c-a09a-449978560dc3",
          incidentId: "70d39066-2835-47ef-8d7a-042818787eb5",
          messageId: "wamid.confirmado",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      sendWhatsAppNotification({
        incidentId: "70d39066-2835-47ef-8d7a-042818787eb5",
      }),
    ).resolves.toEqual({
      delivered: true,
      status: "sent",
      attemptId: "7609e192-1c05-4a6c-a09a-449978560dc3",
      incidentId: "70d39066-2835-47ef-8d7a-042818787eb5",
      messageId: "wamid.confirmado",
    });

    const [, options] = fetchMock.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({
      incidentId: "70d39066-2835-47ef-8d7a-042818787eb5",
    });
    expect(options.headers.Authorization).toBe(
      "Bearer token-institucional",
    );
  });

  it("no confunde simulación con entrega", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            delivered: false,
            status: "simulated",
            attemptId: "7609e192-1c05-4a6c-a09a-449978560dc3",
            incidentId: "70d39066-2835-47ef-8d7a-042818787eb5",
            error:
              "Canal no configurado; la incidencia no fue marcada como notificada.",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    );

    const result = await sendWhatsAppNotification({
      incidentId: "70d39066-2835-47ef-8d7a-042818787eb5",
    });

    expect(result.delivered).toBe(false);
    expect(result.status).toBe("simulated");
  });

  it("falla cerrado sin sesión o ante una respuesta ambigua", async () => {
    authMocks.getSession.mockResolvedValueOnce({
      data: { session: null },
    });
    await expect(
      sendWhatsAppNotification({
        incidentId: "70d39066-2835-47ef-8d7a-042818787eb5",
      }),
    ).resolves.toMatchObject({
      delivered: false,
      status: "failed",
    });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "sent" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    await expect(
      sendWhatsAppNotification({
        incidentId: "70d39066-2835-47ef-8d7a-042818787eb5",
      }),
    ).resolves.toMatchObject({
      delivered: false,
      status: "failed",
    });
  });
});
