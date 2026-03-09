import { UserRole, Incident, IncidentType, ProtocolType } from "../types";

// ==========================================
// 1. GOD MODE & AUTH
// ==========================================
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
  protocolId?: string;
}

export const evaluateEscalation = (
  newIncident: Incident,
  studentHistory: Incident[],
): EscalationResult => {
  const allIncidents = [...studentHistory, newIncident];
  const typeHistory = allIncidents.filter((i) => i.type === newIncident.type);
  const count = typeHistory.length;
  const description = newIncident.description.toLowerCase();

  // 1. PROTOCOLO ASI (ABUSO SEXUAL INFANTIL) - CRÍTICO
  const asiKeywords = [
    "abuso",
    "sexual",
    "tocar",
    "íntimo",
    "intimidad",
    "acoso sexual",
    "hostigamiento sexual",
    "grooming",
    "sexting",
    "señales físicas",
  ];
  if (asiKeywords.some((k) => description.includes(k))) {
    return {
      notifyRoles: [
        UserRole.DIRECTIVO,
        UserRole.TRABAJO_SOCIAL,
        UserRole.ORIENTACION,
      ],
      priority: "CRITICAL",
      message: "🚨 PROTOCOLO ASI ACTIVADO: Salvaguarda inmediata del alumno/a.",
      protocolId: "built-in-asi",
    };
  }

  // 2. PROTOCOLO MALTRATO INFANTIL
  const maltratoKeywords = [
    "maltrato",
    "golpe",
    "moretón",
    "huella",
    "hematoma",
    "negligencia",
    "violencia física",
    "abandono",
    "higiene",
  ];
  if (maltratoKeywords.some((k) => description.includes(k))) {
    return {
      notifyRoles: [UserRole.TRABAJO_SOCIAL, UserRole.DIRECTIVO],
      priority: "CRITICAL",
      message: "🛡️ PROTOCOLO MALTRATO: Reporte de vulneración de derechos.",
      protocolId: "built-in-maltrato",
    };
  }

  // 3. PROTOCOLO DROGAS / PREVENCIÓN DE ADICCIONES
  const drogasKeywords = [
    "droga",
    "sustancia",
    "alcohol",
    "intoxicado",
    "olor",
    "posesión",
    "pastilla",
    "vape",
    "cigarrillo",
    "marihuana",
    "psicotrópico",
  ];
  if (drogasKeywords.some((k) => description.includes(k))) {
    return {
      notifyRoles: [
        UserRole.PREFECTURA,
        UserRole.ORIENTACION,
        UserRole.DIRECTIVO,
      ],
      priority: "HIGH",
      message: "💊 PROTOCOLO ADICCIONES: Si te drogas te dañas.",
      protocolId: "built-in-drogas",
    };
  }

  // 4. PROTOCOLO DE CONVIVENCIA ESCOLAR (Conducta Grave)
  const convivenciaKeywords = [
    "pelea",
    "discusión",
    "bully",
    "acoso",
    "agresión",
    "insulto",
    "falta de respeto",
    "amenaza",
  ];
  if (
    newIncident.type === IncidentType.CONDUCTA &&
    (convivenciaKeywords.some((k) => description.includes(k)) ||
      description.includes("convivencia"))
  ) {
    return {
      notifyRoles: [
        UserRole.ORIENTACION,
        UserRole.TRABAJO_SOCIAL,
        UserRole.DIRECTIVO,
      ],
      priority:
        description.includes("pelea") || description.includes("agresión")
          ? "CRITICAL"
          : "HIGH",
      message: `🚨 PROTOCOLO DE CONVIVENCIA: ${newIncident.description.slice(0, 60)}...`,
    };
  }

  // 5. PROTOCOLO DE VIDEOVIGILANCIA (Evidencia Necesaria)
  const videoKeywords = [
    "cámara",
    "videovigilancia",
    "evidencia",
    "robo",
    "perdida",
    "extravio",
    "golpe",
    "hechos",
  ];
  if (videoKeywords.some((k) => description.includes(k))) {
    return {
      notifyRoles: [UserRole.PREFECTURA, UserRole.DIRECTIVO],
      priority: "MEDIUM",
      message: `📹 PROTOCOLO VIDEOVIGILANCIA: Se requiere revisión de grabación por ${newIncident.type}.`,
    };
  }

  // 6. ACTUACIÓN DOCENTE ANTE CONTINGENCIAS (Salud / Emergencias)
  const contingenciaKeywords = [
    "accidente",
    "caída",
    "emergencia",
    "riesgo",
    "sangre",
    "desmayo",
    "convulsión",
    "fractura",
  ];
  if (
    newIncident.type === IncidentType.SALUD ||
    contingenciaKeywords.some((k) => description.includes(k))
  ) {
    const isMajor =
      description.includes("ambulancia") ||
      description.includes("grave") ||
      description.includes("sangre");
    return {
      notifyRoles: [
        UserRole.MEDICO_ESCOLAR,
        UserRole.ORIENTACION,
        UserRole.DIRECTIVO,
      ],
      priority: isMajor ? "CRITICAL" : "HIGH",
      message: `🚑 ACTUACIÓN DOCENTE (EMERGENCIA): ${newIncident.description.slice(0, 60)}...`,
    };
  }

  // 7. PROTOCOLO DE APOYO (BAP / Académico Crítico)
  if (
    newIncident.type === IncidentType.ACADEMICO &&
    description.includes("bap")
  ) {
    return {
      notifyRoles: [UserRole.UDEII, UserRole.ORIENTACION],
      priority: "MEDIUM",
      message: `📘 PROTOCOLO DE APOYO UDEII: Alumno con BAP requiere ajuste razonable.`,
    };
  }

  // 8. REGLA DE 3 STRIKES (Patrón Conductual)
  if (count === 3) {
    return {
      notifyRoles: [
        UserRole.DOCENTE_TUTOR,
        UserRole.PREFECTURA,
        UserRole.ORIENTACION,
      ],
      priority: "HIGH",
      message: `⚠️ Alerta de Patrón (3 Incidencias): Acumulación en ${newIncident.type}.`,
    };
  }

  // 9. REINCIDENCIA CRÍTICA (>3)
  if (count > 3) {
    return {
      notifyRoles: [UserRole.ORIENTACION, UserRole.DIRECTIVO],
      priority: "HIGH",
      message: `⚠️ Reincidencia Crítica: Se recomienda citatorio inmediato a padres.`,
    };
  }

  // Default: Just notify Prefectura/Tutor mildly
  return {
    notifyRoles: [UserRole.PREFECTURA, UserRole.DOCENTE_TUTOR],
    priority: "LOW",
    message: `Nueva incidencia registrada: ${newIncident.type}.`,
  };
};
