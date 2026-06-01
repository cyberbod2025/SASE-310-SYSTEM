import { describe, expect, it } from "vitest";
import { classifyIncident } from "../src/lib/sasito/classifyIncident";
import { HUMAN_REVIEW_ACTION } from "../src/lib/sasito/riskRules";

describe("Sasito Experiencia Institucional", () => {
  it("clasifica no_trabaja_en_clase como academica verde", () => {
    const result = classifyIncident({ conducta: "no_trabaja_en_clase" });

    expect(result.tipo).toBe("academica");
    expect(result.riesgo).toBe("verde");
    expect(result.requiereEscalamiento).toBe(false);
  });

  it("clasifica salida_aula_sin_autorizacion con reincidencia como seguridad amarillo", () => {
    const result = classifyIncident({
      conducta: "salida_aula_sin_autorizacion",
      reincidenciasPrevias: 1,
    });

    expect(result.tipo).toBe("seguridad");
    expect(result.riesgo).toBe("amarillo");
    expect(result.requiereEscalamiento).toBe(false);
  });

  it("clasifica agresion_fisica como seguridad rojo y requiere escalamiento", () => {
    const result = classifyIncident({ conducta: "agresion_fisica" });

    expect(result.tipo).toBe("seguridad");
    expect(result.riesgo).toBe("rojo");
    expect(result.requiereEscalamiento).toBe(true);
  });

  it("clasifica posible_arma como seguridad rojo y requiere escalamiento", () => {
    const result = classifyIncident({ conducta: "posible_arma" });

    expect(result.tipo).toBe("seguridad");
    expect(result.riesgo).toBe("rojo");
    expect(result.requiereEscalamiento).toBe(true);
  });

  it("clasifica fuego como seguridad rojo y requiere escalamiento", () => {
    const result = classifyIncident({ conducta: "fuego" });

    expect(result.tipo).toBe("seguridad");
    expect(result.riesgo).toBe("rojo");
    expect(result.requiereEscalamiento).toBe(true);
  });

  it("clasifica alumno_no_localizado como seguridad rojo y requiere escalamiento", () => {
    const result = classifyIncident({ conducta: "alumno_no_localizado" });

    expect(result.tipo).toBe("seguridad");
    expect(result.riesgo).toBe("rojo");
    expect(result.requiereEscalamiento).toBe(true);
  });

  it("clasifica citatorio_sin_respuesta con reincidencia como familiar amarillo", () => {
    const result = classifyIncident({
      conducta: "citatorio_sin_respuesta",
      esReincidencia: true,
    });

    expect(result.tipo).toBe("familiar");
    expect(result.riesgo).toBe("amarillo");
    expect(result.requiereEscalamiento).toBe(false);
  });

  it("clasifica conducta_positiva como seguimiento verde", () => {
    const result = classifyIncident({ conducta: "conducta_positiva" });

    expect(result.tipo).toBe("seguimiento");
    expect(result.riesgo).toBe("verde");
    expect(result.requiereEscalamiento).toBe(false);
  });

  it("conducta desconocida no inventa acciones y pide revision humana", () => {
    const result = classifyIncident({ conducta: "situacion no prevista en catalogo" });

    expect(result.tipo).toBe("seguimiento");
    expect(result.riesgo).toBe("verde");
    expect(result.requiereEscalamiento).toBe(false);
    expect(result.revisionHumana).toBe(true);
    expect(result.accionesRecomendadas).toEqual([HUMAN_REVIEW_ACTION]);
  });
});
