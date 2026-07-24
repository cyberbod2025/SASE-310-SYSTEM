export type MedicalAttentionStatus =
  | "abierta"
  | "observacion"
  | "referida"
  | "cerrada";

export type MedicalUrgency =
  | "baja"
  | "media"
  | "alta"
  | "emergencia";

export type MedicalExitType =
  | "regreso_clase"
  | "entrega_familiar"
  | "referencia_medica"
  | "emergencia";

export type HealthAlertType =
  | "padecimiento"
  | "alergia"
  | "medicamento"
  | "otra";

export interface MedicalAttentionRecord {
  id: string;
  studentId: string;
  studentName: string | null;
  group: string | null;
  reason: string;
  symptoms: string;
  assessment: string | null;
  vitalSigns: string | null;
  careProvided: string;
  medication: string | null;
  familyNotified: boolean;
  familyPickedUp: boolean;
  deliveryConditions: string | null;
  observations: string | null;
  status: MedicalAttentionStatus;
  urgency: MedicalUrgency;
  followUpDate: string | null;
  exitType: MedicalExitType | null;
  attendedBy: string | null;
  createdBy: string | null;
  occurredAt: string;
  updatedAt: string;
}

export interface HealthAlertRecord {
  id: string;
  studentId: string;
  type: HealthAlertType;
  condition: string;
  allergies: string | null;
  medications: string | null;
  instructions: string | null;
  active: boolean;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterMedicalAttentionInput {
  studentId: string;
  studentName: string;
  group: string;
  reason: string;
  symptoms: string;
  assessment?: string;
  vitalSigns?: string;
  careProvided: string;
  medication?: string;
  familyNotified: boolean;
  familyPickedUp: boolean;
  deliveryConditions?: string;
  observations?: string;
  status: MedicalAttentionStatus;
  urgency: MedicalUrgency;
  followUpDate?: string;
  exitType?: MedicalExitType;
}

export interface RegisterHealthAlertInput {
  studentId: string;
  type: HealthAlertType;
  condition: string;
  instructions: string;
}

export interface UpdateMedicalAttentionInput {
  status: MedicalAttentionStatus;
  followUpDate?: string;
  deliveryConditions?: string;
  observations?: string;
  exitType?: MedicalExitType;
}

export interface HealthMemory {
  attentions: MedicalAttentionRecord[];
  alerts: HealthAlertRecord[];
}

