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

  // --- False positive tests - substring matching ---

  it('"armar equipo" NO activa riesgo rojo (falso positivo de arma)', () => {
    const result = classifyIncident({ conducta: "no_trabaja_en_clase", descripcion: "vamos a armar equipos" });
    expect(result.riesgo).not.toBe("rojo");
  });

  it('"desarmar material" NO activa riesgo rojo', () => {
    const result = classifyIncident({ conducta: "no_trabaja_en_clase", descripcion: "desarmar el material" });
    expect(result.riesgo).not.toBe("rojo");
  });

  // --- True positive tests ---

  it('"posible arma" SÍ activa riesgo rojo', () => {
    const result = classifyIncident({ conducta: "no_trabaja_en_clase", descripcion: "posible arma" });
    expect(result.riesgo).toBe("rojo");
    expect(result.tipo).toBe("seguridad");
    expect(result.requiereEscalamiento).toBe(true);
  });

  it('"trae arma" SÍ activa riesgo rojo (token completo)', () => {
    const result = classifyIncident({ conducta: "no_trabaja_en_clase", descripcion: "trae arma" });
    expect(result.riesgo).toBe("rojo");
  });

  it('"arma blanca" SÍ activa riesgo rojo', () => {
    const result = classifyIncident({ conducta: "no_trabaja_en_clase", descripcion: "arma blanca" });
    expect(result.riesgo).toBe("rojo");
  });

  // --- Punctuation boundary tests ---

  it('"trae arma." SÍ activa riesgo rojo (puntuación)', () => {
    const result = classifyIncident({ conducta: "no_trabaja_en_clase", descripcion: "trae arma." });
    expect(result.riesgo).toBe("rojo");
  });

  it('"arma," SÍ activa riesgo rojo (puntuación)', () => {
    const result = classifyIncident({ conducta: "no_trabaja_en_clase", descripcion: "arma," });
    expect(result.riesgo).toBe("rojo");
  });

  it('"posible fuego;" SÍ activa riesgo rojo (puntuación)', () => {
    const result = classifyIncident({ conducta: "no_trabaja_en_clase", descripcion: "posible fuego;" });
    expect(result.riesgo).toBe("rojo");
  });

  it('"hubo golpe," SÍ activa riesgo rojo (puntuación)', () => {
    const result = classifyIncident({ conducta: "no_trabaja_en_clase", descripcion: "hubo golpe," });
    expect(result.riesgo).toBe("rojo");
  });

  // --- Priority tests - red safety overrides academic ---

  it("no_trabaja_en_clase + posible arma → riesgo rojo y tipo seguridad", () => {
    const result = classifyIncident({ conducta: "no_trabaja_en_clase", descripcion: "posible arma en mochila" });
    expect(result.riesgo).toBe("rojo");
    expect(result.tipo).toBe("seguridad");
    expect(result.requiereEscalamiento).toBe(true);
    expect(result.accionesRecomendadas).toEqual(expect.arrayContaining([
      expect.stringContaining("protocolo"),
    ]));
  });

  it("no_trabaja_en_clase + fuego → riesgo rojo y tipo seguridad", () => {
    const result = classifyIncident({ conducta: "no_trabaja_en_clase", descripcion: "posible fuego en laboratorio" });
    expect(result.riesgo).toBe("rojo");
    expect(result.tipo).toBe("seguridad");
  });

  it("no_trabaja_en_clase sin señal roja → académico verde", () => {
    const result = classifyIncident({ conducta: "no_trabaja_en_clase" });
    expect(result.riesgo).toBe("verde");
    expect(result.tipo).toBe("academica");
  });

  // --- Plural and routing tests ---

  it('"armas" SÍ activa riesgo rojo', () => {
    const result = classifyIncident({ conducta: "no_trabaja_en_clase", descripcion: "trajo armas" });
    expect(result.riesgo).toBe("rojo");
  });

  it('"golpes" SÍ activa riesgo rojo', () => {
    const result = classifyIncident({ conducta: "no_trabaja_en_clase", descripcion: "hubo golpes" });
    expect(result.riesgo).toBe("rojo");
  });

  it('"empujones" SÍ activa riesgo rojo', () => {
    const result = classifyIncident({ conducta: "no_trabaja_en_clase", descripcion: "se dieron empujones" });
    expect(result.riesgo).toBe("rojo");
  });

  it("salida_aula_sin_autorizacion + posible arma → protocolo de seguridad", () => {
    const result = classifyIncident({ conducta: "salida_aula_sin_autorizacion", descripcion: "posible arma" });
    expect(result.riesgo).toBe("rojo");
    expect(result.tipo).toBe("seguridad");
    expect(result.experienciaId).toBe("posible_riesgo_seguridad");
  });

  // --- No base experience red signal tests ---

  it('"trajo armas" → rojo / seguridad / protocolo', () => {
    const result = classifyIncident({ descripcion: "trajo armas" });
    expect(result.riesgo).toBe("rojo");
    expect(result.tipo).toBe("seguridad");
    expect(result.requiereEscalamiento).toBe(true);
  });

  it('"hubo golpes" → rojo / seguridad / protocolo', () => {
    const result = classifyIncident({ descripcion: "hubo golpes" });
    expect(result.riesgo).toBe("rojo");
    expect(result.tipo).toBe("seguridad");
    expect(result.requiereEscalamiento).toBe(true);
  });

  it('"hubo empujones" → rojo / seguridad / protocolo', () => {
    const result = classifyIncident({ descripcion: "hubo empujones" });
    expect(result.riesgo).toBe("rojo");
    expect(result.tipo).toBe("seguridad");
    expect(result.requiereEscalamiento).toBe(true);
  });

  it('"armar equipo" → no rojo', () => {
    const result = classifyIncident({ descripcion: "armar equipo" });
    expect(result.riesgo).not.toBe("rojo");
  });

  it('"desarmar material" → no rojo', () => {
    const result = classifyIncident({ descripcion: "desarmar material" });
    expect(result.riesgo).not.toBe("rojo");
  });

  it('"comentario no reconocido" → unknown/verde/revisión humana', () => {
    const result = classifyIncident({ descripcion: "comentario no reconocido" });
    expect(result.riesgo).toBe("verde");
    expect(result.revisionHumana).toBe(true);
  });
});
