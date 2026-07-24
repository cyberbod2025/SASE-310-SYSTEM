import { supabase } from "../lib/supabaseClient";

export interface WhatsAppNotificationParams {
  incidentId: string;
}

export type WhatsAppNotificationResult =
  | {
      delivered: true;
      status: "sent";
      attemptId: string;
      incidentId: string;
      messageId: string;
    }
  | {
      delivered: false;
      status: "simulated" | "failed";
      attemptId?: string;
      incidentId?: string;
      error: string;
    };

const readString = (
  value: unknown,
  key: string,
): string | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const field = (value as Record<string, unknown>)[key];
  return typeof field === "string" && field.trim() ? field.trim() : undefined;
};

/**
 * Solicita al servidor una notificación institucional. El navegador solo
 * identifica la incidencia; teléfono, plantilla y contenido se resuelven en
 * el servidor.
 */
export const sendWhatsAppNotification = async (
  params: WhatsAppNotificationParams,
): Promise<WhatsAppNotificationResult> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      delivered: false,
      status: "failed",
      error: "No hay una sesión institucional activa.",
    };
  }

  try {
    const response = await fetch("/api/notifications/whatsapp", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ incidentId: params.incidentId }),
    });
    const payload: unknown = await response.json().catch(() => null);
    const attemptId = readString(payload, "attemptId");
    const incidentId = readString(payload, "incidentId");
    const status = readString(payload, "status");
    const error =
      readString(payload, "error") ||
      "No se confirmó la entrega de la notificación.";

    if (
      response.ok &&
      status === "sent" &&
      payload &&
      typeof payload === "object" &&
      (payload as Record<string, unknown>).delivered === true
    ) {
      const messageId = readString(payload, "messageId");
      if (attemptId && incidentId && messageId) {
        return {
          delivered: true,
          status: "sent",
          attemptId,
          incidentId,
          messageId,
        };
      }
    }

    if (
      response.ok &&
      status === "simulated" &&
      payload &&
      typeof payload === "object" &&
      (payload as Record<string, unknown>).delivered === false
    ) {
      return {
        delivered: false,
        status: "simulated",
        attemptId,
        incidentId,
        error,
      };
    }

    return {
      delivered: false,
      status: "failed",
      attemptId,
      incidentId,
      error,
    };
  } catch {
    return {
      delivered: false,
      status: "failed",
      error: "No se pudo conectar con el servicio institucional de mensajería.",
    };
  }
};
