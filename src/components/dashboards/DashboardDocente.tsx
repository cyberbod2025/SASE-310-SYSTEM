import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useInstitutionalActions } from "../../hooks/useInstitutionalActions";
import { useApp } from "../../store";
import { IncidentType, Student, UserRole } from "../../types";
import { PERMISOS_POR_ROL, PermisosSASE } from "../../utils/permisos";
import { DocenteRoleHeader } from "../docente/DocenteRoleHeader";
import { DocenteSasitoHelper } from "../docente/DocenteSasitoHelper";
import { GroupListCard } from "../docente/GroupListCard";
import { IncidentQuickForm } from "../docente/IncidentQuickForm";
import { MyRecentIncidents } from "../docente/MyRecentIncidents";
import { QuickReportButton } from "../docente/QuickReportButton";
import { StudentQuickList } from "../docente/StudentQuickList";
import { TeacherAlertsCard } from "../docente/TeacherAlertsCard";
import { TeacherGroupDiagnosisOverview } from "../TeacherGroupDiagnosisOverview";
import {
  buildRecentTeacherIncidents,
  buildTeacherGroups,
  buildTeacherStudents,
  getTeacherAlerts,
  getTeacherIdentityTokens,
  QuickIncidentDraft,
  QUICK_INCIDENT_OPTIONS,
} from "../docente/docenteTypes";

const emptyDraft = (studentId = ""): QuickIncidentDraft => ({
  studentId,
  kind: "",
  description: "",
  evidenceNote: "",
  evidenceFileName: "",
});

const getPermissions = (role: UserRole, profile: any): PermisosSASE => ({
  ...(PERMISOS_POR_ROL[String(role).toLowerCase()] || PERMISOS_POR_ROL.docente),
  ...(profile?.alcances || {}),
});

const MetricCard = ({ label, value, detail, icon }: { label: string; value: string | number; detail: string; icon: string }) => (
  <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-slate-950/20">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-100">
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

export const DashboardDocente = () => {
  const {
    students,
    currentUserRole,
    currentUserProfile,
    addIncident,
    setIsAssistantOpen,
  } = useApp();
  const { escalateCase, sosAlert } = useInstitutionalActions();
  const incidentsRef = useRef<HTMLElement | null>(null);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [quickFormOpen, setQuickFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [periodoDiagnostico, setPeriodoDiagnostico] = useState<string | undefined>(undefined);


  const role = (currentUserRole || UserRole.DOCENTE) as UserRole;
  const permissions = useMemo(() => getPermissions(role, currentUserProfile), [currentUserProfile, role]);
  const studentList = students as Student[];
  const teacherStudents = useMemo(() => buildTeacherStudents(studentList), [studentList]);
  const groups = useMemo(() => buildTeacherGroups(teacherStudents), [teacherStudents]);
  const defaultStudentId = teacherStudents[0]?.id || "";
  const [draft, setDraft] = useState<QuickIncidentDraft>(() => emptyDraft(defaultStudentId));

  const visibleStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return teacherStudents.filter((student) => {
      const groupMatch = !selectedGroup || student.group === selectedGroup;
      const searchMatch = !query || [student.name, student.matricula, student.group]
        .some((value) => String(value || "").toLowerCase().includes(query));
      return groupMatch && searchMatch;
    });
  }, [search, selectedGroup, teacherStudents]);

  const activeStudents = visibleStudents.length ? visibleStudents : teacherStudents;
  const identityTokens = useMemo(
    () => getTeacherIdentityTokens(currentUserProfile, currentUserProfile?.email),
    [currentUserProfile],
  );
  const recentIncidents = useMemo(
    () => buildRecentTeacherIncidents(teacherStudents, role, identityTokens),
    [identityTokens, role, teacherStudents],
  );
  const alerts = useMemo(() => getTeacherAlerts(recentIncidents), [recentIncidents]);
  const todayReports = recentIncidents.filter((incident) => incident.date.slice(0, 10) === new Date().toISOString().slice(0, 10)).length;
  const topGroup = groups.slice().sort((a, b) => b.incidentsToday - a.incidentsToday)[0];

  const openReport = (studentId = draft.studentId || activeStudents[0]?.id || defaultStudentId) => {
    setDraft((current) => ({ ...current, studentId }));
    setQuickFormOpen(true);
  };

  const resetDraft = (studentId = draft.studentId) => setDraft(emptyDraft(studentId || activeStudents[0]?.id || defaultStudentId));

  const handleSaveIncident = async (keepOpen: boolean) => {
    if (!permissions.can_register) {
      toast.error("No autorizado para crear incidencias.");
      throw new Error("No autorizado");
    }

    const selectedStudent = teacherStudents.find((student) => student.id === draft.studentId);
    if (!selectedStudent) {
      toast.error("Selecciona un alumno.");
      return;
    }

    const selectedOption = QUICK_INCIDENT_OPTIONS.find((option) => option.kind === draft.kind);
    if (!selectedOption) {
      toast.error("Selecciona el tipo de incidencia.");
      return;
    }

    setIsSubmitting(true);
    try {
      const description = draft.description.trim() || selectedOption.defaultDescription;
      const evidence = [draft.evidenceNote.trim(), draft.evidenceFileName.trim()]
        .filter(Boolean)
        .map((item) => `Evidencia docente: ${item}`);

      const saved = await addIncident(
        selectedStudent.id,
        selectedOption.incidentType as IncidentType,
        description,
        evidence.length ? evidence : undefined,
      );
      if (!saved) return;

      toast.success(`Incidencia guardada: ${selectedStudent.name}`);
      resetDraft(keepOpen ? selectedStudent.id : "");
      setQuickFormOpen(keepOpen);
    } catch (err) {
      console.error("Error saving incident:", err);
      toast.error("Error al guardar incidencia.");
    } finally {
      setIsSubmitting(false);
    }
  };



  const insights = [
    `Has reportado ${todayReports} incidencias hoy.`,
    alerts[0]?.count > 0 ? "Recuerda agregar evidencia cuando ayude a entender el caso." : "Tus reportes recientes tienen evidencia o contexto suficiente.",
    topGroup?.incidentsToday ? `Grupo ${topGroup.name} tiene varias incidencias hoy.` : "No hay concentración de reportes por grupo en este corte.",
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col overflow-y-auto px-4 pb-8 pt-3 md:px-6 lg:px-8"
      >
        <DocenteRoleHeader
          searchValue={search}
          onSearchChange={setSearch}
          onOpenSasito={() => setIsAssistantOpen?.(true)}
          onSOS={() => { sosAlert(undefined, undefined, "SOS activado por docente desde Dashboard Docente"); }}
        />

        <main className="mt-6 space-y-6">
          <QuickReportButton onClick={() => openReport()} disabled={!permissions.can_register} />

          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard label="Mis alumnos" value={teacherStudents.length} detail="Alumnos visibles para este docente." icon="groups" />
            <MetricCard label="Reportes hoy" value={todayReports} detail="Incidencias propias registradas durante el día." icon="add_task" />
            <MetricCard label="Sin evidencia" value={alerts[0]?.count || 0} detail="Reportes donde una nota o foto podría ayudar." icon="photo_camera" />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <GroupListCard groups={groups} selectedGroup={selectedGroup} onSelectGroup={setSelectedGroup} />
            <StudentQuickList
              students={visibleStudents}
              selectedStudentId={draft.studentId}
              onSelectStudent={(studentId) => setDraft((current) => ({ ...current, studentId }))}
              onOpenReport={() => setQuickFormOpen(true)}
            />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div ref={incidentsRef as React.RefObject<HTMLDivElement>}>
              <MyRecentIncidents incidents={recentIncidents} />
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Periodo</label>
                <select
                  value={periodoDiagnostico ?? ""}
                  onChange={(e) => setPeriodoDiagnostico(e.target.value || undefined)}
                  className="w-36 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-200 outline-none focus:border-indigo-500/50"
                >
                  <option value="">Todos</option>
                  <option value="T1-2025">T1-2025</option>
                  <option value="T2-2026">T2-2026</option>
                  <option value="T3-2026">T3-2026</option>
                </select>
              </div>
              <TeacherGroupDiagnosisOverview grupo={selectedGroup || undefined} periodo={periodoDiagnostico} />
              <TeacherAlertsCard alerts={alerts} />
              <DocenteSasitoHelper
                insights={insights}
                onGoToIncidents={() => incidentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              />
              <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-200">Acción permitida</p>
                <h2 className="mt-1 text-xl font-black text-white">Escalar cuando aplica</h2>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Docente no cierra casos ni consulta datos sensibles. Solo reporta y solicita revisión.
                </p>
                <button 
                  type="button" 
                  onClick={() => {
                    toast.error("Función de escalamiento a Dirección en preparación. No se modificó el expediente.");
                  }} 
                  className="mt-5 min-h-[44px] w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-xs font-black uppercase tracking-widest text-slate-400 cursor-not-allowed"
                >
                  En preparación
                </button>
              </section>
            </div>
          </section>
        </main>
      </motion.div>

      <IncidentQuickForm
        open={quickFormOpen}
        draft={draft.studentId ? draft : { ...draft, studentId: activeStudents[0]?.id || defaultStudentId }}
        students={activeStudents}
        canRegister={permissions.can_register}
        onChange={setDraft}
        onClose={() => setQuickFormOpen(false)}
        onSubmit={handleSaveIncident}
        loading={isSubmitting}
      />
    </>
  );
};

export default DashboardDocente;
