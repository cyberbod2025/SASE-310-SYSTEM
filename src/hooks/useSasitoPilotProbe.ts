import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

type SasitoIncidenciaProbe = {
  alumno_id: string | null;
  created_at: string | null;
  fecha: string | null;
  gravedad: string | null;
  id: string;
  tipo: string | null;
};

type SasitoCalificacionProbe = {
  alumno_id: string;
  id: string;
  materia: string;
  promedio: number | null;
  promedio_final: number | null;
  trimestre1: number | null;
  trimestre2: number | null;
  trimestre3: number | null;
};

declare global {
  interface Window {
    __SASITO_PILOT_PROBE__?: {
      calificaciones: SasitoCalificacionProbe[];
      fetchedAt: string;
      incidencias: SasitoIncidenciaProbe[];
    };
  }
}

const shouldRunProbe = () => {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("sasito_probe") === "1";
};

export const useSasitoPilotProbe = () => {
  useEffect(() => {
    if (!shouldRunProbe()) return;

    let isActive = true;

    const runProbe = async () => {
      const [incidenciasResult, calificacionesResult] = await Promise.all([
        supabase
          .from("incidencias")
          .select("id, alumno_id, tipo, gravedad, fecha, created_at")
          .order("fecha", { ascending: false })
          .limit(10),
        supabase
          .from("calificaciones")
          .select(
            "id, alumno_id, materia, promedio, promedio_final, trimestre1, trimestre2, trimestre3",
          )
          .order("materia", { ascending: true })
          .limit(20),
      ]);

      if (!isActive) return;

      if (incidenciasResult.error || calificacionesResult.error) {
        console.error("[SASITO PILOTO] Error de lectura en Supabase", {
          calificacionesError: calificacionesResult.error?.message ?? null,
          incidenciasError: incidenciasResult.error?.message ?? null,
        });
        return;
      }

      const incidencias =
        (incidenciasResult.data ?? []) as unknown as SasitoIncidenciaProbe[];
      const calificaciones =
        (calificacionesResult.data ?? []) as unknown as SasitoCalificacionProbe[];

      window.__SASITO_PILOT_PROBE__ = {
        incidencias,
        calificaciones,
        fetchedAt: new Date().toISOString(),
      };

      console.groupCollapsed("[SASITO PILOTO] Validación funcional Supabase");
      console.info("Incidencias consultadas:", incidencias.length);
      console.table(incidencias);
      console.info("Calificaciones consultadas:", calificaciones.length);
      console.table(calificaciones);
      console.info(
        "Datos expuestos temporalmente en window.__SASITO_PILOT_PROBE__",
      );
      console.groupEnd();
    };

    void runProbe();

    return () => {
      isActive = false;
    };
  }, []);
};
