/**
 * Detector de lenguaje subjetivo y advertencias de calidad
 * para documentos institucionales SASE.
 *
 * Basado en el Marco para la Convivencia Escolar CDMX:
 * Los documentos deben ser objetivos, neutros y sin juicios de valor.
 */

// Palabras y expresiones que indican lenguaje subjetivo
const PATRONES_SUBJETIVOS = [
  {
    patron: /\b(siempre|nunca|jamás)\b/gi,
    sugerencia:
      "Evite absolutismos. Use 'frecuentemente', 'en repetidas ocasiones' o 'no se ha observado'.",
  },
  {
    patron: /\b(grosero|malcriado|malencarado|irrespetuoso|rebelde)\b/gi,
    sugerencia:
      "Use lenguaje técnico: 'el alumno mostró conducta desafiante' o 'utilizó expresiones inadecuadas'.",
  },
  {
    patron: /\b(flojo|huevón|burro|tonto|menso)\b/gi,
    sugerencia:
      "CRÍTICO: Lenguaje inapropiado. Use: 'el alumno presenta rezago académico' o 'requiere apoyo pedagógico adicional'.",
  },
  {
    patron: /\b(culpa|culpable|responsable del daño)\b/gi,
    sugerencia:
      "Evite atribuir culpabilidad. Use: 'se identificó como involucrado en...' o 'participó en la situación descrita'.",
  },
  {
    patron: /\b(castigo|castigar|sanción)\b/gi,
    sugerencia:
      "Use 'acción formativa' o 'medida disciplinaria formativa' según el Marco para la Convivencia Escolar.",
  },
  {
    patron: /\b(expulsar|expulsión|correr)\b/gi,
    sugerencia:
      "Use 'canalización' o 'medida correctiva extraordinaria'. La expulsión está regulada por protocolos específicos.",
  },
  {
    patron: /\b(problemático|conflictivo|agresivo)\b/gi,
    sugerencia:
      "Use: 'alumno que presenta conductas que alteran la convivencia escolar' o 'requiere intervención formativa'.",
  },
  {
    patron: /\b(no sirve|inútil|incapaz)\b/gi,
    sugerencia:
      "CRÍTICO: Lenguaje discriminatorio. Use: 'presenta áreas de oportunidad en...' o 'requiere acompañamiento en...'.",
  },
  {
    patron: /\b(no le importa|le vale|no quiere)\b/gi,
    sugerencia:
      "Use: 'no manifiesta interés observable en...' o 'se percibe desvinculación con la actividad'.",
  },
  {
    patron: /\b(sus papás no lo cuidan|padres irresponsables)\b/gi,
    sugerencia:
      "Use: 'se requiere fortalecer la corresponsabilidad familiar en el seguimiento del alumno'.",
  },
];

// Verificaciones de completitud
const CAMPOS_REQUERIDOS = [
  { campo: "lugar_incidente", label: "Lugar del incidente" },
  { campo: "descripcion", label: "Descripción de los hechos" },
  { campo: "hora", label: "Hora del incidente" },
  { campo: "fecha", label: "Fecha del incidente" },
];

export interface Advertencia {
  tipo: "subjetivo" | "incompleto" | "mejora";
  severidad: "info" | "warning" | "critical";
  texto: string;
  sugerencia: string;
  posicion?: { inicio: number; fin: number };
}

/**
 * Analiza un texto buscando lenguaje subjetivo y devuelve advertencias.
 */
export function detectarLenguajeSubjetivo(texto: string): Advertencia[] {
  const advertencias: Advertencia[] = [];

  for (const { patron, sugerencia } of PATRONES_SUBJETIVOS) {
    // Reset regex state
    patron.lastIndex = 0;
    let match;
    while ((match = patron.exec(texto)) !== null) {
      const esCritico = sugerencia.startsWith("CRÍTICO");
      advertencias.push({
        tipo: "subjetivo",
        severidad: esCritico ? "critical" : "warning",
        texto: `Expresión detectada: "${match[0]}"`,
        sugerencia,
        posicion: { inicio: match.index, fin: match.index + match[0].length },
      });
    }
  }

  return advertencias;
}

/**
 * Verifica la completitud de los datos del documento.
 */
export function detectarCamposIncompletos(
  datos: Record<string, any>,
): Advertencia[] {
  const advertencias: Advertencia[] = [];

  for (const { campo, label } of CAMPOS_REQUERIDOS) {
    const valor = datos[campo];
    if (!valor || (typeof valor === "string" && valor.trim().length < 3)) {
      advertencias.push({
        tipo: "incompleto",
        severidad: "warning",
        texto: `Campo incompleto: ${label}`,
        sugerencia: `Complete el campo "${label}" para generar un documento válido.`,
      });
    }
  }

  // Verificar longitud mínima de descripción
  if (datos.descripcion && datos.descripcion.length < 30) {
    advertencias.push({
      tipo: "incompleto",
      severidad: "warning",
      texto: "Descripción demasiado corta",
      sugerencia:
        "Una descripción menor a 30 caracteres puede resultar en un documento impreciso. Agregue más detalle sobre los hechos.",
    });
  }

  return advertencias;
}

/**
 * Ejecuta todas las verificaciones y devuelve las advertencias combinadas.
 */
export function analizarDocumento(
  texto: string,
  datos: Record<string, any>,
): Advertencia[] {
  return [
    ...detectarLenguajeSubjetivo(texto),
    ...detectarCamposIncompletos(datos),
  ];
}
