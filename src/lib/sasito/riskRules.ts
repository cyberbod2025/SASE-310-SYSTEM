import type { RiskLevel, SasitoExperience, SasitoIncidentInput } from "../../types/sasitoExperience";

export const HUMAN_REVIEW_ACTION = "registrar observacion para revision humana";

export interface SasitoRiskResolution {
  riesgo: RiskLevel;
  reglaAplicada: string;
}

const RED_SECURITY_RULES = [
  { rule: "agresion_fisica", terms: ["agresion fisica", "golpe", "golpes", "empujon", "empujones", "pelea", "lesion fisica"] },
  { rule: "posible_arma", terms: ["posible arma", "arma", "armas"] },
  { rule: "fuego", terms: ["fuego", "incendio"] },
  { rule: "alumno_no_localizado", terms: ["alumno no localizado", "no localizado"] },
  { rule: "conducta_sexualizada", terms: ["conducta sexualizada"] },
] as const;

export const normalizeSasitoText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const hasReincidence = (input: SasitoIncidentInput): boolean =>
  Boolean(input.esReincidencia) || (input.reincidenciasPrevias ?? 0) > 0;

const hasThreeReincidences = (input: SasitoIncidentInput): boolean =>
  (input.reincidenciasPrevias ?? 0) >= 3;

export const matchesAnyTerm = (normalizedText: string, terms: readonly string[]): boolean =>
  terms.some((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Usamos \b para que cualquier no-alfanumérico (incluida puntuación) cuente como límite
    return new RegExp(`\\b${escaped}\\b`).test(normalizedText);
  });

export const detectRedSignal = (input: SasitoIncidentInput): string | undefined => {
  const normalizedText = normalizeSasitoText(
    [input.experienciaId, input.conducta, input.descripcion].filter(Boolean).join(" "),
  );

  return RED_SECURITY_RULES.find((rule) => matchesAnyTerm(normalizedText, rule.terms))?.rule;
};

export const resolveSasitoRisk = (
  input: SasitoIncidentInput,
  experience: SasitoExperience,
): SasitoRiskResolution => {
  const normalizedText = normalizeSasitoText(
    [input.experienciaId, input.conducta, input.descripcion].filter(Boolean).join(" "),
  );

  const redSignal = detectRedSignal(input);
  if (redSignal) {
    return { riesgo: "rojo", reglaAplicada: redSignal };
  }

  const redRuleByExperience = RED_SECURITY_RULES.find(
    (rule) => normalizeSasitoText(experience.id) === normalizeSasitoText(rule.rule)
  );

  if (redRuleByExperience) {
    return { riesgo: "rojo", reglaAplicada: redRuleByExperience.rule };
  }

  if (experience.id === "conducta_positiva") {
    return { riesgo: "verde", reglaAplicada: "conducta_positiva" };
  }

  if (experience.id === "citatorio_sin_respuesta" && hasReincidence(input)) {
    return { riesgo: "amarillo", reglaAplicada: "citatorio_sin_respuesta_repetido" };
  }

  if (experience.id === "salida_aula_sin_autorizacion" && hasReincidence(input)) {
    return { riesgo: "amarillo", reglaAplicada: "salida_aula_reincidente" };
  }

  if ((experience.tipo === "academica" || experience.tipo === "conductual") && hasThreeReincidences(input)) {
    return { riesgo: "amarillo", reglaAplicada: "tres_reincidencias_academicas_o_conductuales" };
  }

  if (experience.tipo === "academica" && !hasReincidence(input)) {
    return { riesgo: "verde", reglaAplicada: "academica_sin_reincidencia" };
  }

  return { riesgo: experience.riesgoBase, reglaAplicada: "riesgo_base_catalogo" };
};
