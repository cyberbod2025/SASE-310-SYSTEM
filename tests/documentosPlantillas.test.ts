import { describe, expect, it } from "vitest";
import { generarPlantillaHTML } from "../src/modules/documentos/plantillas";
import type { DatosDocumento } from "../src/modules/documentos/types";

describe("plantillas de documentos institucionales", () => {
  it("genera el acta de hechos y corresponsabilidad con datos del alumno, tutor y personal", () => {
    const datos: DatosDocumento = {
      alumno_id: "alumno-1",
      alumno_nombre: "Alumno Prueba",
      grupo: "2B",
      docente_reporta: "Prof. Hugo Sanchez",
      fecha: "21 de mayo de 2026",
      hora: "08:30",
      lugar_incidente: "Aula 2B",
      descripcion: "El alumno permanecio fuera del aula durante clase.",
      ciclo_escolar: "2025-2026",
      tutor_nombre: "Tutora Prueba",
      tutor_parentesco: "Madre",
      personal_prefectura: "Prefecta Prueba",
      testigo_institucional: "Subdireccion Prueba",
      tipo_falta: "",
      testigos: "",
      acuerdos: [],
      reflexion_alumno: "Reconoce que debio solicitar autorizacion.",
      compromiso_alumno: "Permanecer dentro del aula.",
      compromiso_familia: "Dar seguimiento a los acuerdos.",
      observaciones: "",
    };

    const html = generarPlantillaHTML(
      "acta_corresponsabilidad",
      datos,
      "Se hace constar la atencion institucional del caso.",
      "SASE-310-COR-2B-2026-05-21-001",
    );

    expect(html).toContain("ACTA DE HECHOS Y ACUERDOS DE CORRESPONSABILIDAD");
    expect(html).toContain("Alumno Prueba");
    expect(html).toContain("Tutora Prueba");
    expect(html).toContain("Prof. Hugo Sanchez");
    expect(html).toContain("Prefecta Prueba");
    expect(html).toContain("Subdireccion Prueba");
    expect(html).toContain("En preparación");
    expect(html).toContain("SASE-310-COR-2B-2026-05-21-001");
  });
});
