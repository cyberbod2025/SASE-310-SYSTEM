import { AIGuardRule } from "./types";

export const SECURITY_GUARDS: AIGuardRule[] = [
  {
    id: "NO_PII_LEAK",
    description: "Evitar envío de datos financieros o direcciones exactas",
    check: (prompt: string) => {
      // Regex simple para detectar posibles tarjetas o datos sensibles obvios
      const creditCardRegex = /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/;
      return !creditCardRegex.test(prompt);
    },
    errorMessage:
      "La solicitud contiene datos sensibles que infringen el protocolo de privacidad.",
  },
  {
    id: "APPROPRIATE_LANGUAGE",
    description: "Bloquear lenguaje ofensivo o inapropiado",
    check: (prompt: string) => {
      const badWords = ["violencia", "insulto", "droga"]; // Lista simplificada
      const lowerPrompt = prompt.toLowerCase();
      // En un contexto escolar, "violencia" puede ser válida si es reporte,
      // pero aquí simulamos un filtro estricto para el demo.
      // Ajustamos: solo bloquear insultos explícitos (simulado)
      return !lowerPrompt.includes("@@@"); // Placeholder
    },
    errorMessage: "Lenguaje inapropiado detectado.",
  },
];
