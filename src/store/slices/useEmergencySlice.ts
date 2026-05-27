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

const EMERGENCY_SEND_TIMEOUT_MS = 10000;
const PERSISTENCE_ERROR_MESSAGE = "No se pudo registrar por permisos o validación institucional.";

async function withTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  let timeoutId: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), EMERGENCY_SEND_TIMEOUT_MS);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeRole(role: unknown) {
  return typeof role === "string" ? role.trim().toLowerCase() : "";
}

function isDuplicateAlertError(error: any) {
  const text = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return error?.code === "23505" || error?.status === 409 || text.includes("duplicate key");
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
  const createAlertLockRef = useRef(false);

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
      if (isDuplicateAlertError(error)) {
        const { data: existingAlert, error: lookupError } = await supabase
          .from("alertas_emergencia" as any)
          .select("*")
          .eq("id", alerta.id)
          .maybeSingle();

        if (!lookupError && existingAlert) {
          const sentAlert = {
            ...(existingAlert as unknown as EmergencyAlert),
            sync_status: "enviada" as const,
          };
          await deleteOfflineAlert(sentAlert.id).catch(() => undefined);
          hydrateAlert(sentAlert);
          return true;
        }
      }

      console.error("Error al enviar alerta de emergencia", error);
      return false;
    }

    const sentAlert = { ...(data as unknown as EmergencyAlert), sync_status: "enviada" as const };
    await deleteOfflineAlert(sentAlert.id).catch(() => undefined);
    hydrateAlert(sentAlert);
    return true;
  }, [hydrateAlert]);

  const createEmergencyAlert = useCallback(async (tipo: EmergencyAlert["tipo_alerta"], options: EmergencyCreateOptions = {}) => {
    if (!user || !userProfile) throw new Error("No hay sesión institucional activa.");
    if (createAlertLockRef.current) throw new Error("Ya hay una alerta en proceso.");

    createAlertLockRef.current = true;
    setEmergencyLoading(true);

    try {

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

      if (typeof navigator !== "undefined" && navigator.onLine) {
        const ok = await withTimeout(sendAlertToServer(alerta), "No se pudo enviar la alerta a tiempo.");
        if (ok) {
          if (!options.silent) {
            void playEmergencySound();
          }
          toast.success("Alerta enviada. Personal responsable notificado.");
          return;
        }

        await deleteOfflineAlert(alerta.id).catch(() => undefined);
        throw new Error(PERSISTENCE_ERROR_MESSAGE);
      }

      hydrateAlert(alerta);

      if (!options.silent) {
        void playEmergencySound();
      }

      toast("Alerta guardada. Se enviara automaticamente cuando haya conexion.", { icon: "OFF" });
    } catch (error) {
      toast.error(PERSISTENCE_ERROR_MESSAGE);
      throw error;
    } finally {
      createAlertLockRef.current = false;
      setEmergencyLoading(false);
    }
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

      const { error: updateError } = await supabase
        .from("alertas_emergencia" as any)
        .update({
          estado: "atendida",
          atendida_at: new Date().toISOString(),
          atendida_por: user.id,
          tiempo_respuesta_seg: tiempoRespuesta,
        } as any)
        .eq("id", alertaId);

      if (updateError) {
        console.warn("Error al marcar emergencia como atendida:", updateError);
        toast.error(PERSISTENCE_ERROR_MESSAGE);
        return;
      }

      stopEmergencyEscalation(alertaId);
    }

    await fetchResponsesForAlert(alertaId);
    await fetchActiveAlerts();
  }, [fetchActiveAlerts, fetchResponsesForAlert, user, userProfile]);

  const closeEmergencyAlert = useCallback(async (alertaId: string) => {
    let error: any = null;
    try {
      const res = await supabase
        .from("alertas_emergencia" as any)
        .update({ estado: "cancelada", cerrada_at: new Date().toISOString() } as any)
        .eq("id", alertaId) as any;
      error = res.error;
    } catch (err: any) {
      error = err;
    }

    if (error) {
      console.warn("Error al cancelar SOS en DB, aplicando fallback local:", error);
      toast.error(PERSISTENCE_ERROR_MESSAGE);
    }

    stopEmergencyEscalation(alertaId);
    setAlertsState(alertsRef.current.map((alert) => (
      alert.id === alertaId ? { ...alert, estado: "cancelada", cerrada_at: new Date().toISOString() } : alert
    )));
    setMyActiveAlert((current) => (current?.id === alertaId ? null : current));
    if (!error) {
      toast.success("Alerta SOS cancelada por el usuario.");
    }
  }, [setAlertsState]);

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
