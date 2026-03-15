// Tipos para expediente institucional del alumno SASE-310

export interface DatosAlumnoExpediente {
  id: string;
  nombre: string;
  grupo: string;
  grado: string;
  turno: string;
  curp?: string;
  tutor?: string;
  telefono_tutor?: string;
}

export interface IncidenciaExpediente {
  id: string;
  fecha: string;
  tipo: string;
  descripcion: string;
  estado: string;
  reporta: string;
  clasificacion?: string; // Tipo I, II, III
}

export interface DocumentoExpediente {
  id: string;
  folio: string;
  tipo: string;
  fecha: string;
  titulo: string;
  contenido: string;
  generado_por: string;
}

export interface EventoLinea {
  fecha: string;
  tipo: "incidencia" | "documento" | "reunion" | "acuerdo" | "seguimiento";
  titulo: string;
  descripcion: string;
  icon: string;
  color: string;
  document_id?: string;
  incidencia_id?: string;
}

export interface ObjetoRetenidoExpediente {
  id: string;
  objeto: string;
  motivo: string;
  fecha: string;
  responsableNombre: string;
  estado: string;
  fechaDevolucion?: string;
  entregadoA?: string;
}

export interface ExpedienteCompleto {
  folio: string;
  alumno: DatosAlumnoExpediente;
  incidencias: IncidenciaExpediente[];
  documentos: DocumentoExpediente[];
  objetosRetenidos: ObjetoRetenidoExpediente[];
  lineaTiempo: EventoLinea[];
  analisisIA?: string;
  fechaGeneracion: string;
  generadoPor: string;
}
