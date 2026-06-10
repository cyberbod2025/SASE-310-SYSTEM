import {
  findSasitoExperienceById,
  SASITO_EXPERIENCE_CATALOG,
} from "../../data/sasitoExperienceCatalog";
import type { SasitoExperience, SasitoIncidentInput, SasitoRecommendation } from "../../types/sasitoExperience";
import { HUMAN_REVIEW_ACTION, matchesAnyTerm, normalizeSasitoText, resolveSasitoRisk, detectRedSignal } from "./riskRules";

const RULE_TO_EXPERIENCE_MAP: Record<string, string> = {
  agresion_fisica: "agresion_fisica",
  posible_arma: "posible_riesgo_seguridad",
  fuego: "posible_riesgo_seguridad",
  alumno_no_localizado: "posible_riesgo_seguridad",
  conducta_sexualizada: "posible_riesgo_seguridad",
};

const findSecurityExperienceByRule = (rule: string): SasitoExperience | undefined => {
  const experienceId = RULE_TO_EXPERIENCE_MAP[rule];
  return experienceId ? findSasitoExperienceById(experienceId) : undefined;
};

const findExperienceBySignals = (input: SasitoIncidentInput): SasitoExperience | undefined => {
  const normalizedInput = normalizeSasitoText(
    [input.experienciaId, input.conducta, input.descripcion].filter(Boolean).join(" "),
  );

  return SASITO_EXPERIENCE_CATALOG.find((experience) => {
    if (!experience.activo) {
      return false;
    }

    const normalizedId = normalizeSasitoText(experience.id);
    const normalizedName = normalizeSasitoText(experience.nombre);

    return (
      normalizedInput.includes(normalizedId) ||
      normalizedInput.includes(normalizedName) ||
      matchesAnyTerm(normalizedInput, experience.senales.map((s) => normalizeSasitoText(s)))
    );
  });
};

const buildUnknownRecommendation = (): SasitoRecommendation => ({
  tipo: "seguimiento",
  riesgo: "verde",
  accionesRecomendadas: [HUMAN_REVIEW_ACTION],
  noHacer: ["inventar acciones o diagnosticos sin revision humana"],
  requiereEscalamiento: false,
  reglaAplicada: "conducta_no_reconocida",
  revisionHumana: true,
});

export const classifyIncident = (input: SasitoIncidentInput): SasitoRecommendation => {
  const experience = input.experienciaId
    ? findSasitoExperienceById(input.experienciaId) ?? findExperienceBySignals(input)
    : findExperienceBySignals(input);

  if (!experience) {
    const redSignal = detectRedSignal(input);
    if (redSignal) {
      const securityExperience = findSecurityExperienceByRule(redSignal);
      if (securityExperience) {
        return {
          experienciaId: securityExperience.id,
          experienciaNombre: securityExperience.nombre,
          tipo: securityExperience.tipo,
          riesgo: "rojo",
          accionesRecomendadas: [...securityExperience.accionesRecomendadas],
          noHacer: [...securityExperience.noHacer],
          plantillaSugerida: securityExperience.plantillaSugerida,
          requiereEscalamiento: true,
          reglaAplicada: redSignal,
          revisionHumana: false,
        };
      }
    }
    return buildUnknownRecommendation();
  }

  const risk = resolveSasitoRisk(input, experience);

  // P2 fix: When red safety signal is detected, override with the specific
  // security experience to ensure proper protocol, even if the base experience
  // is already of type "seguridad".
  if (risk.riesgo === "rojo") {
    const securityExperience = findSecurityExperienceByRule(risk.reglaAplicada);
    if (securityExperience && experience.id !== securityExperience.id) {
      return {
        experienciaId: securityExperience.id,
        experienciaNombre: securityExperience.nombre,
        tipo: securityExperience.tipo,
        riesgo: "rojo",
        accionesRecomendadas: [...securityExperience.accionesRecomendadas],
        noHacer: [...securityExperience.noHacer],
        plantillaSugerida: securityExperience.plantillaSugerida,
        requiereEscalamiento: true,
        reglaAplicada: risk.reglaAplicada,
        revisionHumana: false,
      };
    }
  }

  return {
    experienciaId: experience.id,
    experienciaNombre: experience.nombre,
    tipo: experience.tipo,
    riesgo: risk.riesgo,
    accionesRecomendadas: [...experience.accionesRecomendadas],
    noHacer: [...experience.noHacer],
    plantillaSugerida: experience.plantillaSugerida,
    requiereEscalamiento: risk.riesgo === "rojo",
    reglaAplicada: risk.reglaAplicada,
    revisionHumana: false,
  };
};
