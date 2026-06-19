import React, { useState } from "react";
import { supabase } from "../../supabase/client";
import toast from "react-hot-toast";
import { useApp } from "../../store";
import { PERMISOS_POR_ROL } from "../../utils/permisos";
import { CaseExecutionQueue } from "../trabajoSocial/CaseExecutionQueue";
import { CitatoriosTracker } from "../trabajoSocial/CitatoriosTracker";
import { ComplianceTracker } from "../trabajoSocial/ComplianceTracker";
import { FamilyContactLog } from "../trabajoSocial/FamilyContactLog";
import { HomeVisitLog } from "../trabajoSocial/HomeVisitLog";
import { TrabajoSocialCaseDetail } from "../trabajoSocial/TrabajoSocialCaseDetail";
import { TrabajoSocialInsights } from "../trabajoSocial/TrabajoSocialInsights";
import { TrabajoSocialRoleHeader } from "../trabajoSocial/TrabajoSocialRoleHeader";
import {
  buildInitialAgreements,
  buildInitialCitatorios,
  buildInitialContacts,
  buildInitialVisits,
  buildTrabajoSocialCases,
  CitatorioRecord,
  ComplianceAgreement,
  ComplianceStatus,
  ContactType,
  createCitatorio,
  createContact,
  createVisit,
  FamilyContactRecord,
  hasThreeUnansweredCitatorios,
  HomeVisitRecord,
  TrabajoSocialInterventionStatus,
} from "../trabajoSocial/trabajoSocialTypes";

export const DashboardTrabajoSocial = () => {
  const { students, createEmergencyAlert, currentUserProfile } = useApp();
  const rolePermissions = PERMISOS_POR_ROL.trabajo_social;
  const baseCases = buildTrabajoSocialCases(students);

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Estado de seguimiento local de la sesión (honesto, sin fingir persistencia DB)
  const [localCases, setLocalCases] = useState<Record<string, {
    status: "Cumplido" | "En proceso" | "Incumplido" | "Sin iniciar";
    history: Array<{ action: string; timestamp: string }>;
  }>>({});

  const addLocalAction = (studentId: string, actionName: string) => {
    if (!studentId) return;
    const time = new Date().toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setLocalCases((prev) => {
      const current = prev[studentId] || { status: "Sin iniciar", history: [] };
      return {
        ...prev,
        [studentId]: {
          ...current,
          history: [
            ...current.history,
            { action: actionName, timestamp: time },
          ],
        },
      };
    });
  };

  const updateLocalStatus = (studentId: string, status: "Cumplido" | "En proceso" | "Incumplido") => {
    if (!studentId) return;
    const time = new Date().toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setLocalCases((prev) => {
      const current = prev[studentId] || { status: "Sin iniciar", history: [] };
      return {
        ...prev,
        [studentId]: {
          ...current,
          status,
          history: [
            ...current.history,
            { action: `Estado cambiado a ${status}`, timestamp: time },
          ],
        },
      };
    });
    toast(`Estado actualizado a ${status} (solo borrador local — sin persistencia en base de datos).`, {
      icon: "📝",
    });
  };

  const [sasitoOpen, setSasitoOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(baseCases[0]?.id || null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, TrabajoSocialInterventionStatus>>({});
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [citatorios, setCitatorios] = useState<CitatorioRecord[]>(() => buildInitialCitatorios(baseCases));
  const [contacts, setContacts] = useState<FamilyContactRecord[]>(() => buildInitialContacts(baseCases));
  const [visits, setVisits] = useState<HomeVisitRecord[]>(() => buildInitialVisits(baseCases));
  const [agreements, setAgreements] = useState<ComplianceAgreement[]>(() => buildInitialAgreements(baseCases));

  const cases = baseCases.map((caseItem) => ({
    ...caseItem,
    estadoIntervencion: statusOverrides[caseItem.id] || caseItem.estadoIntervencion,
  }));

  const normalizedSearch = search.trim().toLowerCase();
  const filteredCases = normalizedSearch
    ? cases.filter((caseItem) => [
      caseItem.alumno,
      caseItem.grupo,
      caseItem.responsablePrevio,
      caseItem.motivo,
    ].join(" ").toLowerCase().includes(normalizedSearch))
    : cases;

  const selectedCase = cases.find((caseItem) => caseItem.id === selectedCaseId) || filteredCases[0] || cases[0] || null;
  const criticalAlerts = cases.filter((caseItem) => hasThreeUnansweredCitatorios(caseItem.id, citatorios)).length;

  const setCaseStatus = (caseId: string, status: TrabajoSocialInterventionStatus) => {
    setStatusOverrides((current) => ({ ...current, [caseId]: status }));
  };

  const handleStartFollowUp = (caseId: string) => {
    setSelectedCaseId(caseId);
    setCaseStatus(caseId, "seguimiento");
    addLocalAction(caseId, "Iniciar seguimiento");
    setLastAction("Seguimiento iniciado (solo borrador local — sin persistencia en base de datos).");
    toast("Seguimiento iniciado (solo borrador local — sin persistencia en base de datos).", { icon: "🚀" });
  };

  const handleRegisterCitatorio = (caseId: string) => {
    const currentCount = citatorios.filter((citatorio) => citatorio.caseId === caseId).length;
    setCitatorios((current) => [...current, createCitatorio(caseId, currentCount)]);
    setCaseStatus(caseId, "alerta_sin_respuesta");
    addLocalAction(caseId, "Citatorio registrado");
    setLastAction("Citatorio registrado en borrador local. Sin persistencia en base de datos.");
    toast("Citatorio registrado (solo borrador local — sin persistencia en base de datos).", { icon: "📅" });
  };

  const handleMarkAttendance = (citatorioId: string) => {
    const citatorioItem = citatorios.find((c) => c.id === citatorioId);
    if (citatorioItem) {
      addLocalAction(citatorioItem.caseId, "Marcar asistencia");
    }
    setCitatorios((current) => current.map((citatorio) => citatorio.id === citatorioId ? { ...citatorio, respuesta: "asistio" } : citatorio));
    setLastAction("Asistencia marcada en borrador local. Sin persistencia en base de datos.");
    toast("Asistencia marcada (solo borrador local — sin persistencia en base de datos).", { icon: "✅" });
  };

  const handleRegisterContact = async (caseId: string, tipo: ContactType = "llamada", resultado = "Contacto familiar rapido registrado.") => {
    setSelectedCaseId(caseId);
    setContacts((current) => [createContact(caseId, tipo, resultado), ...current]);
    setCaseStatus(caseId, "contacto_familiar");
    addLocalAction(caseId, `Contacto registrado: ${tipo}`);

    const student = cases.find((c) => c.id === caseId)?.student;
    const studentUuid = student?.id ?? null;
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id ?? null;

    const { error: dbError } = await (supabase.from("contacts_log" as any) as any).insert({
      method: tipo,
      notes: resultado,
      outcome: "registrado",
      student_id: studentUuid,
      user_id: userId,
    });

    if (dbError) {
      console.error("[TrabajoSocial] contacts_log insert failed:", dbError);
      setLastAction("Error al guardar contacto en base de datos. Registro disponible solo en esta sesion.");
      toast.error("No se pudo guardar el contacto en la base de datos. Solo disponible en esta sesion.", { icon: "⚠️" });
    } else {
      setLastAction("Contacto familiar registrado y guardado en base de datos institucional.");
      toast.success("Contacto registrado y guardado en base de datos.", { icon: "📞" });
    }
  };

  const handleRegisterVisit = (caseId: string, observaciones: string) => {
    setSelectedCaseId(caseId);
    setVisits((current) => [createVisit(caseId, observaciones), ...current]);
    setCaseStatus(caseId, "visita_programada");
    addLocalAction(caseId, "Visita domiciliaria registrada");
    setLastAction("Visita registrada en borrador local. Sin persistencia en base de datos.");
    toast("Visita registrada (solo borrador local — sin persistencia en base de datos).", { icon: "🏠" });
  };

  const handleUpdateCompliance = (agreementId: string, status: ComplianceStatus) => {
    const agreementItem = agreements.find((a) => a.id === agreementId);
    if (agreementItem) {
      addLocalAction(agreementItem.caseId, `Acuerdo: ${status === 'cumplido' ? 'Cumplido' : status === 'en_proceso' ? 'En proceso' : 'Incumplido'}`);
    }
    setAgreements((current) => current.map((agreement) => agreement.id === agreementId ? { ...agreement, estado: status } : agreement));
    setLastAction(`Acuerdo actualizado a ${status === 'cumplido' ? 'Cumplido' : status === 'en_proceso' ? 'En proceso' : 'Incumplido'} (solo borrador local — sin persistencia en base de datos).`);
    toast(`Acuerdo actualizado a ${status === 'cumplido' ? 'Cumplido' : status === 'en_proceso' ? 'En proceso' : 'Incumplido'} (solo borrador local — sin persistencia en base de datos).`, { icon: "📝" });
  };

  const handleEscalate = (caseId: string) => {
    setSelectedCaseId(caseId);
    addLocalAction(caseId, "Escalar a Dirección");
    setLastAction("Escalar a Dirección: función en preparación. Sin persistencia en base de datos.");
    toast("Función en preparación — acción registrada solo localmente.", { icon: "ℹ️" });
  };

  const handleReturnToOrientacion = (caseId: string) => {
    setSelectedCaseId(caseId);
    addLocalAction(caseId, "Devolver a Orientación");
    setLastAction("Devolver a Orientación: función en preparación. Sin persistencia en base de datos.");
    toast("Función en preparación — acción registrada solo localmente.", { icon: "ℹ️" });
  };

  const handleSOS = async () => {
    await createEmergencyAlert("otros", {
      ubicacion: "Otro",
      aula: "Trabajo Social",
      grupo: currentUserProfile?.grupo_tutor || undefined,
      descripcion: "Alerta critica activada desde Dashboard de Trabajo Social.",
    });
    setLastAction("Alerta critica registrada en el flujo institucional de emergencias.");
  };

  return (
    <main className="min-h-screen flex-1 overflow-y-auto bg-slate-950 px-4 pb-10 text-white md:px-6 lg:px-8">
      <TrabajoSocialRoleHeader
        searchValue={search}
        activeCasesCount={cases.length}
        criticalAlertsCount={criticalAlerts}
        onSearchChange={setSearch}
        onOpenSasito={() => setSasitoOpen((current) => !current)}
        onSOS={handleSOS}
      />

      <div className="mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-5 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]">
        <div className="space-y-5">
          <CaseExecutionQueue
            cases={filteredCases}
            citatorios={citatorios}
            selectedCaseId={selectedCase?.id}
            canEdit={rolePermissions.can_edit}
            onSelectCase={setSelectedCaseId}
            onStartFollowUp={handleStartFollowUp}
            onRegisterContact={(caseId) => handleRegisterContact(caseId)}
          />
          <TrabajoSocialInsights
            cases={cases}
            citatorios={citatorios}
            contacts={contacts}
            agreements={agreements}
            sasitoOpen={sasitoOpen}
          />
        </div>

        <div className="space-y-5">
          <TrabajoSocialCaseDetail
            selectedCase={selectedCase}
            citatorios={citatorios}
            contacts={contacts}
            visits={visits}
            agreements={agreements}
            canEdit={rolePermissions.can_edit}
            canEscalate={rolePermissions.can_escalate}
            canViewSensitive={rolePermissions.can_view_sensitive}
            lastAction={lastAction}
            onRegisterContact={handleRegisterContact}
            onRegisterVisit={handleRegisterVisit}
            onEscalate={handleEscalate}
            onReturnToOrientacion={handleReturnToOrientacion}
          />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <CitatoriosTracker
              selectedCase={selectedCase}
              citatorios={citatorios}
              canEdit={rolePermissions.can_edit}
              onRegisterCitatorio={handleRegisterCitatorio}
              onMarkAttendance={handleMarkAttendance}
            />
            <ComplianceTracker
              selectedCase={selectedCase}
              agreements={agreements}
              canEdit={rolePermissions.can_edit}
              onUpdateCompliance={handleUpdateCompliance}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <FamilyContactLog
              selectedCase={selectedCase}
              contacts={contacts}
              canEdit={rolePermissions.can_edit}
              onRegisterContact={handleRegisterContact}
            />
            <HomeVisitLog
              selectedCase={selectedCase}
              visits={visits}
              canEdit={rolePermissions.can_edit}
              onRegisterVisit={handleRegisterVisit}
            />
          </div>
        </div>
      </div>
    </main>
  );
};
