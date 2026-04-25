import { useState, useEffect } from "react";
import { supabase } from "../supabase/client";

export type OrbState =
  | "green"
  | "yellow"
  | "red"
  | "blue"
  | "gold"
  | "thinking"
  | "alert";

/**
 * Lógica SQL Usada:
 * Se consulta la tabla public.incidencias.
 * Si el rol es prefectura, se filtra por tipo = 'Observación de Convivencia'.
 * Si el rol es docente, se filtra por reportado_por = userId (acercamiento simplificado a grupos asignados).
 * Dirección u otros roles ven el total de los últimos 7 días.
 * La suscripción Realtime usa el esquema "public", tabla "incidencias" con evento "INSERT".
 */
export const useSaseSystemState = (
  role: string | undefined,
  userId?: string,
) => {
  const [systemState, setSystemState] = useState<OrbState>("gold");
  const [incidentCount, setIncidentCount] = useState(0);

  useEffect(() => {
    if (!role || !userId) return;

    const fetchState = async () => {
      let query = supabase
        .from("incidencias")
        .select("id", { count: "exact", head: true });

      if (role === "prefectura") {
        query = query.eq("tipo", "conducta");
      } else if (role === "docente") {
        query = query.eq("reportado_por", userId);
      }

      // Tomamos incidencias recientes (últimos 7 días) para evaluar el pulso actual
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      query = query.gte("fecha", lastWeek.toISOString());

      const { count, error } = await query;

      if (!error && count !== null) {
        setIncidentCount(count);
        // Evaluar gravedad según parámetros
        if (count >= 10) setSystemState("red");
        else if (count >= 3) setSystemState("yellow");
        else {
          // Si todo está tranquilo, mostramos estado GOLD institucional
          setSystemState("gold");
        }
      }
    };

    fetchState();

    // Implementar suscripción Realtime
    const channel = supabase
      .channel("sase-orb-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "incidencias" },
        () => {
          fetchState(); // Recalcular al haber una nueva incidencia
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [role, userId]);

  return { systemState, incidentCount };
};
