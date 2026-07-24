import { supabase } from "../../lib/supabaseClient";

export interface StaffApprovalAssignment {
  requestId: string;
  matriculaSase: string;
  grupos: string[];
  materias: string[];
  esTutor: boolean;
  grupoTutor: string | null;
}

export interface StaffApprovalResult {
  approved: true;
  primaryRole: string;
  approvedRoles: string[];
  userId: string;
  alreadyExisted: boolean;
  metadataSynchronized: boolean;
}

export interface StaffRejectionResult {
  approved: false;
  rejected: true;
  requestId: string;
}

const sanitizeList = (values: string[], uppercase = false): string[] =>
  [
    ...new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => (uppercase ? value.toUpperCase() : value)),
    ),
  ];

const extractFunctionMessage = async (
  data: unknown,
  error: unknown,
): Promise<string> => {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof data.error === "string"
  ) {
    return data.error;
  }

  const context =
    error && typeof error === "object" && "context" in error
      ? error.context
      : null;
  if (context instanceof Response) {
    try {
      const payload = (await context.clone().json()) as { error?: unknown };
      if (typeof payload.error === "string") return payload.error;
    } catch {
      // La respuesta puede no ser JSON; se conserva el mensaje del SDK.
    }
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "No se pudo resolver la solicitud de personal.";
};

const requireAuthenticatedSession = async (): Promise<void> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("La sesión institucional no está disponible.");
  }
};

export const approveStaffRequest = async (
  assignment: StaffApprovalAssignment,
): Promise<StaffApprovalResult> => {
  const requestId = assignment.requestId.trim();
  const matriculaSase = assignment.matriculaSase.trim().toUpperCase();
  if (!requestId) throw new Error("La solicitud es inválida.");
  if (!matriculaSase) throw new Error("Debe asignar una Matrícula SASE.");

  await requireAuthenticatedSession();

  const { data, error } = await supabase.functions.invoke("approve-staff", {
    body: {
      action: "aprobar",
      solicitudId: requestId,
      matricula_sase: matriculaSase,
      grupos: sanitizeList(assignment.grupos, true),
      materias: sanitizeList(assignment.materias),
      es_tutor: assignment.esTutor,
      grupo_tutor: assignment.esTutor
        ? assignment.grupoTutor?.trim().toUpperCase() || null
        : null,
    },
  });

  if (error) {
    throw new Error(await extractFunctionMessage(data, error));
  }

  if (
    !data ||
    typeof data !== "object" ||
    data.approved !== true ||
    typeof data.primaryRole !== "string" ||
    !Array.isArray(data.approvedRoles) ||
    typeof data.userId !== "string"
  ) {
    throw new Error("La aprobación no devolvió una confirmación válida.");
  }

  return {
    approved: true,
    primaryRole: data.primaryRole,
    approvedRoles: data.approvedRoles.filter(
      (role: unknown): role is string => typeof role === "string",
    ),
    userId: data.userId,
    alreadyExisted: data.alreadyExisted === true,
    metadataSynchronized: data.metadataSynchronized === true,
  };
};

export const rejectStaffRequest = async (
  requestIdInput: string,
  reasonInput: string,
): Promise<StaffRejectionResult> => {
  const requestId = requestIdInput.trim();
  const reason = reasonInput.trim();
  if (!requestId) throw new Error("La solicitud es inválida.");
  if (reason.length < 10 || reason.length > 1000) {
    throw new Error("El motivo debe contener entre 10 y 1000 caracteres.");
  }

  await requireAuthenticatedSession();

  const { data, error } = await supabase.functions.invoke("approve-staff", {
    body: {
      action: "rechazar",
      solicitudId: requestId,
      reason,
    },
  });

  if (error) {
    throw new Error(await extractFunctionMessage(data, error));
  }

  if (
    !data ||
    typeof data !== "object" ||
    data.approved !== false ||
    data.rejected !== true ||
    typeof data.requestId !== "string"
  ) {
    throw new Error("El rechazo no devolvió una confirmación válida.");
  }

  return {
    approved: false,
    rejected: true,
    requestId: data.requestId,
  };
};
