/**
 * SASE-310 - Configuración Institucional Centralizada
 *
 * Este archivo contiene todas las constantes de configuración
 * del sistema que pueden cambiar entre ciclos escolares.
 *
 * ÚLTIMA ACTUALIZACIÓN: 2026-01-28
 */

// ============================
// DATOS DEL CICLO ESCOLAR
// ============================
export const CICLO_ESCOLAR = {
  /** Nombre completo del ciclo escolar actual */
  nombre: "2025-2026",

  /** Fecha de inicio del ciclo */
  fechaInicio: "2025-08-19",

  /** Fecha de fin del ciclo */
  fechaFin: "2026-07-10",

  /** Trimestre actual (1, 2 o 3) */
  trimestreActual: 2,

  /** Label para mostrar en UI */
  label: "Ciclo Escolar 2025-2026",

  /** Label corto */
  labelCorto: "2025-2026",
};

// ============================
// DATOS DE LA INSTITUCIÓN
// ============================
export const INSTITUCION = {
  /** Nombre completo de la escuela */
  nombre: 'Escuela Secundaria Diurna No. 310 "Presidentes de México"',

  /** Nombre corto */
  nombreShort: "ESD 310",

  /** Dirección física */
  direccion:
    "Calle Jaime Nunó S/N, Col. Presidentes de México, Alcaldía Iztapalapa, Ciudad de México",

  /** CCT (Clave de Centro de Trabajo) */
  cct: "09DES4310M",

  /** Turno */
  turno: "Vespertino",

  /** Zona escolar */
  zona: "Zona 23",

  /** Entidad */
  entidad: "Ciudad de México",
};

// ============================
// SLOGAN Y BRANDING
// ============================
export const BRANDING = {
  /** Slogan oficial - NO MODIFICAR */
  slogan: "DONDE EL DEBER Y LA CONCIENCIA SE ENCUENTRAN",

  /** Nombre del sistema */
  sistemaName: "SASE",

  /** Nombre completo del sistema */
  sistemaNameFull: "Sistema de Acompañamiento y Seguimiento Escolar",
};

// ============================
// VERSIÓN DEL SISTEMA
// ============================
export const VERSION = {
  /** Versión actual */
  numero: "3.10.0",

  /** Fase de desarrollo */
  fase: "Piloto Institucional",

  /** Fecha de build */
  buildDate: "2026-01-28",

  /** Identificador único del build */
  buildId: "PILOT-2026.01.28",
};

// ============================
// GRUPOS Y GRADOS
// ============================
export const GRUPOS = {
  primerGrado: ["1°A", "1°B", "1°C", "1°D"],
  segundoGrado: ["2°A", "2°B", "2°C", "2°D"],
  tercerGrado: ["3°A", "3°B", "3°C", "3°D"],
  todos: function () {
    return [...this.primerGrado, ...this.segundoGrado, ...this.tercerGrado];
  },
};

// ============================
// HORARIOS
// ============================
export const HORARIOS = {
  /** Hora de entrada */
  entrada: "14:00",

  /** Tolerancia de retardo (minutos) */
  toleranciaRetardo: 10,

  /** Hora de salida */
  salida: "20:10",
};

// ============================
// HELPERS
// ============================

/**
 * Obtiene el saludo según la hora del día
 */
export function getSaludo(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Buenos días";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
}

/**
 * Obtiene el contexto del turno actual
 */
export function getContextoTurno(): string {
  return `${getSaludo()}. (Turno ${INSTITUCION.turno} | CCT ${INSTITUCION.cct}).`;
}

/**
 * Obtiene la fecha formateada en español
 */
export function getFechaHoy(): string {
  return new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
