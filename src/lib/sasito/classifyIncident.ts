import {
  findSasitoExperienceById,
  SASITO_EXPERIENCE_CATALOG,
} from "../../data/sasitoExperienceCatalog";
import type { SasitoExperience, SasitoIncidentInput, SasitoRecommendation } from "../../types/sasitoExperience";
import { HUMAN_REVIEW_ACTION, normalizeSasitoText, resolveSasitoRisk } from "./riskRules";

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
      experience.senales.some((signal) => normalizedInput.includes(normalizeSasitoText(signal)))
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
    return buildUnknownRecommendation();
  }

  const risk = resolveSasitoRisk(input, experience);

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
