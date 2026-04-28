import { supabase } from "../supabase/client";
import type { EmergencyAlert, EmergencyResponse } from "../types/emergency";

type EscalationState = {
  getAlertById: (alertaId: string) => EmergencyAlert | null;
  getResponsesByAlertId: (alertaId: string) => EmergencyResponse[];
  onNotify?: (roles: string[], alertaId: string, reason: "resend" | "escalate") => void;
};

const activeLoops = new Map<string, number>();

function hasResponderOnTheWay(responses: EmergencyResponse[]) {
  return responses.some((response) => response.respuesta === "voy_en_camino" || response.respuesta === "atendida");
}

async function resend(alertaId: string, onNotify?: EscalationState["onNotify"]) {
  onNotify?.(["medico_escolar", "prefectura"], alertaId, "resend");
}

async function escalate(alertaId: string, nivel: 1 | 2, onNotify?: EscalationState["onNotify"]) {
  const roles = nivel === 1 ? ["directivo", "subdireccion"] : ["todos"];

  const { error } = await supabase
    .from("alertas_emergencia" as any)
    .update({ escalado_nivel: nivel, ultima_notificacion_at: new Date().toISOString() } as any)
    .eq("id", alertaId);

  if (!error) {
    onNotify?.(roles, alertaId, "escalate");
  }
}

export function stopEmergencyEscalation(alertaId: string) {
  const timer = activeLoops.get(alertaId);
  if (timer) {
    window.clearTimeout(timer);
    activeLoops.delete(alertaId);
  }
}

export function startEmergencyEscalationLoop(alertaId: string, getState: () => EscalationState) {
  if (typeof window === "undefined" || activeLoops.has(alertaId)) return;

  const t0 = Date.now();

  const tick = async () => {
    const state = getState();
    const alerta = state.getAlertById(alertaId);

    if (!alerta || alerta.estado !== "activa") {
      stopEmergencyEscalation(alertaId);
      return;
    }

    const responses = state.getResponsesByAlertId(alertaId);
    if (hasResponderOnTheWay(responses)) {
      stopEmergencyEscalation(alertaId);
      return;
    }

    const elapsed = Date.now() - t0;
    const escaladoNivel = alerta.escalado_nivel ?? 0;

    if (elapsed > 60_000 && escaladoNivel < 2) {
      await escalate(alertaId, 2, state.onNotify);
    } else if (elapsed > 30_000 && escaladoNivel < 1) {
      await escalate(alertaId, 1, state.onNotify);
    } else {
      await resend(alertaId, state.onNotify);
    }

    const timer = window.setTimeout(tick, 10_000);
    activeLoops.set(alertaId, timer);
  };

  void tick();
}
