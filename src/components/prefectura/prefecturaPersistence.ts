import { supabase } from "../../supabase/client";

export interface OrientationReferralInput {
  studentId: string;
  reason: string;
  summary?: string;
  priority: "baja" | "media" | "alta" | "critica";
}

export interface OrientationReferralResult {
  caseId: string;
  responsibleId: string;
  responsibleName: string | null;
  reusedOpenCase: boolean;
}

export const referStudentToOrientation = async (
  input: OrientationReferralInput,
): Promise<OrientationReferralResult> => {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user?.id) {
    throw new Error("La sesión institucional no está disponible.");
  }

  const { data, error } = await supabase.rpc(
    "referir_caso_orientacion",
    {
      p_alumno_id: input.studentId,
      p_motivo: input.reason.trim(),
      p_resumen: input.summary?.trim() || undefined,
      p_prioridad: input.priority,
    },
  );

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.caso_id || !row.responsable_id) {
    throw new Error("Supabase no confirmó la canalización a Orientación.");
  }

  return {
    caseId: row.caso_id,
    responsibleId: row.responsable_id,
    responsibleName: row.responsable_nombre,
    reusedOpenCase: row.caso_existente,
  };
};
