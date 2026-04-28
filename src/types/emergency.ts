export type EmergencyType = 'medica' | 'seguridad' | 'violencia' | 'emocional' | 'otros';

export type EmergencyStatus = 'activa' | 'atendida' | 'cancelada';

export type ResponseStatus = 'enterado' | 'voy_en_camino' | 'no_disponible' | 'atendida';

export interface EmergencyAlert {
  id: string;
  tipo_alerta: EmergencyType;
  descripcion_opcional?: string;
  grupo?: string;
  aula?: string;
  docente_id: string;
  docente_nombre: string;
  estado: EmergencyStatus;
  prioridad: 'media' | 'alta' | 'critica';
  protocolo_activado?: string;
  metadata: any;
  created_at: string;
  atendida_at?: string;
  cerrada_at?: string;
}

export interface EmergencyResponse {
  id: string;
  alerta_id: string;
  usuario_id: string;
  usuario_nombre: string;
  rol: string;
  respuesta: ResponseStatus;
  created_at: string;
}
