import { useCallback } from "react";
import toast from "react-hot-toast";
import { registerAuditEvent } from "../components/auditoria/auditoriaPersistence";

// Tipos de acciones de seguimiento en información sensible
export type AccionSensible =
  | "consultar_expediente"
  | "consultar_alerta_medica"
  | "consultar_historial_disciplina"
  | "consultar_trabajo_social"
  | "abrir_panel_avanzado"
  | "abrir_expediente_institucional"
  | "generar_sintesis_local_expediente"
  | "exportar_expediente_pdf"
  | "generar_documento_institucional"
  | "imprimir_documento_institucional";

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
  const logAccess = useCallback(
    async ({
      accion,
      alumno_id,
      pantalla = "StudentAdvancedPanel",
    }: RegistroAcceso) => {
      try {
        await registerAuditEvent({
          actionType: `ACCESO_SENSIBLE_${accion.toUpperCase()}`,
          description: `Acceso sensible confirmado desde ${pantalla}.`,
          targetTable: "alumnos",
          targetRecordId: alumno_id,
          purpose: "Trazabilidad de acceso a información estudiantil sensible",
          studentId: alumno_id,
        });
        return true;
      } catch (err) {
        console.error(
          "No se confirmó el registro de acceso sensible:",
          err,
        );
        toast.error(
          "No se confirmó la trazabilidad del acceso sensible.",
        );
        return false;
      }
    },
    [],
  );

  return { logAccess };
};
