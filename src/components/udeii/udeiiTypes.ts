import type { BAPInfo } from "../../types";

export type BapEventType =
  | "deteccion"
  | "ajuste"
  | "seguimiento"
  | "revision"
  | "cierre";

export type BapStatus =
  | "activo"
  | "en_seguimiento"
  | "cumplido"
  | "cerrado"
  | "cancelado";

export interface BapTrackingRecord {
  id: string;
  studentId: string;
  eventType: BapEventType;
  barrierType: string;
  action: string;
  status: BapStatus;
  observations: string | null;
  responsible: string;
  reviewDate: string | null;
  authorId: string | null;
  createdAt: string | null;
}

export interface RegisterBapEventInput {
  studentId: string;
  eventType: BapEventType;
  barrierType: string;
  action: string;
  status: BapStatus;
  observations?: string;
  responsible: string;
  reviewDate?: string;
}

export interface PersistedBapEvent {
  record: BapTrackingRecord;
  bapInfo: BAPInfo;
}
