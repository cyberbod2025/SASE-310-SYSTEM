import type { CaseState, Incident, Student } from "../../types";

export const DIRECTION_CASE_STEPS = [
  "incidencia",
  "prefectura",
  "citatorio1",
  "citatorio2",
  "citatorio3",
  "orientacion",
  "diagnostico",
  "direccion",
  "acuerdo",
  "seguimiento1",
  "seguimiento2",
  "seguimiento3",
  "seguimiento4",
  "cierre",
] as const;

export type DirectionCaseStep = (typeof DIRECTION_CASE_STEPS)[number];
export type TimelineNodeStatus = "complete" | "current" | "pending" | "blocked" | "overdue";
export type FollowUpStatus = "pending" | "completed" | "missed" | "overdue";

export interface DirectionFollowUp {
  id: string;
  alumno: string;
  step: number;
  total: number;
  fecha: string;
  estado: FollowUpStatus;
}

export interface ClosureChecks {
  followUpsComplete: boolean;
  evidence: boolean;
  teacherDiagnosis: boolean;
}

export interface DirectionCase {
  id: string;
  alumno: string;
  grupo: string;
  estado: CaseState;
  motivoCritico: string;
  riesgo: number;
  currentStep: DirectionCaseStep;
  completedSteps: DirectionCaseStep[];
  blockedSteps: DirectionCaseStep[];
  overdueSteps: DirectionCaseStep[];
  followUps: DirectionFollowUp[];
  closureChecks: ClosureChecks;
  incidents: Incident[];
  sensitiveSummary: string;
  student: Student;
}
