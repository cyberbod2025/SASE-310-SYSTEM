import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useInstitutionalActions } from "../../hooks/useInstitutionalActions";
import { motion } from "framer-motion";
import { useApp } from "../../store";
import { AppModule, CaseLabels, CaseState, IncidentType, Student, UserRole } from "../../types";
import { PERMISOS_POR_ROL } from "../../utils/permisos";
import type { PermisosSASE } from "../../utils/permisos";
import { PrintPreviewModal } from "../PrintPreviewModal";
import { RoleHeader } from "../direccion/RoleHeader";
import { CriticalCasesCard } from "../direccion/CriticalCasesCard";
import { CaseTimeline } from "../direccion/CaseTimeline";
import { ClosureGuard } from "../direccion/ClosureGuard";
import { FollowUpCard } from "../direccion/FollowUpCard";
import { SasitoInsights } from "../direccion/SasitoInsights";
import { DireccionCaseDetail } from "../direccion/DireccionCaseDetail";
import {
  DIRECTION_CASE_STEPS,
  DirectionCase,
  DirectionCaseStep,
  DirectionFollowUp,
} from "../direccion/direccionTypes";

const currentStepByState: Record<CaseState, DirectionCaseStep> = {
  [CaseState.OBSERVADO]: "incidencia",
  [CaseState.PATRON_DETECTADO]: "prefectura",
  [CaseState.EN_ANALISIS]: "diagnostico",
  [CaseState.INTERVENCION]: "direccion",
  [CaseState.SEGUIMIENTO]: "seguimiento2",
  [CaseState.CERRADO]: "cierre",
};

const getPermissions = (role: UserRole, profile: any): PermisosSASE => {
  const base = PERMISOS_POR_ROL[String(role).toLowerCase()] || PERMISOS_POR_ROL.guest;
  return {
    ...base,
    ...(profile?.alcances || {}),
  };
};

const formatDateOffset = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
};

const stepForFollowUp = (step: number): DirectionCaseStep => `seguimiento${step}` as DirectionCaseStep;

const hasIncidentEvidence = (student: Student) =>
  (student.incidents || []).some((incident) => Array.isArray(incident.evidence) && incident.evidence.length > 0);

const hasTeacherDiagnosis = (student: Student) =>
  Boolean(
    student.bapInfo?.diagnosisPrivate ||
      (student.incidents || []).some((incident) =>
        [IncidentType.ACADEMICO, IncidentType.SOCIOEMOCIONAL].includes(incident.type),
      ),
  );

const buildDirectionCase = (student: Student): DirectionCase => {
  const risk = Number(student.puntajeRiesgo || 0);
  const incidents = student.incidents || [];
  const completedFollowUps = student.caseState === CaseState.CERRADO
    ? 4
    : Math.min(4, Math.max(0, Math.floor(incidents.length / 2)));
  const nextFollowUp = Math.min(4, completedFollowUps + 1);
  const isOverdue = student.caseState === CaseState.INTERVENCION || risk >= 70;
  const followUps: DirectionFollowUp[] = [1, 2, 3, 4].map((step) => ({
    id: `${student.id}-seguimiento-${step}`,
    alumno: student.name,
    step,
    total: 4,
    fecha: formatDateOffset(step <= completedFollowUps ? -step * 4 : step * 3),
    estado: step <= completedFollowUps ? "completed" : step === nextFollowUp && isOverdue ? "overdue" : "pending",
  }));
  const currentStep = student.caseState === CaseState.SEGUIMIENTO
    ? stepForFollowUp(nextFollowUp)
    : currentStepByState[student.caseState] || "direccion";
  const currentStepIndex = DIRECTION_CASE_STEPS.indexOf(currentStep);
  const evidence = hasIncidentEvidence(student) || Boolean(student.documentos?.length);
  const teacherDiagnosis = hasTeacherDiagnosis(student);
  const followUpsComplete = completedFollowUps >= 4 || student.caseState === CaseState.CERRADO;
  const overdueSteps = followUps
    .filter((item) => item.estado === "overdue")
    .map((item) => stepForFollowUp(item.step));
  const blockedSteps: DirectionCaseStep[] = followUpsComplete && evidence && teacherDiagnosis ? [] : ["cierre"];
  const completedSteps = DIRECTION_CASE_STEPS.filter((_, index) => index < currentStepIndex);
  const motivoCritico = overdueSteps.length > 0
    ? `Seguimiento ${nextFollowUp}/4 vencido`
    : !teacherDiagnosis
      ? "Diagnóstico docente pendiente"
      : !evidence
        ? "Evidencia institucional pendiente"
        : CaseLabels[student.caseState];

  return {
    id: student.id,
    alumno: student.name,
    grupo: student.group,
    estado: student.caseState,
    motivoCritico,
    riesgo: risk,
    currentStep,
    completedSteps,
    blockedSteps,
    overdueSteps,
    followUps,
    closureChecks: {
      followUpsComplete,
      evidence,
      teacherDiagnosis,
    },
    incidents,
    sensitiveSummary: student.medicalHistory || student.bapInfo?.diagnosisPrivate || "Sin datos sensibles registrados en memoria local.",
    student,
  };
};

export const DashboardDireccion = () => {
  const {
    students,
    currentUserRole,
    currentUserProfile,
    notifications,
    setCurrentModule,
    setIsAssistantOpen,
    setIsFeedbackOpen,
    openQuickRegister,
  } = useApp();
  const {
    escalateCase,
    closeCase,
    reopenCase,
    scheduleFollowUp,
    registerEvidence,
    sosAlert,
    confirmAttention,
  } = useInstitutionalActions();
  const [search, setSearch] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");

  const permissions = useMemo(
    () => getPermissions(currentUserRole as UserRole, currentUserProfile),
    [currentUserProfile, currentUserRole],
  );
  const canCloseCase = permissions.can_close;
  const canViewSensitive = permissions.can_view_sensitive;
  const canRegister = permissions.can_register;

  const directionCases = useMemo(
    () => (students as Student[]).map(buildDirectionCase),
    [students],
  );

  const visibleCases = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const base = directionCases.filter((caseItem) => caseItem.estado !== CaseState.CERRADO);
    if (!normalized) return base;
    return base.filter((caseItem) =>
      [caseItem.alumno, caseItem.grupo, caseItem.motivoCritico, CaseLabels[caseItem.estado]]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [directionCases, search]);

  const criticalCases = useMemo(
    () => visibleCases
      .filter((caseItem) =>
        caseItem.overdueSteps.length > 0 ||
        caseItem.riesgo >= 70 ||
        [CaseState.INTERVENCION, CaseState.SEGUIMIENTO, CaseState.PATRON_DETECTADO].includes(caseItem.estado),
      )
      .sort((a, b) => b.riesgo - a.riesgo),
    [visibleCases],
  );

  const activeCriticalCount = useMemo(
    () => visibleCases.filter((caseItem) => caseItem.estado === CaseState.INTERVENCION).length,
    [visibleCases],
  );

  const activeFollowUps = useMemo(
    () => criticalCases.flatMap((caseItem) => caseItem.followUps.filter((item) => item.estado !== "completed")),
    [criticalCases],
  );

  const selectedCase = useMemo(
    () => directionCases.find((caseItem) => caseItem.id === selectedCaseId) || null,
    [directionCases, selectedCaseId],
  );

  const insights = useMemo(() => {
    const overdueCount = criticalCases.reduce((total, item) => total + item.overdueSteps.length, 0);
    const groupCounts = criticalCases.reduce<Record<string, number>>((acc, item) => {
      acc[item.grupo] = (acc[item.grupo] || 0) + 1;
      return acc;
    }, {});
    const recurrentGroup = Object.entries(groupCounts).sort((a, b) => b[1] - a[1])[0];
    return [
      `Detecté ${overdueCount} seguimientos vencidos en casos activos.`,
      recurrentGroup ? `Grupo ${recurrentGroup[0]} presenta reincidencia institucional.` : "No detecté reincidencia por grupo en este corte.",
      criticalCases.length > 0 ? "Recomiendo intervención directa y agenda de seguimiento." : "No hay intervención directiva urgente en este momento.",
    ];
  }, [criticalCases]);

  const unreadNotifications = (notifications || []).filter((notification: any) => !notification.read).length;

  // Helper para resolver caso actualmente seleccionado a datos del alumno
  const getStudentFromCase = (caseId?: string | null) => {
    const c = directionCases.find((item) => item.id === (caseId || selectedCaseId));
    return c ? { id: c.id, name: c.alumno } : null;
  };

  const handleViewCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    window.history.replaceState(null, "", `#/direccion/caso/${caseId}`);
  };

  const handleBack = () => {
    setSelectedCaseId(null);
    window.history.replaceState(null, "", "#/direccion");
  };

  const handleCreateReport = () => {
    const rows = criticalCases.map((caseItem) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">${caseItem.alumno}</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">${caseItem.grupo}</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">${caseItem.motivoCritico}</td>
      </tr>
    `).join("");
    setPreviewContent(`
      <div style="font-family: Arial, sans-serif; color: #0f172a;">
        <h1 style="color:#1e3a8a;">Informe Ejecutivo de Dirección</h1>
        <p>Casos críticos activos: <strong>${criticalCases.length}</strong></p>
        <p>Regla institucional: <strong>Si no hay seguimiento, no hay cierre.</strong></p>
        <table style="width:100%; border-collapse: collapse; margin-top: 20px; font-size: 12px;">
          <thead>
            <tr style="background:#eff6ff;">
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align:left;">Alumno</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align:left;">Grupo</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align:left;">Motivo</th>
            </tr>
          </thead>
          <tbody>${rows || "<tr><td colspan='3' style='padding: 10px; border: 1px solid #cbd5e1;'>Sin casos críticos.</td></tr>"}</tbody>
        </table>
      </div>
    `);
    setShowPrintPreview(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col overflow-y-auto px-4 pb-8 pt-3 md:px-6 lg:px-8"
    >
      <RoleHeader
        searchValue={search}
        notificationsCount={unreadNotifications}
        onSearchChange={setSearch}
        onOpenSasito={() => setIsAssistantOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onSOS={() => {
          sosAlert(undefined, undefined, "SOS activado desde Dashboard Dirección");
        }}
      />
      <p className="sr-only">Vision sistemica institucional</p>

      {selectedCase ? (
        <DireccionCaseDetail
          caseItem={selectedCase}
          canCloseCase={canCloseCase}
          canViewSensitive={canViewSensitive}
          onBack={handleBack}
          onCloseCase={() => { const s = getStudentFromCase(); if (s) closeCase(s.id, s.name); }}
          onReopenCase={() => { const s = getStudentFromCase(); if (s) reopenCase(s.id, s.name); }}
          onEscalateCase={() => { const s = getStudentFromCase(); if (s) escalateCase(s.id, s.name, "Intervención prioritaria desde detalle de caso"); }}
          onScheduleFollowUp={() => { const s = getStudentFromCase(); if (s) scheduleFollowUp(s.id, s.name, "Seguimiento directivo"); }}
          onRegisterEvidence={() => { const s = getStudentFromCase(); if (s) registerEvidence(s.id, s.name, "Evidencia directiva registrada"); }}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <KpiCard label="Poblacion total atendida" value={(students as Student[]).length} icon="folder_shared" />
              <KpiCard label="Casos criticos activos" value={activeCriticalCount} icon="gavel" tone="danger" />
              <KpiCard label="Vencidos" value={activeFollowUps.filter((item) => item.estado === "overdue").length} icon="schedule" tone="warning" />
              <KpiCard label="Seguimientos" value={activeFollowUps.length} icon="fact_check" tone="success" />
            </section>

            <CriticalCasesCard
              cases={criticalCases}
              onViewCase={handleViewCase}
              onReopen={(caseId) => { const s = getStudentFromCase(caseId); if (s) reopenCase(s.id, s.name); }}
              onEscalate={(caseId) => { const s = getStudentFromCase(caseId); if (s) escalateCase(s.id, s.name, "Escalamiento desde panel de casos críticos"); }}
              onReschedule={(caseId) => { const s = getStudentFromCase(caseId); if (s) scheduleFollowUp(s.id, s.name, "Reagendamiento directivo"); }}
            />

            {criticalCases[0] && (
              <CaseTimeline
                currentStep={criticalCases[0].currentStep}
                completedSteps={criticalCases[0].completedSteps}
                blockedSteps={criticalCases[0].blockedSteps}
                overdueSteps={criticalCases[0].overdueSteps}
              />
            )}
          </div>

          <aside className="space-y-4">
            <SasitoInsights insights={insights} />

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 md:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-100">Acciones directivas</p>
                  <h3 className="text-lg font-black text-white">Operación</h3>
                </div>
                <button
                  type="button"
                  onClick={handleCreateReport}
                  className="rounded-2xl bg-amber-300 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-950"
                >
                  Generar reporte ejecutivo
                </button>
              </div>
              <div className="mt-4 grid gap-2">
                {canRegister && (
                  <ActionButton label="Crear incidencia" icon="add_alert" onClick={() => openQuickRegister(IncidentType.CONDUCTA)} />
                )}
                <ActionButton label="Consultar expediente institucional" icon="folder_open" onClick={() => setCurrentModule(AppModule.EXPEDIENTES)} />
                <ActionButton label="Control de objetos retenidos" icon="inventory_2" onClick={() => setCurrentModule(AppModule.OBJETOS_RETENIDOS)} />
                <ActionButton label="Generar informes" icon="print" onClick={handleCreateReport} />
                <ActionButton label="Supervisar vencidos" icon="alarm" onClick={() => toast("Filtro aplicado a casos vencidos")} />
              </div>
            </section>

            <section className="space-y-3">
              {activeFollowUps.slice(0, 4).map((followUp) => (
                <FollowUpCard
                  key={followUp.id}
                  followUp={followUp}
                  onRegisterEvidence={() => { const s = getStudentFromCase(followUp.id.split("-seguimiento-")[0]); if (s) registerEvidence(s.id, s.name, "Evidencia desde seguimiento"); }}
                  onReschedule={() => { const s = getStudentFromCase(followUp.id.split("-seguimiento-")[0]); if (s) scheduleFollowUp(s.id, s.name, "Reagendado desde panel de seguimientos"); }}
                  onMarkAttendance={() => { const s = getStudentFromCase(followUp.id.split("-seguimiento-")[0]); if (s) confirmAttention(s.id, s.name, "Asistencia al seguimiento"); }}
                  onReopenCase={() => { const s = getStudentFromCase(followUp.id.split("-seguimiento-")[0]); if (s) reopenCase(s.id, s.name); }}
                />
              ))}
            </section>

            {criticalCases[0] && (
              <ClosureGuard
                checks={criticalCases[0].closureChecks}
                canCloseCase={canCloseCase}
                onCloseCase={() => { const s = getStudentFromCase(criticalCases[0]?.id); if (s) closeCase(s.id, s.name); }}
              />
            )}
          </aside>
        </div>
      )}

      <PrintPreviewModal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        title="RESUMEN EJECUTIVO DE OPERACION INSTITUCIONAL"
        initialHtml={previewContent}
      />
    </motion.div>
  );
};

const KpiCard = ({
  label,
  value,
  icon,
  tone = "info",
}: {
  label: string;
  value: number;
  icon: string;
  tone?: "info" | "danger" | "warning" | "success";
}) => {
  const toneClass = {
    info: "border-blue-300/20 bg-blue-500/10 text-blue-100",
    danger: "border-rose-300/20 bg-rose-500/10 text-rose-100",
    warning: "border-amber-300/20 bg-amber-500/10 text-amber-100",
    success: "border-emerald-300/20 bg-emerald-500/10 text-emerald-100",
  }[tone];

  return (
    <div className={`rounded-[1.75rem] border p-4 ${toneClass}`}>
      <span className="material-icons text-xl">{icon}</span>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] opacity-75">{label}</p>
    </div>
  );
};

const ActionButton = ({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-white hover:bg-white/10"
  >
    <span className="material-icons text-base text-amber-100">{icon}</span>
    {label}
  </button>
);

export default DashboardDireccion;
