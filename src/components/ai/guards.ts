import { AIGuardRule } from "./types";

const personalIdentifierPatterns = [
  /\b[A-ZÑ&]{4}\d{6}[HM][A-ZÑ]{5}[A-Z0-9]\d\b/i,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /(?:\+?52[\s().-]*)?(?:\d[\s().-]*){10,13}/,
  /\b(curp|rfc|matr[ií]cula|domicilio|direcci[oó]n particular|tel[eé]fono (?:del )?tutor|fecha de nacimiento|datos[_ ]?tutor|datos[_ ]?bap|diagn[oó]stico m[eé]dico)\b/i,
  /["']?(nombre_completo|datos_tutor|datos_bap|phoneprimary|matricula|curp)["']?\s*:/i,
  /\b(nombre(?:\s+completo)?|alumn[oa]|estudiante)\s*:\s*[\p{Lu}ÁÉÍÓÚÑ][\p{L}'-]+(?:\s+[\p{Lu}ÁÉÍÓÚÑ][\p{L}'-]+){1,5}/iu,
];

export const SECURITY_GUARDS: AIGuardRule[] = [
  {
    id: "NO_IDENTIFICADORES_PERSONALES",
    description:
      "Impide enviar identificadores personales escolares a proveedores externos",
    check: (prompt: string) =>
      !personalIdentifierPatterns.some((pattern) => pattern.test(prompt)),
    errorMessage:
      "Retire nombres, CURP, matrícula, contacto, domicilio o datos clínicos antes de solicitar apoyo externo.",
  },
  {
    id: "LONGITUD_CONTROLADA",
    description: "Limita la solicitud a un borrador breve y revisable",
    check: (prompt: string) =>
      prompt.trim().length > 0 && prompt.length <= 8000,
    errorMessage: "La solicitud está vacía o excede el límite permitido.",
  },
];
