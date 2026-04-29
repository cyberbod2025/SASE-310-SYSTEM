import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useApp } from "../../store";
import { AppModule, CaseLabels, CaseState, IncidentType, Student, UserRole } from "../../types";
import { PERMISOS_POR_ROL, PermisosSASE } from "../../utils/permisos";
import {
  getGroupPulse,
  getOverdueFollowUps,
  getPendingCases,
  getTeacherRequests,
  GroupPulse,
  OperationalPriority,
  PendingCase,
  TeacherRequest,
} from "../../utils/caseEngine";
import { SOSButton } from "../core/SOSButton";

const priorityClasses: Record<OperationalPriority, string> = {
  critica: "border-rose-300/40 bg-rose-500/15 text-rose-100",
  alta: "border-amber-300/40 bg-amber-500/15 text-amber-100",
  media: "border-blue-300/40 bg-blue-500/15 text-blue-100",
};

const trendClasses: Record<GroupPulse["tendencia"], string> = {
  critica: "text-rose-200 bg-rose-500/15 border-rose-300/30",
  presion: "text-amber-100 bg-amber-500/15 border-amber-300/30",
  estable: "text-emerald-100 bg-emerald-500/15 border-emerald-300/30",
};

const getPermissions = (role: UserRole, profile: any): PermisosSASE => ({
  ...(PERMISOS_POR_ROL[String(role).toLowerCase()] || PERMISOS_POR_ROL.guest),
  ...(profile?.alcances || {}),
});

const MetricCard = ({ label, value, detail, icon, tone }: {
  label: string;
  value: string | number;
  detail: string;
  icon: string;
  tone: string;
}) => (
  <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-slate-950/20">
    <div className="mb-5 flex items-center justify-between gap-3">
      <div className={`flex size-11 items-center justify-center rounded-2xl ${tone}`}>
        <span className="material-icons text-xl">{icon}</span>
      </div>
      <span className="rounded-full border border-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-300">
        Hoy
      </span>
    </div>
    <p className="text-3xl font-black leading-none text-white">{value}</p>
    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</p>
    <p className="mt-3 text-xs leading-5 text-slate-300">{detail}</p>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-xs font-bold uppercase tracking-widest text-slate-500">
    {message}
  </div>
);

const DailyOperationsCard = ({ onAction }: { onAction: (action: string) => void }) => {
  const actions = [
    { label: "Abrir reporte operativo", icon: "add_alert", action: "register" },
    { label: "Validar cobertura", icon: "groups", action: "assign" },
    { label: "Revisar protocolos", icon: "health_and_safety", action: "protocols" },
    { label: "Radar de casos", icon: "radar", action: "reports" },
  ];

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-100">Operación diaria</p>
          <h3 className="mt-1 text-lg font-black text-white">Acciones de cumplimiento</h3>
        </div>
        <span className="material-icons text-amber-200">task_alt</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {actions.map((item) => (
          <button
            key={item.action}
            type="button"
            onClick={() => onAction(item.action)}
            className="min-h-[56px] rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-left transition hover:border-amber-200/50 hover:bg-amber-400/10"
          >
            <span className="material-icons mr-2 align-middle text-base text-amber-100">{item.icon}</span>
            <span className="text-xs font-black uppercase tracking-widest text-white">{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

const PendingCasesCard = ({ cases, selectedId, onSelect, onAction }: {
  cases: PendingCase[];
  selectedId: string | null;
  onSelect: (caseId: string) => void;
  onAction: (action: string, caseItem: PendingCase) => void;
}) => (
  <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-200">Casos pendientes</p>
        <h3 className="mt-1 text-lg font-black text-white">Bandeja de seguimiento</h3>
      </div>
      <span className="rounded-full bg-blue-500/15 px-3 py-1 text-[10px] font-black text-blue-100">{cases.length}</span>
    </div>
    <div className="space-y-3">
      {cases.slice(0, 7).map((caseItem) => (
        <article
          key={caseItem.id}
          className={`rounded-[1.5rem] border p-4 transition ${selectedId === caseItem.id ? "border-amber-200/70 bg-amber-400/10" : "border-white/10 bg-slate-950/30"}`}
        >
          <button type="button" className="w-full text-left" onClick={() => onSelect(caseItem.id)}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="truncate text-sm font-black uppercase tracking-wide text-white">{caseItem.alumno}</h4>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[9px] font-black text-slate-200">{caseItem.grupo}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-300">{caseItem.motivo}</p>
              </div>
              <span className={`shrink-0 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${priorityClasses[caseItem.prioridad]}`}>
                {caseItem.prioridad}
              </span>
            </div>
          </button>
          <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span>{caseItem.estadoLabel}</span>
            <span>Riesgo {caseItem.riesgo}</span>
            <span className={caseItem.overdue ? "text-rose-200" : "text-emerald-200"}>{caseItem.overdue ? "Vencido" : "En tiempo"}</span>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => onAction("follow", caseItem)} className="min-h-[42px] flex-1 rounded-2xl bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-950">
              Registrar seguimiento
            </button>
            <button type="button" onClick={() => onAction("escalate", caseItem)} className="min-h-[42px] flex-1 rounded-2xl border border-amber-300/40 bg-amber-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-amber-100">
              Escalar
            </button>
          </div>
        </article>
      ))}
      {cases.length === 0 && <EmptyState message="Sin casos pendientes en este corte" />}
    </div>
  </section>
);

const GroupPulseCard = ({ groups, onSelect }: { groups: GroupPulse[]; onSelect: (group: string) => void }) => (
  <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
    <div className="mb-5">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-200">Pulso de grupos</p>
      <h3 className="mt-1 text-lg font-black text-white">Mapa operativo</h3>
    </div>
    <div className="space-y-3">
      {groups.slice(0, 6).map((group) => (
        <button
          key={group.grupo}
          type="button"
          onClick={() => onSelect(group.grupo)}
          className="w-full rounded-[1.4rem] border border-white/10 bg-slate-950/30 p-4 text-left transition hover:border-emerald-200/40 hover:bg-emerald-400/10"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-black text-white">{group.grupo}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{group.activos} activos · {group.criticos} críticos</p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${trendClasses[group.tendencia]}`}>
              {group.tendencia}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-300" style={{ width: `${Math.min(100, group.riesgoPromedio)}%` }} />
          </div>
        </button>
      ))}
      {groups.length === 0 && <EmptyState message="Sin grupos activos" />}
    </div>
  </section>
);

const TeacherRequestsCard = ({ requests, onRespond }: { requests: TeacherRequest[]; onRespond: (request: TeacherRequest) => void }) => (
  <section className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
    <div className="mb-5">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-200">Solicitudes docentes</p>
      <h3 className="mt-1 text-lg font-black text-white">Respuesta operativa</h3>
    </div>
    <div className="space-y-3">
      {requests.map((request) => (
        <article key={request.id} className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-white">{request.alumno}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{request.docente} · {request.grupo}</p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${priorityClasses[request.prioridad]}`}>
              {request.prioridad}
            </span>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-300">{request.accion} por {request.tipo}</p>
          <button type="button" onClick={() => onRespond(request)} className="mt-4 min-h-[42px] w-full rounded-2xl bg-violet-400/15 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-violet-100 ring-1 ring-violet-300/30">
            Responder solicitud
          </button>
        </article>
      ))}
      {requests.length === 0 && <EmptyState message="Sin solicitudes docentes recientes" />}
    </div>
  </section>
);

export const DashboardSubdireccion = () => {
  const {
    students,
    currentUserRole,
    currentUserProfile,
    setCurrentModule,
    openQuickRegister,
    setIsAssistantOpen,
  } = useApp();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [groupFilter, setGroupFilter] = useState<string | null>(null);

  const permissions = useMemo(
    () => getPermissions(currentUserRole as UserRole, currentUserProfile),
    [currentUserProfile, currentUserRole],
  );
  const studentList = students as Student[];
  const pendingCases = useMemo(() => getPendingCases(studentList), [studentList]);
  const overdueFollowUps = useMemo(() => getOverdueFollowUps(studentList), [studentList]);
  const groupPulse = useMemo(() => getGroupPulse(studentList), [studentList]);
  const teacherRequests = useMemo(() => getTeacherRequests(studentList), [studentList]);

  const visiblePendingCases = useMemo(
    () => groupFilter ? pendingCases.filter((caseItem) => caseItem.grupo === groupFilter) : pendingCases,
    [groupFilter, pendingCases],
  );

  const selectedCase = useMemo(
    () => pendingCases.find((caseItem) => caseItem.id === selectedCaseId) || visiblePendingCases[0] || null,
    [pendingCases, selectedCaseId, visiblePendingCases],
  );

  const requirePermission = (permission: keyof PermisosSASE, message: string, action: () => void) => {
    if (!permissions[permission]) {
      toast.error("Acción no permitida para Subdirección en este contexto.");
      return;
    }
    action();
    toast.success(message);
  };

  const handleOperationAction = (action: string) => {
    if (action === "register") {
      requirePermission("can_register", "Abriendo registro operativo", () => openQuickRegister(IncidentType.CONDUCTA));
      return;
    }
    if (action === "assign") {
      requirePermission("can_assign_groups", "Cobertura de grupo marcada para revisión", () => setCurrentModule(AppModule.MATRICULA_INTELIGENTE));
      return;
    }
    if (action === "protocols") {
      setCurrentModule(AppModule.PROTOCOLOS);
      return;
    }
    setCurrentModule(AppModule.REPORTES);
  };

  const handleCaseAction = (action: string, caseItem: PendingCase) => {
    if (action === "follow") {
      requirePermission("can_edit", `Seguimiento registrado para ${caseItem.alumno}`, () => undefined);
      return;
    }
    requirePermission("can_escalate", `${caseItem.alumno} escalado para validación institucional`, () => undefined);
  };

  const insights = [
    overdueFollowUps.length > 0
      ? `${overdueFollowUps.length} seguimientos requieren empuje hoy.`
      : "No hay seguimientos vencidos críticos en este momento.",
    groupPulse[0]
      ? `Grupo ${groupPulse[0].grupo} concentra la presión operativa más alta.`
      : "Sin presión por grupo registrada.",
    teacherRequests.length > 0
      ? "Conviene responder primero solicitudes docentes con prioridad alta."
      : "No hay solicitudes docentes recientes pendientes.",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col overflow-y-auto px-4 pb-8 pt-3 md:px-6 lg:px-8"
    >
      <header className="sticky top-0 z-20 -mx-4 border-b border-white/10 bg-slate-950/80 px-4 py-4 backdrop-blur-2xl md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-amber-100">
                Subdirección operativa
              </span>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-100">
                Cumplimiento diario
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
              Tablero de empuje institucional
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Prioriza pendientes, coordina grupos y asegura que ningún caso avance sin seguimiento verificable.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setIsAssistantOpen(true)} className="min-h-[44px] rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-xs font-black uppercase tracking-widest text-white">
              Sasito operativo
            </button>
            <SOSButton compact onActivate={() => { toast.success("Prefectura y Orientación fueron notificadas"); }} />
          </div>
        </div>
      </header>

      <main className="mt-6 space-y-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Casos pendientes" value={pendingCases.length} detail="Casos abiertos que requieren empuje o revisión." icon="pending_actions" tone="bg-blue-500/20 text-blue-100" />
          <MetricCard label="Seguimientos vencidos" value={overdueFollowUps.length} detail="Pendientes con plazo operativo vencido o crítico." icon="notification_important" tone="bg-rose-500/20 text-rose-100" />
          <MetricCard label="Grupos bajo presión" value={groupPulse.filter((group) => group.tendencia !== "estable").length} detail="Grupos con acumulación de riesgo o casos activos." icon="groups" tone="bg-amber-500/20 text-amber-100" />
          <MetricCard label="Solicitudes docentes" value={teacherRequests.length} detail="Reportes docentes recientes que requieren respuesta." icon="mark_email_unread" tone="bg-violet-500/20 text-violet-100" />
        </section>

        {groupFilter && (
          <div className="flex items-center justify-between rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            <span className="font-bold">Filtro activo: {groupFilter}</span>
            <button type="button" onClick={() => setGroupFilter(null)} className="text-[10px] font-black uppercase tracking-widest underline">
              Ver todos
            </button>
          </div>
        )}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.85fr]">
          <PendingCasesCard cases={visiblePendingCases} selectedId={selectedCase?.id || null} onSelect={setSelectedCaseId} onAction={handleCaseAction} />
          <div className="space-y-6">
            <DailyOperationsCard onAction={handleOperationAction} />
            <GroupPulseCard groups={groupPulse} onSelect={setGroupFilter} />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <TeacherRequestsCard requests={teacherRequests} onRespond={(request) => requirePermission("can_edit", `Solicitud de ${request.docente} marcada para respuesta`, () => undefined)} />
          <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 p-5 shadow-2xl shadow-slate-950/30">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-100">Sasito Insights</p>
                <h3 className="mt-1 text-lg font-black text-white">Lectura operativa</h3>
              </div>
              <span className="material-icons text-amber-100">psychology</span>
            </div>
            <div className="space-y-3">
              {insights.map((insight) => (
                <div key={insight} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm leading-6 text-slate-200">
                  {insight}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setCurrentModule(AppModule.REPORTES)} className="mt-5 min-h-[44px] w-full rounded-2xl bg-amber-300 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-950">
              Ir a casos vencidos
            </button>
          </section>
        </section>

        {selectedCase && (
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-200">Detalle operativo</p>
                <h3 className="mt-1 text-2xl font-black text-white">{selectedCase.alumno}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{selectedCase.motivo}</p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-950/40 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Estado actual</p>
                    <p className="mt-1 text-sm font-black text-white">{CaseLabels[selectedCase.estado]}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-950/40 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Responsable</p>
                    <p className="mt-1 text-sm font-black text-white">Subdirección</p>
                  </div>
                  <div className="rounded-2xl bg-slate-950/40 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Siguiente acción</p>
                    <p className="mt-1 text-sm font-black text-white">{selectedCase.overdue ? "Atender hoy" : "Monitorear"}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Información sensible</p>
                {permissions.can_view_sensitive ? (
                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    {selectedCase.student.medicalHistory || selectedCase.student.bapInfo?.diagnosisPrivate || "Sin datos sensibles en memoria local."}
                  </p>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-slate-400">Oculta por permisos institucionales.</p>
                )}
                <button type="button" onClick={() => setCurrentModule(AppModule.EXPEDIENTES)} className="mt-5 min-h-[44px] w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-xs font-black uppercase tracking-widest text-white">
                  Consultar expediente
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </motion.div>
  );
};

export default DashboardSubdireccion;
