import { useCallback } from "react";
import { supabase } from "../supabase/client";
import { useAuth } from "../components/AuthProvider";
import { useApp } from "../store";

// Tipos de acciones de seguimiento en información sensible
export type AccionSensible =
  | "consultar_expediente"
  | "consultar_alerta_medica"
  | "consultar_historial_disciplina"
  | "consultar_trabajo_social"
  | "abrir_panel_avanzado"
  | "abrir_expediente_institucional"
  | "generar_analisis_ia_expediente"
  | "exportar_expediente_pdf";

interface RegistroAcceso {
  accion: AccionSensible;
  alumno_id: string;
  pantalla?: string;
}

/**
 * Hook para seguimiento de accesos a información sensible.
 * Cada consulta queda en el registro institucional con fecha, hora, usuario y rol.
 */
export const useAuditoriaAccesos = () => {
  const { user } = useAuth();
  const { currentUserRole } = useApp();

  const logAccess = useCallback(
    async ({
      accion,
      alumno_id,
      pantalla = "StudentAdvancedPanel",
    }: RegistroAcceso) => {
      if (!user) {
        if (import.meta.env.DEV) {
          console.warn("[SEGUIMIENTO_ACCESOS] Registro omitido: sin usuario.");
        }
        return;
      }

      const now = new Date();
      const fecha = now.toISOString().split("T")[0]; // YYYY-MM-DD
      const hora = now.toTimeString().split(" ")[0]; // HH:MM:SS

      try {
        const { error } = await (supabase as any)
          .from("auditoria_accesos")
          .insert([
            {
              usuario: user.id,
              rol: currentUserRole as string,
              accion,
              alumno_id,
              pantalla,
              fecha,
              hora,
            },
          ]);

        if (error && import.meta.env.DEV) {
          console.warn("[SEGUIMIENTO_ACCESOS] Error al registrar.");
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn("[SEGUIMIENTO_ACCESOS] Fallo inesperado.");
        }
      }
    },
    [user, currentUserRole],
  );

  return { logAccess };
};
