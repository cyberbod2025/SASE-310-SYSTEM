import { DatosDocumento, TipoDocumentoInstitucional } from "./types";

/**
 * Prompts institucionales para Gemini.
 * Basados en el Marco para la Convivencia Escolar CDMX
 * y la Guía Operativa de Escuelas Secundarias CDMX.
 */
export function generarPromptDocumento(
  tipo: TipoDocumentoInstitucional,
  datos: DatosDocumento,
): string {
  const contextoComun = `
Eres el sistema IA-SASE de la Escuela Secundaria Diurna No. 310 "José Ma. Morelos y Pavón", CDMX.
Genera documentos institucionales formales en estricto apego al "Marco para la Convivencia Escolar en las Escuelas de Educación Básica del Distrito Federal" y la "Guía Operativa para la Organización y Funcionamiento de los Servicios de Educación Básica".

DATOS DEL CASO:
- Alumno(a): ${datos.alumno_nombre}
- Grupo: ${datos.grupo}
- Docente que reporta: ${datos.docente_reporta}
- Fecha del incidente: ${datos.fecha}
- Hora: ${datos.hora}
- Lugar: ${datos.lugar_incidente}
- Descripción: ${datos.descripcion}
${datos.tipo_falta ? `- Tipo de falta: ${datos.tipo_falta}` : ""}
${datos.testigos ? `- Testigos: ${datos.testigos}` : ""}
${datos.tutor_nombre ? `- Madre, padre o tutor: ${datos.tutor_nombre}` : "- Madre, padre o tutor: En preparación"}
${datos.personal_prefectura ? `- Personal de Prefectura: ${datos.personal_prefectura}` : "- Personal de Prefectura: En preparación"}
${datos.testigo_institucional ? `- Testigo institucional: ${datos.testigo_institucional}` : "- Testigo institucional: En preparación"}
${datos.asunto ? `- Asunto: ${datos.asunto}` : "- Asunto: En preparación"}
${datos.periodo_seguimiento ? `- Periodo de seguimiento: ${datos.periodo_seguimiento}` : ""}
${datos.situaciones_observadas ? `- Situaciones observadas: ${datos.situaciones_observadas}` : ""}
${datos.acciones_implementadas ? `- Acciones implementadas: ${datos.acciones_implementadas}` : ""}
${datos.medidas_implementadas ? `- Medidas implementadas: ${datos.medidas_implementadas}` : ""}
${datos.compromiso_alumno ? `- Compromiso del alumno: ${datos.compromiso_alumno}` : ""}
${datos.compromiso_familia ? `- Compromiso de la familia: ${datos.compromiso_familia}` : ""}
${datos.objetivo_seguimiento ? `- Objetivo del seguimiento: ${datos.objetivo_seguimiento}` : ""}
${datos.soporte_atencion_familia ? `- Soporte/constancia de atención familiar: ${datos.soporte_atencion_familia}` : ""}

REGLAS INQUEBRANTABLES:
1. Usa lenguaje técnico-pedagógico, neutro y objetivo. NUNCA uses juicios de valor.
2. NO uses el término "castigo". Usa "ACCIONES FORMATIVAS" o "MEDIDAS DISCIPLINARIAS FORMATIVAS".
3. Clasifica la falta según el Marco (Tipo I: Leve, Tipo II: Moderada, Tipo III: Grave).
4. Privilegia el enfoque formativo y de corresponsabilidad.
5. Responde SOLO con el texto del documento, sin explicaciones ni comentarios adicionales.
6. No incluyas encabezados ni firmas — el sistema los agrega automáticamente.
`;

  switch (tipo) {
    case "citatorio_padres":
      return `${contextoComun}
TIPO DE DOCUMENTO: CITATORIO A PADRES DE FAMILIA O TUTORES

Genera un citatorio formal dirigido al padre, madre de familia o tutor del alumno(a).
Estructura:
1. Saludo institucional formal ("La Dirección de la Escuela Secundaria Diurna No. 310...")
2. Motivo del citatorio (describir la situación de forma objetiva, basándote en la descripción proporcionada)
3. Importancia de la presencia del tutor (enfatizar corresponsabilidad según Art. 66 de la Ley General de Educación)
4. Nota: "En caso de no presentarse, se procederá conforme a la normatividad vigente"
5. Cierre formal con agradecimiento

Tono: Respetuoso pero firme. Institucional.`;

    case "acta_hechos":
      return `${contextoComun}
TIPO DE DOCUMENTO: ACTA CIRCUNSTANCIADA DE HECHOS

Genera una narración formal de hechos para el expediente escolar.
Estructura:
1. Inicio: "Siendo las ${datos.hora} horas del día ${datos.fecha}, en las instalaciones de la Escuela Secundaria Diurna No. 310..."
2. Narración cronológica y objetiva de los hechos reportados
3. Clasificación de la falta según el Marco para la Convivencia Escolar
4. Acciones formativas sugeridas según la progresividad (Diálogo → Compromiso → Inclusión Familiar)
5. Artículos aplicables del Marco para la Convivencia Escolar
6. Nota final: "Se deja constancia de los hechos para los efectos administrativos y formativos correspondientes."

Tono: Formal, objetivo, sin juicios personales. Lenguaje jurídico-administrativo escolar.`;

    case "acta_corresponsabilidad":
      return `${contextoComun}
TIPO DE DOCUMENTO: ACTA DE HECHOS Y ACUERDOS DE CORRESPONSABILIDAD

Genera SOLO la redacción para la sección "II. ACTA DE HECHOS" del formato institucional.
El sistema agregará encabezados, fundamentos, acuerdos, compromisos, constancia, observaciones y firmas.

Estructura requerida:
1. Constancia objetiva de lo ocurrido, basada estrictamente en la descripción proporcionada.
2. Seguimiento realizado por personal escolar, si consta en los datos.
3. Carácter preventivo, formativo y de acompañamiento.
4. Cierre breve que privilegie el interés superior del estudiante y la corresponsabilidad familia-escuela.

Reglas adicionales:
- Si un dato no fue proporcionado, escribe literalmente "En preparación".
- No inventes nombres, cargos, horarios, autorizaciones ni sanciones.
- No incluyas encabezados, firmas, casillas ni fundamento normativo.

Tono: Institucional, claro, preventivo y formativo.`;

    case "hoja_acuerdos":
      return `${contextoComun}
TIPO DE DOCUMENTO: HOJA DE ACUERDOS Y COMPROMISOS

Genera una hoja de acuerdos y compromisos post-reunión.
Estructura:
1. Antecedentes: Breve resumen del motivo de la reunión
2. Participantes presentes: (dejar espacio genérico para llenado)
3. Desarrollo: Resumen de los puntos tratados
4. Acuerdos y compromisos establecidos (numerados):
   ${datos.acuerdos?.length ? datos.acuerdos.map((a, i) => `${i + 1}. ${a}`).join("\n   ") : "- Generar 3-4 acuerdos apropiados según la situación descrita"}
5. Plazos sugeridos para seguimiento
6. Consecuencias en caso de incumplimiento (formativas, basadas en el Marco)
7. Nota: "El presente documento es de carácter formativo y busca favorecer la sana convivencia escolar."

Tono: Conciliador, proactivo, formativo.`;

    case "reporte_seguimiento_individual":
      return `${contextoComun}
TIPO DE DOCUMENTO: REPORTE INDIVIDUAL DE SEGUIMIENTO ACADÉMICO Y CONDUCTUAL

Genera el cuerpo de un reporte individual institucional, con enfoque académico, conductual, preventivo y de corresponsabilidad.
El sistema agregará encabezado, tablas de datos, firmas, folio y pie institucional.

Estructura requerida:
1. Asunto del seguimiento.
2. Constancia de atención y diálogo con la madre, padre o tutor, indicando que fue atendido de manera oportuna, amable, respetuosa e institucional.
3. Situaciones observadas en el aula o espacio escolar, redactadas en viñetas o párrafos breves.
4. Acciones implementadas por el docente o personal escolar.
5. Observación académica relevante, sin prejuzgar ni responsabilizar de forma absoluta.
6. Objetivo del seguimiento.
7. Compromisos del alumno, de la familia y del docente.
8. Soporte institucional o constancia de atención que deje claro que la familia tuvo espacio de escucha, aclaración y acompañamiento.
9. Cierre formativo.

Reglas adicionales:
- No inventes nombres, fechas, sanciones, diagnósticos ni hechos no proporcionados.
- Si un dato no fue proporcionado, escribe literalmente "En preparación".
- Evita acusaciones directas; usa "se observó", "se identificó", "se informó" y "se brindó seguimiento".
- No incluyas firmas ni encabezado institucional.

Tono: Formal, amable, objetivo, institucional y protector de la actuación escolar.`;

    case "informe_seguimiento_grupal":
      return `${contextoComun}
TIPO DE DOCUMENTO: INFORME GRUPAL DE SEGUIMIENTO ACADÉMICO Y CONDUCTUAL

Genera el cuerpo de un informe grupal institucional para el grupo ${datos.grupo}.
El sistema agregará encabezado, datos del grupo, firmas, folio y pie institucional.

Estructura requerida:
1. Asunto del informe.
2. Contexto general del grupo y periodo observado.
3. Situaciones observadas en organización de trabajo, cumplimiento académico y convivencia.
4. Acciones o medidas implementadas por el docente o personal escolar.
5. Reconocimiento explícito de que puede existir alumnado que sí cumple cuando corresponda; evita generalizaciones absolutas.
6. Objetivo del seguimiento grupal.
7. Compromisos del grupo, de las familias y del personal escolar.
8. Soporte institucional: deja claro que las familias, madres, padres o tutores fueron atendidos o serán atendidos de manera oportuna, amable y respetuosa en ambiente institucional.
9. Cierre para conocimiento y seguimiento correspondiente.

Reglas adicionales:
- No individualices alumnos salvo que el dato venga expresamente proporcionado.
- No inventes porcentajes, sanciones, acuerdos de dirección ni determinaciones disciplinarias.
- Si un dato no fue proporcionado, escribe literalmente "En preparación".
- No incluyas firmas ni encabezado institucional.

Tono: Ejecutivo, objetivo, formativo, institucional y orientado a seguimiento.`;

    case "informe_caso":
      return `${contextoComun}
TIPO DE DOCUMENTO: INFORME DE CASO

Genera un informe detallado de seguimiento de caso del alumno(a).
Estructura:
1. Datos generales del caso
2. Antecedentes: historial relevante del alumno
3. Situación actual: descripción objetiva del estado actual
4. Acciones realizadas (entrevistas, reuniones, seguimiento)
5. Análisis de la situación (factores de riesgo, fortalezas)
6. Recomendaciones y plan de acción
7. Conclusiones

Tono: Profesional, analítico, propositivo.`;

    case "informe_supervision":
      return `${contextoComun}
TIPO DE DOCUMENTO: INFORME DE SUPERVISIÓN

Genera un informe de supervisión escolar formal.
Estructura:
1. Objetivo de la supervisión
2. Área/persona supervisada
3. Fecha y periodo de observación
4. Hallazgos principales (organizados por categoría)
5. Fortalezas detectadas
6. Áreas de oportunidad
7. Recomendaciones específicas
8. Compromisos y plazos

Tono: Objetivo, constructivo, profesional.`;

    case "circular_docentes":
      return `${contextoComun}
TIPO DE DOCUMENTO: CIRCULAR INTERNA PARA PERSONAL DOCENTE

Genera una circular institucional dirigida al personal docente.
${datos.destinatario ? `Destinatario: ${datos.destinatario}` : "Dirigida a: Personal docente en general"}
${datos.asunto ? `Asunto: ${datos.asunto}` : ""}
Estructura:
1. Dirigido a: "Al Personal Docente de la Escuela Secundaria Diurna No. 310"
2. Asunto o referencia
3. Desarrollo del comunicado (claro, directo, institucional)
4. Indicaciones o solicitudes específicas
5. Plazos si aplica
6. Cierre formal: "Sin más por el momento, reciban un cordial saludo."

Tono: Institucional, respetuoso, directo. Sin redundancias.`;

    case "aviso_comunidad":
      return `${contextoComun}
TIPO DE DOCUMENTO: AVISO A LA COMUNIDAD ESCOLAR

Genera un aviso institucional para la comunidad escolar (alumnos, padres de familia, docentes).
${datos.asunto ? `Tema: ${datos.asunto}` : ""}
Estructura:
1. Dirigido a: "A la Comunidad Escolar de la Escuela Secundaria Diurna No. 310"
2. Asunto del aviso
3. Información relevante (fechas, horarios, requisitos)
4. Indicaciones específicas
5. Información de contacto o aclaración
6. Cierre institucional

Tono: Claro, accesible, institucional. Lenguaje inclusivo.`;

    case "minuta_cte":
      return `${contextoComun}
TIPO DE DOCUMENTO: MINUTA DEL CONSEJO TÉCNICO ESCOLAR (CTE)

Genera una minuta formal de sesión del Consejo Técnico Escolar.
${datos.participantes?.length ? `Participantes: ${datos.participantes.join(", ")}` : ""}
Estructura:
1. Encabezado: Sesión ordinaria/extraordinaria del CTE
2. Fecha, hora de inicio y hora de cierre
3. Orden del día (numerado)
4. Desarrollo de cada punto del orden del día
5. Acuerdos tomados (numerados, con responsables y plazos)
6. Asuntos generales
7. Cierre de la sesión

Tono: Formal, preciso, ejecutivo. Enfocado en acuerdos y acciones.`;

    default:
      return datos.descripcion;
  }
}

/**
 * Prompt para hacer un texto más formal (botón editor).
 */
export function promptHacerFormal(texto: string): string {
  return `Eres el sistema IA-SASE de una escuela secundaria oficial en CDMX.
Toma el siguiente texto y hazlo MÁS FORMAL e institucional:
- Usa tercera persona
- Reemplaza expresiones coloquiales por lenguaje técnico-pedagógico
- Mantén TODOS los datos y hechos exactamente como están
- No agregues información nueva
- No incluyas encabezados, firmas ni formato
- Solo devuelve el texto mejorado

TEXTO:
${texto}

TEXTO FORMAL:`;
}

/**
 * Prompt para resumir un texto (botón editor).
 */
export function promptResumir(texto: string): string {
  return `Eres el sistema IA-SASE de una escuela secundaria oficial en CDMX.
Resume el siguiente texto institucional manteniendo:
- Todos los datos clave (nombres, fechas, hechos)
- El tono formal e institucional
- La estructura lógica
- Reduce la extensión al 50-60% del original
- No incluyas encabezados, firmas ni formato
- Solo devuelve el resumen

TEXTO ORIGINAL:
${texto}

RESUMEN:`;
}
