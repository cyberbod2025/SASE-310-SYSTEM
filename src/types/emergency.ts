export type EmergencyType = 'medica' | 'seguridad' | 'violencia' | 'emocional' | 'otros';

export type EmergencyStatus = 'activa' | 'atendida' | 'cancelada';

export type ResponseStatus = 'enterado' | 'voy_en_camino' | 'no_disponible' | 'atendida';

export type EmergencyLocation = 'Aula' | 'Patio' | 'Bano' | 'Pasillo' | 'Otro';

export type EmergencySyncStatus = 'enviada' | 'pendiente_envio' | 'error_envio';

export interface EmergencyCreateOptions {
  grupo?: string;
  aula?: string;
  ubicacion?: EmergencyLocation;
  silent?: boolean;
  descripcion?: string;
}

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
  escalado_nivel: number;
  ultima_notificacion_at?: string;
  created_at: string;
  atendida_at?: string;
  cerrada_at?: string;
  atendida_por?: string;
  tiempo_respuesta_seg?: number;
  sync_status?: EmergencySyncStatus;
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
