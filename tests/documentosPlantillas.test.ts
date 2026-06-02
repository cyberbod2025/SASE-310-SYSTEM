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

  it("genera reporte individual de seguimiento academico/conductual con constancia de atencion familiar", () => {
    const datos: DatosDocumento = {
      alumno_id: "alumno-2",
      alumno_nombre: "Alumno Seguimiento",
      grupo: "2A",
      docente_reporta: "Prof. Hugo Sanchez",
      fecha: "27 de mayo de 2026",
      hora: "10:00",
      lugar_incidente: "Aula 2A",
      descripcion: "Se reviso el seguimiento academico y conductual.",
      asunto: "Seguimiento academico y conductual del alumno.",
      tutor_nombre: "Madre Prueba",
      tutor_parentesco: "Madre",
      situaciones_observadas:
        "Actividades incompletas\nNecesidad de redireccionamiento",
      acciones_implementadas:
        "Explicacion individual\nRevision de evidencias",
      compromiso_alumno: "Registrar instrucciones\nEntregar actividades",
      compromiso_familia: "Revisar cuaderno\nDar seguimiento",
      medidas_implementadas: "Mantener registro de avances",
      soporte_atencion_familia:
        "La madre fue atendida de manera oportuna, amable e institucional.",
      observaciones: "",
    };

    const html = generarPlantillaHTML(
      "reporte_seguimiento_individual",
      datos,
      "Se sostuvo dialogo con la madre de familia y se brindo seguimiento.",
      "SASE-310-SEG-IND-2A-2026-05-27-001",
    );

    expect(html).toContain("REPORTE DE SEGUIMIENTO ACADÉMICO Y CONDUCTUAL");
    expect(html).toContain("Alumno Seguimiento");
    expect(html).toContain("Madre Prueba");
    expect(html).toContain("Situaciones observadas");
    expect(html).toContain("Acciones implementadas");
    expect(html).toContain("Soporte institucional y constancia de atención");
    expect(html).toContain("atendido de manera oportuna, amable");
    expect(html).toContain("SASE-310-SEG-IND-2A-2026-05-27-001");
  });

  it("genera informe grupal de seguimiento academico/conductual con acciones y soporte institucional", () => {
    const datos: DatosDocumento = {
      alumno_id: "grupo-2a",
      alumno_nombre: "Referencia Grupo",
      grupo: "2A",
      docente_reporta: "Prof. Hugo Sanchez",
      fecha: "27 de mayo de 2026",
      hora: "11:00",
      lugar_incidente: "Aula 2A",
      descripcion: "Se reviso la organizacion de trabajo del grupo.",
      asunto:
        "Situacion academica y organizacion de trabajo del grupo 2A.",
      periodo_seguimiento: "Mayo de 2026",
      situaciones_observadas:
        "Falta de actividades previamente indicadas\nAusencia de materiales",
      acciones_implementadas:
        "Actividades cortas verificables\nRevision diaria de evidencias",
      compromiso_alumno: "Atender indicaciones\nPresentar evidencias",
      compromiso_familia: "Dar seguimiento a avisos escolares",
      medidas_implementadas: "Mantener listas de control",
      soporte_atencion_familia:
        "Las familias seran atendidas de manera oportuna y respetuosa.",
      observaciones: "",
    };

    const html = generarPlantillaHTML(
      "informe_seguimiento_grupal",
      datos,
      "Se informan acciones de seguimiento academico y organizacion grupal.",
      "SASE-310-SEG-GRP-2A-2026-05-27-001",
    );

    expect(html).toContain(
      "INFORME GRUPAL DE SEGUIMIENTO ACADÉMICO Y CONDUCTUAL",
    );
    expect(html).toContain("Grupo");
    expect(html).toContain("2A");
    expect(html).toContain("Situaciones observadas");
    expect(html).toContain("Acciones y medidas implementadas");
    expect(html).toContain("Soporte institucional y atención a familias");
    expect(html).toContain("atendidos de manera oportuna, amable");
    expect(html).toContain("SASE-310-SEG-GRP-2A-2026-05-27-001");
  });
});
