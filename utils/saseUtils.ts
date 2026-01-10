import { UserRole, Incident, IncidentType, ProtocolType } from "../types";

// ==========================================
// 1. GOD MODE & AUTH
// ==========================================
export const GOD_MODE_CREDENTIALS = {
  email: "dev@sase.mx",
  password: "dev-access-granted", // In production this would be env var
};

export const isGodMode = (role: UserRole): boolean => {
  return role === UserRole.DEVELOPER;
};

// ==========================================
// 2. PRIVACY & PRINTING
// ==========================================
export const anonymizeName = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName; // Single name, can't abbreviate much

  // Example: "Juan Pérez López" -> "J. P. L."
  return parts.map((p) => p[0].toUpperCase() + ".").join(" ");
};

export const getPrivacySafeAttributes = (role: UserRole) => {
  if (
    role === UserRole.UDEII ||
    role === UserRole.DIRECTIVO ||
    role === UserRole.DEVELOPER
  ) {
    return { showDiagnosis: true, showFullHistory: true };
  }
  if (role === UserRole.DOCENTE || role === UserRole.DOCENTE_TUTOR) {
    return {
      showDiagnosis: false,
      showFullHistory: false,
      showAccommodations: true,
    };
  }
  return {
    showDiagnosis: false,
    showFullHistory: false,
    showAccommodations: false,
  };
};

// ==========================================
// 3. ESCALATION ENGINE (The Brain)
// ==========================================

interface EscalationResult {
  notifyRoles: UserRole[];
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
}

export const evaluateEscalation = (
  newIncident: Incident,
  studentHistory: Incident[]
): EscalationResult => {
  const allIncidents = [...studentHistory, newIncident];
  const count = allIncidents.filter((i) => i.type === newIncident.type).length; // Count varies by type logic? User said "3 incidencias" general or specific? Let's assume general for now or conductual.

  // Rule: Protocol or Health Risk -> CRITICAL -> Broadcast
  if (
    (newIncident.type === IncidentType.SALUD &&
      (newIncident.description.toLowerCase().includes("urgente") ||
        newIncident.description.toLowerCase().includes("ambulancia"))) ||
    newIncident.description.toLowerCase().includes("protocolo")
  ) {
    return {
      notifyRoles: [
        UserRole.ORIENTACION,
        UserRole.TRABAJO_SOCIAL,
        UserRole.DIRECTIVO,
      ],
      priority: "CRITICAL",
      message: `🚨 PROTOCOLO ACTIVO: ${newIncident.description.slice(
        0,
        50
      )}...`,
    };
  }

  // Rule: 3 Strikes -> Tutor
  // Check if this incident TRAIL triggers the 3rd strike
  if (count === 3) {
    return {
      notifyRoles: [UserRole.DOCENTE_TUTOR, UserRole.PREFECTURA],
      priority: "HIGH",
      message: `⚠️ Alerta de Patrón (3 Incidencias): Requiere intervención de Tutor.`,
    };
  }

  // Rule: Recidivism after Tutor (assumed > 3 implies tutor already notified? Maybe need state)
  if (count > 3) {
    return {
      notifyRoles: [UserRole.ORIENTACION, UserRole.DOCENTE_TUTOR], // Escalate to Orientacion
      priority: "HIGH",
      message: `⚠️ Reincidencia Crítica: Se recomienda citatorio a padres.`,
    };
  }

  // Default: Just notify Prefectura/Tutor mildly
  return {
    notifyRoles: [UserRole.PREFECTURA],
    priority: "LOW",
    message: `Nueva incidencia registrada.`,
  };
};
