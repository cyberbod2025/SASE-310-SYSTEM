import { supabase } from "../supabase/client";

/**
 * Utilidad frontend para interactuar con el servicio de notificaciones SASE.
 */

interface WhatsAppNotificationParams {
  to: string;
  message: string;
  studentName?: string;
  incidentType?: string;
}

export const sendWhatsAppNotification = async (params: WhatsAppNotificationParams) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("No hay sesión activa para enviar notificaciones");
    }

    const response = await fetch("/api/notifications/whatsapp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Error al enviar notificación");
    }

    return { 
      success: true, 
      status: result.status, 
      messageId: result.meta_id 
    };
  } catch (error: any) {
    console.error("[WhatsAppService] Error:", error.message);
    return { success: false, error: error.message };
  }
};
