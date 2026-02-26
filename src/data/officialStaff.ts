import { UserRole } from "../types";

export interface OfficialStaffMember {
  full_name: string;
  department: string;
  role: UserRole;
  is_active: boolean;
}

export const OFFICIAL_STAFF_LIST: OfficialStaffMember[] = [
  // Cuerpo Directivo
  {
    full_name: "MIGUEL ANGEL MORALES SANDOVAL",
    department: "DIRECCION",
    role: UserRole.DIRECTIVO,
    is_active: true,
  },
  {
    full_name: "NERIA DIAZ PABLO ISAAC",
    department: "SUBDIRECCION",
    role: UserRole.SUBDIRECCION,
    is_active: true,
  },
  {
    full_name: "LOPEZ QUERO JOSE LUIS",
    department: "SUBDIRECCION",
    role: UserRole.SUBDIRECCION,
    is_active: true,
  },
  {
    full_name: "JURADO CHAVEZ VICTOR ALEJANDRO",
    department: "CONTRALORIA",
    role: UserRole.DIRECTIVO,
    is_active: true,
  },

  // Apoyo Especializado
  {
    full_name: "ROBLEDO OSORIO MARTHA GDPE.",
    department: "ORIENTACION",
    role: UserRole.ORIENTACION,
    is_active: true,
  },
  {
    full_name: "VARGAS ANDRES DIANA ALEXANDRA",
    department: "ORIENTACION",
    role: UserRole.ORIENTACION,
    is_active: true,
  },
  {
    full_name: "VILLALOBOS CERVANTES SILVIA Y.",
    department: "TRABAJO SOCIAL",
    role: UserRole.TRABAJO_SOCIAL,
    is_active: true,
  },
  {
    full_name: "XOLALPA JIMENEZ NORMA LORENA",
    department: "MEDICO ESCOLAR",
    role: UserRole.ENFERMERIA,
    is_active: true,
  },
  {
    full_name: "INGRID GONZALEZ NAVARRETE",
    department: "UDEII",
    role: UserRole.UDEII,
    is_active: true,
  },
  {
    full_name: "GUERRERO PEREZ SUSANA",
    department: "PROMOTORA L.E",
    role: UserRole.PROMOTORA,
    is_active: true,
  },

  // Docentes Español
  {
    full_name: "CORTES BAIZABAL GERMAN",
    department: "ESPAÑOL",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "LEGARIA GORDILLO JOSE LUIS",
    department: "ESPAÑOL",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "RAMIREZ TELOXA ANGELES YERALDIN",
    department: "ESPAÑOL",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "VALLERROJO MALLA MA. DEL SOCORRO",
    department: "ESPAÑOL",
    role: UserRole.DOCENTE,
    is_active: true,
  },

  // Docentes Matemáticas
  {
    full_name: "BERNAL ESTRADA MARISOL",
    department: "MATEMÁTICAS",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "CORTES ROJAS JUAN ANTONIO",
    department: "MATEMÁTICAS",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "URBANO LOPEZ HANS EDSON",
    department: "MATEMÁTICAS",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "SANCHEZ RESENDIZ HUGO",
    department: "MATEMÁTICAS",
    role: UserRole.DOCENTE,
    is_active: true,
  },

  // Docentes Historia y Geografía
  {
    full_name: "TABAREZ CASARRUBIAS BALTAZAR",
    department: "HISTORIA",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "ECHEVARRIA GARCIA ELIZABETH",
    department: "HISTORIA",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "HERNANDEZ MARCOS PEDRO",
    department: "HISTORIA",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "CORTES SALMERON JAIRO DAVID",
    department: "GEOGRAFÍA",
    role: UserRole.DOCENTE,
    is_active: true,
  },

  // Docentes F. Cívica y Ética
  {
    full_name: "CRUZ MARIN FERMIN ANTONIO",
    department: "F.CÍVICA Y ÉTICA",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "ROSAS BELLO JORGE LUIS",
    department: "F.CÍVICA Y ÉTICA",
    role: UserRole.DOCENTE,
    is_active: true,
  },

  // Docentes Ciencias
  {
    full_name: "PINA FUENTES DULCE JANETTE",
    department: "CIENCIAS QUÍMICA",
    role: UserRole.DOCENTE.toString() as UserRole,
    is_active: true,
  },
  {
    full_name: "PEREZ PEREZ KIMBERLY",
    department: "CIENCIAS QUÍMICA",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "DIAZ VILLANUEVA BRENDA JOSAHANY",
    department: "BIOLOGÍA",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "RIVERA GARCIA PABLO MIGUEL",
    department: "FÍSICA",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "RANGEL BANDY JORGE ANTONIO",
    department: "FÍSICA",
    role: UserRole.DOCENTE,
    is_active: true,
  },

  // Otras Materias y Talleres
  {
    full_name: "GUERRERO OROZCO NORMA P.",
    department: "INGLÉS",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "HURTADO MARIN JUAN JOSE",
    department: "INGLÉS",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "FLORES LOPEZ VICTOR MANUEL",
    department: "ARTES",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "GUTIERREZ AVENDANO DIANA BELEM",
    department: "MÚSICA",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "ARELLANO SANTOYO MIGUEL",
    department: "EDUC. FÍSICA",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "MOTA CANO NOE",
    department: "EDUC. FÍSICA",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "MORALES NAVARRETE RUTH",
    department: "DISEÑO ARQUITEC.",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "RAMÍREZ SILVA VICENTE",
    department: "DISEÑO ARQUITEC.",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "CONTRERAS MARTINEZ JOSELYN",
    department: "CONF. DEL VESTIDO",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "ANDRADE GALICIA CLAUDIA",
    department: "DISEÑO GRÁFICO",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "FLORES SILVA JORGE ALBERTO",
    department: "DISEÑO DE CIR.",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "CAMPOS VILCHIS EDUARDO",
    department: "DISEÑO DE EST.",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "RIVERA CRUZ ORALIA",
    department: "METÁLICAS",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "AZUCENO GIL JUVENTINA ROCIO",
    department: "OFIMÁTICA",
    role: UserRole.DOCENTE,
    is_active: true,
  },
  {
    full_name: "DIAZ NUÑEZ MARIA ELENA",
    department: "OFIMÁTICA",
    role: UserRole.DOCENTE,
    is_active: true,
  },

  // Prefectura y Secretaría
  {
    full_name: "ALVAREZ GOMEZ JUAN LUIS",
    department: "PREFECTURA",
    role: UserRole.PREFECTURA,
    is_active: true,
  },
  {
    full_name: "GARCIA PEÑALOZA MARCELINA PAULA",
    department: "PREFECTURA",
    role: UserRole.PREFECTURA,
    is_active: true,
  },
  {
    full_name: "MEDINA FRANCO JOSE LUIS",
    department: "PREFECTURA",
    role: UserRole.PREFECTURA,
    is_active: true,
  },
  {
    full_name: "DIAZ RUIZ EDGAR",
    department: "SECRETARÍA",
    role: UserRole.SECRETARIA,
    is_active: true,
  },
  {
    full_name: "FLORES CALVILLO GABRIELA",
    department: "SECRETARÍA",
    role: UserRole.SECRETARIA,
    is_active: true,
  },
  {
    full_name: "GALINDO ARGUETA DULCE MARIA",
    department: "SECRETARÍA",
    role: UserRole.SECRETARIA,
    is_active: true,
  },
  {
    full_name: "RODRIGUEZ MARQUEZ JORGE",
    department: "SECRETARÍA",
    role: UserRole.SECRETARIA,
    is_active: true,
  },
];
