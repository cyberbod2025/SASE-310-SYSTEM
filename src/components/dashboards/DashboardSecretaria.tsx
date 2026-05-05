import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useInstitutionalActions } from "../../hooks/useInstitutionalActions";
import { useApp } from "../../store";
import { AppModule, Student, UserRole } from "../../types";
import { PERMISOS_POR_ROL, PermisosSASE } from "../../utils/permisos";
import { AdminAlertsCard } from "../secretaria/AdminAlertsCard";
import { DocumentsManagerCard } from "../secretaria/DocumentsManagerCard";
import { EnrollmentCard } from "../secretaria/EnrollmentCard";
import { InstitutionalAgendaCard } from "../secretaria/InstitutionalAgendaCard";
import { SchoolCycleClosureCard } from "../secretaria/SchoolCycleClosureCard";
import { SecretariaRoleHeader } from "../secretaria/SecretariaRoleHeader";
import { SecretariaSasitoHelper } from "../secretaria/SecretariaSasitoHelper";
import { SecretariaStudentDetail } from "../secretaria/SecretariaStudentDetail";
import { StudentRegistryCard } from "../secretaria/StudentRegistryCard";
import {
  AdminAlert,
  AGENDA_ITEMS,
  buildStudentSummary,
  getAdminAlerts,
  SecretariaDocumentType,
  SecretariaMetric,
  SecretariaStudentSummary,
} from "../secretaria/secretariaTypes";

const getPermissions = (role: UserRole, profile: any): PermisosSASE => ({
  ...(PERMISOS_POR_ROL[String(role).toLowerCase()] || PERMISOS_POR_ROL.secretaria),
  ...(profile?.alcances || {}),
});

const MetricCard = ({ metric }: { metric: SecretariaMetric }) => (
  <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-slate-950/20">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-100">
        <span className="material-icons text-xl">{metric.icon}</span>
      </div>
      <span className="rounded-full border border-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-300">
        Admin
      </span>
    </div>
    <p className="text-3xl font-black leading-none text-white">{metric.value}</p>
    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{metric.label}</p>
    <p className="mt-3 text-xs leading-5 text-slate-300">{metric.detail}</p>
  </div>
);

export const DashboardSecretaria = () => {
  const {
    students,
    groups,
    notices,
    notifications,
    currentUserRole,
    currentUserProfile,
    setCurrentModule,
    setIsAssistantOpen,
    setIsFeedbackOpen,
    updateStudentAudit,
    logAccess,
    logAudit,
  } = useApp();
  const { sosAlert } = useInstitutionalActions();

  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);

  const role = (currentUserRole || UserRole.SECRETARIA) as UserRole;
  const permissions = useMemo(() => getPermissions(role, currentUserProfile), [currentUserProfile, role]);
  const studentList = students as Student[];
  const summaries = useMemo(() => studentList.map(buildStudentSummary), [studentList]);
  const alerts = useMemo(() => getAdminAlerts(summaries), [summaries]);
  const activeAlert = alerts.find((alert) => alert.id === activeAlertId) || null;

  const visibleStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    const byAlert = activeAlert ? summaries.filter(activeAlert.filter) : summaries;
    if (!query) return byAlert;
    return byAlert.filter((student) => [
      student.name,
      student.matricula,
      student.curp,
      student.group,
    ].some((value) => String(value || "").toLowerCase().includes(query)));
  }, [activeAlert, search, summaries]);

  const selectedStudent = useMemo(
    () => summaries.find((student) => student.id === selectedStudentId) || visibleStudents[0] || summaries[0] || null,
    [selectedStudentId, summaries, visibleStudents],
  );

  const incompleteCount = alerts.find((alert) => alert.id === "incompletos")?.count || 0;
  const noGroupCount = alerts.find((alert) => alert.id === "sin-grupo")?.count || 0;
  const missingDocsCount = alerts.find((alert) => alert.id === "sin-documentos")?.count || 0;
  const notificationsCount = [notifications, notices]
    .flatMap((collection) => Array.isArray(collection) ? collection : [])
    .filter((item: any) => !item.read && !item.resolved).length;

  const metrics: SecretariaMetric[] = [
    {
      label: "Expedientes",
      value: summaries.length,
      detail: "Alumnos en control escolar para validación administrativa.",
      icon: "folder_shared",
    },
    {
      label: "Incompletos",
      value: incompleteCount,
      detail: "Requieren datos base, tutor o documentación faltante.",
      icon: "rule_folder",
    },
    {
      label: "Sin grupo",
      value: noGroupCount,
      detail: "Pendientes de asignación antes de listas institucionales.",
      icon: "groups_3",
    },
    {
      label: "Documentos faltantes",
      value: missingDocsCount,
      detail: "Expedientes sin documentos administrativos asociados.",
      icon: "draft",
    },
  ];

  const insights = [
    missingDocsCount > 0
      ? `Faltan documentos en ${missingDocsCount} expedientes.`
      : "No hay expedientes sin documentos en este corte.",
    noGroupCount > 0
      ? `Hay ${noGroupCount} alumnos sin grupo asignado.`
      : "Todos los alumnos visibles tienen grupo asignado.",
    incompleteCount > 0
      ? "Revisa cierre de ciclo pendiente antes de validar promoción."
      : "Los expedientes visibles están listos para procesos administrativos.",
  ];

  const requirePermission = (permission: keyof PermisosSASE, message: string, action: () => void | Promise<void>) => {
    if (!permissions[permission]) {
      toast.error("Acción no permitida para Secretaría en este contexto.");
      return;
    }
    void Promise.resolve(action()).then(() => toast.success(message));
  };

  const handleSelectStudent = (studentId: string) => {
    const student = summaries.find((item) => item.id === studentId);
    setSelectedStudentId(studentId);
    if (student) {
      void logAccess?.("Consultar expediente administrativo", student.id, student.name);
    }
  };

  const handleEditStudent = (student: SecretariaStudentSummary) => {
    requirePermission("can_edit", `Datos de ${student.name} listos para edición`, () => {
      setSelectedStudentId(student.id);
      void updateStudentAudit?.(student.id, "Secretaría");
    });
  };

  const handleValidateStudent = (student: SecretariaStudentSummary) => {
    requirePermission("can_edit", `Expediente de ${student.name} marcado para validación`, async () => {
      await logAudit?.("ACTUALIZACION", "Validación administrativa de expediente", "alumnos", student.id, student.name);
      await updateStudentAudit?.(student.id, "Secretaría");
    });
  };

  const handleGenerateDocument = (type: SecretariaDocumentType) => {
    if (!selectedStudent) {
      toast.error("Selecciona un expediente antes de generar documentos.");
      return;
    }
    requirePermission("can_register", "Plantilla administrativa preparada", async () => {
      await logAudit?.("CREACION", `Documento administrativo: ${type}`, "documentos", selectedStudent.id, selectedStudent.name);
      setCurrentModule(AppModule.DOCUMENTACION);
    });
  };

  const handleDownloadDocument = (type: SecretariaDocumentType) => {
    if (!selectedStudent) return;
    toast.success(`Descarga preparada: ${type}`);
  };

  const handlePrintDocument = (type: SecretariaDocumentType) => {
    if (!selectedStudent) return;
    toast.success(`Documento enviado a impresión: ${type}`);
  };

  const handleSelectAlert = (alert: AdminAlert) => {
    setActiveAlertId(alert.id);
    const firstMatch = summaries.find(alert.filter);
    if (firstMatch) setSelectedStudentId(firstMatch.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col overflow-y-auto px-4 pb-8 pt-3 md:px-6 lg:px-8"
    >
      <SecretariaRoleHeader
        searchValue={search}
        notificationsCount={notificationsCount}
        onSearchChange={setSearch}
        onOpenSasito={() => setIsAssistantOpen?.(true)}
        onOpenFeedback={() => setIsFeedbackOpen?.(true)}
        onSOS={() => { sosAlert(undefined, undefined, "SOS activado desde Control Escolar"); }}
      />

      <main className="mt-6 space-y-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
        </section>

        {activeAlert && (
          <div className="flex flex-col gap-3 rounded-2xl border border-violet-300/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-100 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-bold">Filtro activo: {activeAlert.label}</span>
            <button type="button" onClick={() => setActiveAlertId(null)} className="text-left text-[10px] font-black uppercase tracking-widest underline sm:text-right">
              Ver todos
            </button>
          </div>
        )}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <StudentRegistryCard
            students={visibleStudents}
            selectedId={selectedStudent?.id || null}
            canCreate={permissions.can_register}
            canEdit={permissions.can_edit}
            onSelect={handleSelectStudent}
            onCreate={() => requirePermission("can_register", "Abriendo alta de expediente", () => setCurrentModule(AppModule.INSCRIPCIONES))}
            onEdit={handleEditStudent}
            onValidate={handleValidateStudent}
          />
          <div className="space-y-6">
            <AdminAlertsCard alerts={alerts} onSelectAlert={handleSelectAlert} />
            <SecretariaSasitoHelper
              insights={insights}
              onGoToIncomplete={() => {
                const incompleteAlert = alerts.find((alert) => alert.id === "incompletos");
                if (incompleteAlert) handleSelectAlert(incompleteAlert);
              }}
            />
          </div>
        </section>

        <SecretariaStudentDetail
          student={selectedStudent}
          onEdit={handleEditStudent}
          onAttachDocument={() => requirePermission("can_edit", "Abriendo módulo documental", () => setCurrentModule(AppModule.DOCUMENTACION))}
          onGenerateDocument={handleGenerateDocument}
        />

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <DocumentsManagerCard
            selectedStudent={selectedStudent}
            onGenerate={handleGenerateDocument}
            onDownload={handleDownloadDocument}
            onPrint={handlePrintDocument}
          />
          <EnrollmentCard
            totalStudents={summaries.length}
            unassignedCount={noGroupCount}
            groupsCount={(groups || []).length}
            canAssignGroups={permissions.can_assign_groups}
            onNewStudent={() => requirePermission("can_register", "Abriendo alta de alumno", () => setCurrentModule(AppModule.INSCRIPCIONES))}
            onDropStudent={() => requirePermission("can_edit", "Baja administrativa preparada", () => setCurrentModule(AppModule.ARCHIVO))}
            onAssignGroup={() => requirePermission("can_assign_groups", "Abriendo asignación de grupo", () => setCurrentModule(AppModule.MATRICULA_INTELIGENTE))}
            onOpenMatricula={() => setCurrentModule(AppModule.MATRICULA_INTELIGENTE)}
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <InstitutionalAgendaCard
            items={AGENDA_ITEMS}
            onOpenAgenda={() => setCurrentModule(AppModule.AGENDA)}
            onCreateAppointment={() => {
              toast.success("Agenda abierta para registrar cita con padres");
              setCurrentModule(AppModule.AGENDA);
            }}
          />
          <SchoolCycleClosureCard
            totalStudents={summaries.length}
            incompleteCount={incompleteCount}
            unassignedCount={noGroupCount}
            onOpenClosure={() => setCurrentModule(AppModule.CIERRE_CICLO)}
            onSimulatePromotion={() => {
              toast.success("Preparando simulación de promoción");
              setCurrentModule(AppModule.CIERRE_CICLO);
            }}
          />
        </section>
      </main>
    </motion.div>
  );
};

export default DashboardSecretaria;
