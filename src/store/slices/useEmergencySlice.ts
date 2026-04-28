import { useCallback, useEffect, useRef, useState } from "react";
import type { SetStateAction } from "react";
import { supabase } from "../../supabase/client";
import type {
  EmergencyAlert,
  EmergencyCreateOptions,
  EmergencyResponse,
} from "../../types/emergency";
import toast from "react-hot-toast";
import {
  deleteOfflineAlert,
  saveOfflineAlert,
  syncOfflineAlerts,
} from "../../services/offlineQueue";
import {
  startEmergencyEscalationLoop,
  stopEmergencyEscalation,
} from "../../services/emergencyEscalation";

const STAFF_ROLES = new Set([
  "directivo",
  "subdireccion",
  "prefectura",
  "medico_escolar",
  "orientacion",
  "trabajo_social",
  "system_admin",
  "developer",
  "admin",
]);

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeRole(role: unknown) {
  return typeof role === "string" ? role.trim().toLowerCase() : "";
}

async function playEmergencySound() {
  const sound = await import("../../utils/sound").catch(() => null);
  sound?.playNotificationSound?.();
}

async function requestBackgroundSync() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.ready.catch(() => null);
  const sync = (registration as any)?.sync;
  if (sync?.register) {
    await sync.register("sync-emergency-alerts").catch(() => undefined);
  }
}

export const useEmergencySlice = (user: any, userProfile: any) => {
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);
  const [myActiveAlert, setMyActiveAlert] = useState<EmergencyAlert | null>(null);
  const [emergencyResponses, setEmergencyResponses] = useState<Record<string, EmergencyResponse[]>>({});
  const [emergencyLoading, setEmergencyLoading] = useState(false);

  const alertsRef = useRef<EmergencyAlert[]>([]);
  const responsesRef = useRef<Record<string, EmergencyResponse[]>>({});

  const isStaff = STAFF_ROLES.has(normalizeRole(userProfile?.rol));

  const setAlertsState = useCallback((alerts: EmergencyAlert[]) => {
    alertsRef.current = alerts;
    setActiveAlerts(alerts);
  }, []);

  const setResponsesState = useCallback((updater: SetStateAction<Record<string, EmergencyResponse[]>>) => {
    setEmergencyResponses((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      responsesRef.current = next;
      return next;
    });
  }, []);

  const getEscalationState = useCallback(
    () => ({
      getAlertById: (alertaId: string) => alertsRef.current.find((alert) => alert.id === alertaId) || null,
      getResponsesByAlertId: (alertaId: string) => responsesRef.current[alertaId] || [],
      onNotify: (roles: string[], alertaId: string, reason: "resend" | "escalate") => {
        const label = roles.includes("todos") ? "todo el personal" : roles.join(", ");
        if (reason === "escalate") {
          toast.error(`Alerta ${alertaId.slice(0, 8)} escalada a ${label}.`);
        }
      },
    }),
    [],
  );

  const hydrateAlert = useCallback((alert: EmergencyAlert) => {
    setAlertsState([alert, ...alertsRef.current.filter((item) => item.id !== alert.id)]);
    if (alert.docente_id === user?.id && alert.estado === "activa") {
      setMyActiveAlert(alert);
    }
    if (alert.estado === "activa") {
      startEmergencyEscalationLoop(alert.id, getEscalationState);
    } else {
      stopEmergencyEscalation(alert.id);
    }
  }, [getEscalationState, setAlertsState, user?.id]);

  const fetchResponsesForAlert = useCallback(async (alertaId: string) => {
    const { data } = await supabase
      .from("respuestas_alerta_emergencia" as any)
      .select("*")
      .eq("alerta_id", alertaId)
      .order("created_at", { ascending: true });

    if (data) {
      setResponsesState((prev) => ({ ...prev, [alertaId]: data as unknown as EmergencyResponse[] }));
    }
  }, [setResponsesState]);

  const fetchActiveAlerts = useCallback(async () => {
    if (!user) return;
    setEmergencyLoading(true);

    let query = supabase
      .from("alertas_emergencia" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!isStaff) {
      query = query.eq("estado", "activa");
    }

    const { data, error } = await query;

    if (!error && data) {
      const alerts = data as unknown as EmergencyAlert[];
      setAlertsState(alerts);

      const myAlert = alerts.find((alert) => alert.docente_id === user.id && alert.estado === "activa") || null;
      setMyActiveAlert(myAlert);

      alerts.forEach((alert) => {
        if (alert.estado === "activa") {
          startEmergencyEscalationLoop(alert.id, getEscalationState);
        }
      });

      await Promise.all(alerts.map((alert) => fetchResponsesForAlert(alert.id)));
    }

    setEmergencyLoading(false);
  }, [fetchResponsesForAlert, getEscalationState, isStaff, setAlertsState, user]);

  const sendAlertToServer = useCallback(async (alerta: EmergencyAlert) => {
    const { sync_status, ...payload } = alerta;
    const { data, error } = await supabase
      .from("alertas_emergencia" as any)
      .insert([payload] as any)
      .select()
      .single();

    if (error) {
      console.error("Error al enviar alerta de emergencia", error);
      hydrateAlert({ ...alerta, sync_status: "error_envio" });
      return false;
    }

    const sentAlert = { ...(data as unknown as EmergencyAlert), sync_status: "enviada" as const };
    await deleteOfflineAlert(sentAlert.id).catch(() => undefined);
    hydrateAlert(sentAlert);
    return true;
  }, [hydrateAlert]);

  const createEmergencyAlert = useCallback(async (tipo: EmergencyAlert["tipo_alerta"], options: EmergencyCreateOptions = {}) => {
    if (!user || !userProfile) return;

    const alerta: EmergencyAlert = {
      id: createId(),
      tipo_alerta: tipo,
      descripcion_opcional: options.descripcion,
      grupo: options.grupo || userProfile.grupo_tutor || "N/A",
      aula: options.aula || options.ubicacion || "N/A",
      docente_id: user.id,
      docente_nombre: userProfile.nombre_completo || user.email || "Usuario SASE",
      estado: "activa",
      prioridad: "alta",
      protocolo_activado: tipo,
      metadata: {
        ubicacion: options.ubicacion || "Aula",
        silent: Boolean(options.silent),
        offline_first: true,
      },
      escalado_nivel: 0,
      ultima_notificacion_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      sync_status: "pendiente_envio",
    };

    await saveOfflineAlert(alerta);
    await requestBackgroundSync();
    hydrateAlert(alerta);

    if (!options.silent) {
      void playEmergencySound();
    }

    if (typeof navigator !== "undefined" && navigator.onLine) {
      const ok = await sendAlertToServer(alerta);
      if (ok) {
        toast.success("Alerta enviada. Personal responsable notificado.");
        return;
      }
    }

    toast("Alerta guardada. Se enviara automaticamente cuando haya conexion.", { icon: "OFF" });
  }, [hydrateAlert, sendAlertToServer, user, userProfile]);

  const respondToEmergency = useCallback(async (alertaId: string, respuesta: EmergencyResponse["respuesta"]) => {
    if (!user || !userProfile) return;

    const { error } = await (supabase
      .from("respuestas_alerta_emergencia" as any)
      .upsert([{
        alerta_id: alertaId,
        usuario_id: user.id,
        usuario_nombre: userProfile.nombre_completo || user.email || "Usuario SASE",
        rol: userProfile.rol,
        respuesta,
      }], { onConflict: "alerta_id,usuario_id,respuesta" }) as any);

    if (error) {
      toast.error("Error al enviar respuesta");
      return;
    }

    if (respuesta === "atendida") {
      const alerta = alertsRef.current.find((item) => item.id === alertaId);
      const tiempoRespuesta = alerta?.created_at
        ? Math.max(0, Math.floor((Date.now() - new Date(alerta.created_at).getTime()) / 1000))
        : null;

      await supabase
        .from("alertas_emergencia" as any)
        .update({
          estado: "atendida",
          atendida_at: new Date().toISOString(),
          atendida_por: user.id,
          tiempo_respuesta_seg: tiempoRespuesta,
        } as any)
        .eq("id", alertaId);

      stopEmergencyEscalation(alertaId);
    }

    await fetchResponsesForAlert(alertaId);
    await fetchActiveAlerts();
  }, [fetchActiveAlerts, fetchResponsesForAlert, user, userProfile]);

  const closeEmergencyAlert = useCallback(async (alertaId: string) => {
    const { error } = await (supabase
      .from("alertas_emergencia" as any)
      .update({ estado: "cancelada", cerrada_at: new Date().toISOString() } as any)
      .eq("id", alertaId) as any);

    if (!error) {
      stopEmergencyEscalation(alertaId);
      setAlertsState(alertsRef.current.map((alert) => (
        alert.id === alertaId ? { ...alert, estado: "cancelada", cerrada_at: new Date().toISOString() } : alert
      )));
      if (myActiveAlert?.id === alertaId) setMyActiveAlert(null);
      toast.success("Alerta cerrada");
    }
  }, [myActiveAlert?.id, setAlertsState]);

  useEffect(() => {
    if (!user) return;
    void fetchActiveAlerts();

    const sync = async () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      const sent = await syncOfflineAlerts(sendAlertToServer).catch(() => 0);
      if (sent > 0) {
        toast.success(`${sent} alerta(s) offline sincronizada(s).`);
        await fetchActiveAlerts();
      }
    };

    void sync();
    window.addEventListener("online", sync);

    const handleWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === "SYNC_EMERGENCY_ALERTS") {
        void sync();
      }
    };
    navigator.serviceWorker?.addEventListener("message", handleWorkerMessage);

    const channel = supabase
      .channel("emergency_realtime")
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "alertas_emergencia" },
        () => fetchActiveAlerts(),
      )
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "respuestas_alerta_emergencia" },
        (payload) => {
          const newResp = payload.new as unknown as EmergencyResponse;
          setResponsesState((prev) => ({
            ...prev,
            [newResp.alerta_id]: [...(prev[newResp.alerta_id] || []), newResp],
          }));
        },
      )
      .subscribe();

    return () => {
      window.removeEventListener("online", sync);
      navigator.serviceWorker?.removeEventListener("message", handleWorkerMessage);
      supabase.removeChannel(channel);
    };
  }, [fetchActiveAlerts, sendAlertToServer, setResponsesState, user]);

  return {
    activeAlerts,
    myActiveAlert,
    emergencyResponses,
    emergencyLoading,
    createEmergencyAlert,
    respondToEmergency,
    closeEmergencyAlert,
    fetchActiveAlerts,
  };
};
