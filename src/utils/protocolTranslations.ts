export const PROTOCOL_ICON_LABELS: Record<string, string> = {
  // User specific
  Wind: "RIESGO AMBIENTAL",
  Activity: "ATENCIÓN MÉDICA",
  Alert: "ALERTA INSTITUCIONAL",
  Triangle: "EMERGENCIA",
  AlertTriangle: "EMERGENCIA P.C.", // Para Sismo

  // Inferred from seed data
  ShieldAlert: "ACOSO / VIOLENCIA",
  Flame: "FUEGO / INCENDIO",
  Bomb: "AMENAZA CRÍTICA",
  PlusCircle: "PRIMEROS AUXILIOS",
  Slash: "VIOLENCIA FÍSICA",
  Shield: "SEGURIDAD",
  FileText: "TRÁMITE JURÍDICO",
  AlertCircle: "ALERTA MÉDICA",

  // Fallbacks
  MenuBook: "PROTOCOLO",
  Description: "GENERAL",
  MedicalServices: "SALUD",
  Security: "SEGURIDAD",
};

export const getProtocolLabel = (iconName: string | null): string => {
  if (!iconName) return "PROTOCOLO";
  // Remove padding/extra spaces
  const normalizedKey = iconName.trim();
  // Try direct match
  if (PROTOCOL_ICON_LABELS[normalizedKey]) {
    return PROTOCOL_ICON_LABELS[normalizedKey];
  }

  // Try case-insensitive lookup
  const key = Object.keys(PROTOCOL_ICON_LABELS).find(
    (k) => k.toLowerCase() === normalizedKey.toLowerCase()
  );
  if (key) return PROTOCOL_ICON_LABELS[key];

  // Fallback: Return in Spanish if possible or just normalized
  return "PROTOCOLO GESTIONADO";
};
