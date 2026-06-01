import type { SasitoExperience } from "../types/sasitoExperience";

export const SASITO_EXPERIENCE_CATALOG: readonly SasitoExperience[] = [
  {
    id: "salida_aula_sin_autorizacion",
    nombre: "Salida del aula sin autorizacion",
    tipo: "seguridad",
    senales: ["sale del aula", "abandona clase", "salida sin autorizacion", "fuera del aula"],
    riesgoBase: "verde",
    accionesRecomendadas: [
      "registrar la salida no autorizada con hora y contexto",
      "verificar retorno seguro del alumno",
      "notificar a prefectura si existe reincidencia",
    ],
    noHacer: [
      "perseguir al alumno sin apoyo institucional",
      "cerrar el caso sin confirmar ubicacion",
    ],
    plantillaSugerida: "registro_salida_aula",
    activo: true,
  },
  {
    id: "no_trabaja_en_clase",
    nombre: "No trabaja en clase",
    tipo: "academica",
    senales: ["no trabaja", "no realiza actividad", "no entrega evidencia", "sin trabajo en clase"],
    riesgoBase: "verde",
    accionesRecomendadas: [
      "registrar observacion academica en clase",
      "ofrecer instruccion breve y verificable",
      "dar seguimiento si se repite en tres ocasiones",
    ],
    noHacer: [
      "etiquetar al alumno como desinteresado",
      "escalar sin evidencia de reincidencia",
    ],
    plantillaSugerida: "observacion_academica",
    activo: true,
  },
  {
    id: "lenguaje_ofensivo",
    nombre: "Lenguaje ofensivo",
    tipo: "conductual",
    senales: ["insulta", "lenguaje ofensivo", "ofensa verbal", "groserias"],
    riesgoBase: "verde",
    accionesRecomendadas: [
      "registrar palabras o conducta observada sin juicios",
      "redireccionar con indicacion breve",
      "solicitar apoyo si hay escalamiento verbal",
    ],
    noHacer: [
      "responder con confrontacion",
      "registrar interpretaciones sin hechos observables",
    ],
    plantillaSugerida: "registro_conductual",
    activo: true,
  },
  {
    id: "desacato_indicaciones",
    nombre: "Desacato de indicaciones",
    tipo: "conductual",
    senales: ["no sigue indicaciones", "desacato", "ignora instrucciones", "rechaza indicacion"],
    riesgoBase: "verde",
    accionesRecomendadas: [
      "registrar la indicacion dada y la respuesta observada",
      "repetir la instruccion de forma breve",
      "documentar reincidencias antes de escalar",
    ],
    noHacer: [
      "elevar el tono de la confrontacion",
      "convertir una negativa aislada en falta grave sin contexto",
    ],
    plantillaSugerida: "registro_conductual",
    activo: true,
  },
  {
    id: "agresion_fisica",
    nombre: "Agresion fisica",
    tipo: "seguridad",
    senales: ["agresion fisica", "golpe", "empujon", "pelea", "lesion fisica"],
    riesgoBase: "rojo",
    accionesRecomendadas: [
      "activar protocolo institucional de seguridad",
      "separar a los alumnos con apoyo adulto",
      "notificar a direccion y registrar hechos observables",
    ],
    noHacer: [
      "mediar sin condiciones de seguridad",
      "minimizar lesiones o amenazas",
    ],
    plantillaSugerida: "protocolo_seguridad",
    activo: true,
  },
  {
    id: "posible_riesgo_seguridad",
    nombre: "Posible riesgo de seguridad",
    tipo: "seguridad",
    senales: [
      "posible arma",
      "arma",
      "fuego",
      "incendio",
      "alumno no localizado",
      "no localizado",
      "conducta sexualizada",
      "riesgo de seguridad",
    ],
    riesgoBase: "rojo",
    accionesRecomendadas: [
      "activar protocolo institucional de seguridad",
      "avisar a direccion o prefectura de inmediato",
      "registrar solo hechos confirmados y personas notificadas",
    ],
    noHacer: [
      "confrontar al alumno sin apoyo",
      "difundir informacion no confirmada",
    ],
    plantillaSugerida: "protocolo_seguridad",
    activo: true,
  },
  {
    id: "citatorio_sin_respuesta",
    nombre: "Citatorio sin respuesta",
    tipo: "familiar",
    senales: ["citatorio sin respuesta", "familia no responde", "sin respuesta familiar", "no acude tutor"],
    riesgoBase: "verde",
    accionesRecomendadas: [
      "registrar fecha y medio del citatorio",
      "intentar segundo contacto institucional",
      "escalar a trabajo social si se repite",
    ],
    noHacer: [
      "asumir negligencia sin evidencia",
      "cerrar seguimiento sin segundo intento documentado",
    ],
    plantillaSugerida: "seguimiento_familiar",
    activo: true,
  },
  {
    id: "uso_indebido_celular",
    nombre: "Uso indebido de celular",
    tipo: "conductual",
    senales: ["uso de celular", "celular en clase", "graba sin permiso", "telefono en clase"],
    riesgoBase: "verde",
    accionesRecomendadas: [
      "registrar uso observado y momento de clase",
      "aplicar indicacion institucional sobre dispositivo",
      "dar seguimiento si hay reincidencia",
    ],
    noHacer: [
      "retener pertenencias sin procedimiento institucional",
      "revisar contenido personal del dispositivo",
    ],
    plantillaSugerida: "registro_conductual",
    activo: true,
  },
  {
    id: "conducta_positiva",
    nombre: "Conducta positiva",
    tipo: "seguimiento",
    senales: ["conducta positiva", "apoyo a companero", "participacion positiva", "mejora observable"],
    riesgoBase: "verde",
    accionesRecomendadas: [
      "registrar reconocimiento positivo",
      "vincular evidencia con seguimiento institucional",
    ],
    noHacer: [
      "usar el registro positivo para compensar faltas no atendidas",
      "exponer publicamente informacion sensible del alumno",
    ],
    plantillaSugerida: "reconocimiento_positivo",
    activo: true,
  },
];

export const findSasitoExperienceById = (id: string): SasitoExperience | undefined =>
  SASITO_EXPERIENCE_CATALOG.find((experience) => experience.activo && experience.id === id);
