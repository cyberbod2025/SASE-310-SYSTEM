import { useEffect, useState } from "react";
import { supabase } from "../../supabase/client";
import { SystemState } from "../../types/systemState";
import toast from "react-hot-toast";

export const useObservabilitySlice = (setSystemState: (state: SystemState, message?: string) => void) => {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // 1. Initial fetch of active alerts
    const fetchAlerts = async () => {
      let query = supabase.from("sase_alerts" as any).select("*").eq("resolved", false as any);
      const { data } = await (query as any).order("created_at", { ascending: false });
      
      if (data && data.length > 0) {
        setAlerts(data);
        const mostSevere = data[0];
        updateSystemVisuals(mostSevere);
      }
    };

    fetchAlerts();

    // 2. Realtime listener for new alerts
    const channel = supabase
      .channel("sase_alerts_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sase_alerts" },
        (payload) => {
          const newAlert = payload.new;
          setAlerts((prev) => [newAlert, ...prev]);
          updateSystemVisuals(newAlert);
          
          if (newAlert.severity === "critical" || newAlert.severity === "high") {
            toast.error(`ALERTA DE SEGURIDAD: ${newAlert.message}`, {
              duration: 6000,
              position: "top-center",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setSystemState]);

  const updateSystemVisuals = (alert: any) => {
    let state: SystemState = "normal";
    if (alert.severity === "critical" || alert.severity === "high") {
      state = "alert";
    } else if (alert.severity === "medium") {
      state = "warning";
    }
    
    setSystemState(state, alert.message);
  };

  return { alerts };
};
