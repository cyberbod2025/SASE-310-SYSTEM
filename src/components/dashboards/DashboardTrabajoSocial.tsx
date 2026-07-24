import React, { useEffect, useMemo, useState } from "react";
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
  persistCitatorio,
  persistCitatorioAttendance,
  persistAgreement,
  persistAgreementStatus,
  persistFamilyContact,
  persistHomeVisit,
  persistIntervention,
  loadSocialTracking,
} from "../trabajoSocial/trabajoSocialPersistence";
import {
  buildTrabajoSocialCases,
  CitatorioRecord,
  ComplianceAgreement,
  ComplianceStatus,
  ContactType,
  createCitatorio,
  createContact,
  FamilyContactRecord,
  hasThreeUnansweredCitatorios,
  HomeVisitRecord,
  SocialInterventionRecord,
  TrabajoSocialInterventionStatus,
} from "../trabajoSocial/trabajoSocialTypes";

export const DashboardTrabajoSocial = () => {
  const { students, createEmergencyAlert, currentUserProfile } = useApp();
  const rolePermissions = PERMISOS_POR_ROL.trabajo_social;
  const baseCases = useMemo(() => buildTrabajoSocialCases(students), [students]);
  const caseStudentIdsKey = [...new Set(
    baseCases.map((caseItem) => caseItem.student.id),
  )].sort().join("|");

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [sasitoOpen, setSasitoOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(baseCases[0]?.id || null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, TrabajoSocialInterventionStatus>>({});
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [citatorios, setCitatorios] = useState<CitatorioRecord[]>([]);
  const [contacts, setContacts] = useState<FamilyContactRecord[]>([]);
  const [visits, setVisits] = useState<HomeVisitRecord[]>([]);
  const [agreements, setAgreements] = useState<ComplianceAgreement[]>([]);
  const [interventions, setInterventions] = useState<SocialInterventionRecord[]>([]);

  useEffect(() => {
    let active = true;
    const studentIds = caseStudentIdsKey
      ? caseStudentIdsKey.split("|")
      : [];

    loadSocialTracking(studentIds)
      .then((tracking) => {
        if (!active) return;
        setCitatorios(tracking.citatorios);
        setContacts(tracking.contacts);
        setVisits(tracking.visits);
        setAgreements(tracking.agreements);
        setInterventions(tracking.interventions);
      })
      .catch((error) => {
        console.error("No se pudo cargar el seguimiento social persistente", error);
        if (active) toast.error("No se pudo cargar la memoria institucional de Trabajo Social.");
      });

    return () => {
      active = false;
    };
  }, [caseStudentIdsKey]);

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

  const handleStartFollowUp = async (caseId: string) => {
    let intervention: SocialInterventionRecord;
    try {
      intervention = await persistIntervention({
        studentId: caseId,
        reason: "Inicio de seguimiento de Trabajo Social",
        result: "seguimiento",
        notes: "Seguimiento iniciado desde la cola operativa.",
      });
    } catch (error) {
      console.error("No se pudo persistir el inicio de seguimiento", error);
      toast.error("No se pudo guardar el inicio del seguimiento.");
      return;
    }
    setSelectedCaseId(caseId);
    setInterventions((current) => [intervention, ...current]);
    setCaseStatus(caseId, "seguimiento");
    setLastAction("Seguimiento iniciado y guardado en el expediente institucional.");
    toast.success("Seguimiento iniciado y guardado.", { icon: "🚀" });
  };

  const handleRegisterCitatorio = async (caseId: string) => {
    const currentCount = citatorios.filter((citatorio) => citatorio.caseId === caseId).length;
    let persistedId: string;
    try {
      persistedId = await persistCitatorio({
        studentId: caseId,
        date: new Date().toISOString().slice(0, 10),
        reason: `Citatorio de seguimiento familiar número ${currentCount + 1}.`,
      });
    } catch (error) {
      console.error("No se pudo persistir el citatorio", error);
      toast.error("No se pudo guardar el citatorio.");
      return;
    }
    setCitatorios((current) => [...current, { ...createCitatorio(caseId, currentCount), id: persistedId }]);
    setCaseStatus(caseId, "alerta_sin_respuesta");
    setLastAction("Nuevo citatorio registrado y guardado en el expediente institucional.");
    toast.success("Citatorio agendado y guardado.", { icon: "📅" });
  };

  const handleMarkAttendance = async (citatorioId: string) => {
    try {
      await persistCitatorioAttendance(citatorioId);
    } catch (error) {
      console.error("No se pudo persistir la asistencia del citatorio", error);
      toast.error("No se pudo guardar la asistencia.");
      return;
    }
    setCitatorios((current) => current.map((citatorio) => citatorio.id === citatorioId ? { ...citatorio, respuesta: "asistio" } : citatorio));
    setLastAction("Asistencia familiar marcada y guardada.");
    toast.success("Asistencia marcada y guardada.", { icon: "✅" });
  };

  const handleRegisterContact = async (caseId: string, tipo: ContactType = "llamada", resultado = "Contacto familiar rapido registrado.") => {
    try {
      await persistFamilyContact({ studentId: caseId, method: tipo, outcome: resultado });
    } catch (error) {
      console.error("No se pudo persistir el contacto familiar", error);
      toast.error("No se pudo guardar el contacto familiar.");
      return false;
    }
    setSelectedCaseId(caseId);
    setContacts((current) => [createContact(caseId, tipo, resultado), ...current]);
    setCaseStatus(caseId, "contacto_familiar");
    setLastAction("Contacto familiar registrado y guardado.");
    toast.success("Contacto registrado y guardado.", { icon: "📞" });
    return true;
  };

  const handleRegisterVisit = async (caseId: string, observaciones: string) => {
    let visit: HomeVisitRecord;
    try {
      visit = await persistHomeVisit({ studentId: caseId, observations: observaciones });
    } catch (error) {
      console.error("No se pudo persistir la visita domiciliaria", error);
      toast.error("No se pudo guardar la visita domiciliaria.");
      return false;
    }
    setSelectedCaseId(caseId);
    setVisits((current) => [visit, ...current]);
    setCaseStatus(caseId, "visita_programada");
    setLastAction("Visita domiciliaria guardada en la memoria institucional.");
    toast.success("Visita registrada y guardada.", { icon: "🏠" });
    return true;
  };

  const handleCreateAgreement = async (caseId: string, agreement: string, responsible: string) => {
    let persistedAgreement: ComplianceAgreement;
    try {
      persistedAgreement = await persistAgreement({
        studentId: caseId,
        agreement,
        responsible,
      });
    } catch (error) {
      console.error("No se pudo persistir el acuerdo", error);
      toast.error("No se pudo guardar el acuerdo.");
      return false;
    }
    setAgreements((current) => [persistedAgreement, ...current]);
    setCaseStatus(caseId, "acuerdos_en_proceso");
    setLastAction("Acuerdo guardado en la memoria institucional.");
    toast.success("Acuerdo registrado y guardado.", { icon: "🤝" });
    return true;
  };

  const handleUpdateCompliance = async (agreementId: string, status: ComplianceStatus) => {
    try {
      await persistAgreementStatus(agreementId, status);
    } catch (error) {
      console.error("No se pudo persistir el estado del acuerdo", error);
      toast.error("No se pudo actualizar el acuerdo.");
      return;
    }
    setAgreements((current) => current.map((agreement) => agreement.id === agreementId ? { ...agreement, estado: status } : agreement));
    setLastAction(`Cumplimiento actualizado a ${status === 'cumplido' ? 'Cumplido' : status === 'en_proceso' ? 'En proceso' : 'Incumplido'} y guardado.`);
    toast.success(`Acuerdo actualizado a ${status === 'cumplido' ? 'Cumplido' : status === 'en_proceso' ? 'En proceso' : 'Incumplido'}.`, { icon: "📝" });
  };

  const handleEscalate = async (caseId: string) => {
    let intervention: SocialInterventionRecord;
    try {
      intervention = await persistIntervention({ studentId: caseId, reason: "Escalamiento a Dirección", result: "escalado" });
    } catch (error) {
      console.error("No se pudo persistir el escalamiento", error);
      toast.error("No se pudo guardar el escalamiento.");
      return;
    }
    setSelectedCaseId(caseId);
    setInterventions((current) => [intervention, ...current]);
    setLastAction("Escalamiento registrado para revisión de Dirección.");
    toast.success("Escalamiento registrado.", { icon: "gavel" });
  };

  const handleReturnToOrientacion = async (caseId: string) => {
    let intervention: SocialInterventionRecord;
    try {
      intervention = await persistIntervention({ studentId: caseId, reason: "Devolución a Orientación", result: "devuelto" });
    } catch (error) {
      console.error("No se pudo persistir la devolución a Orientación", error);
      toast.error("No se pudo guardar la devolución a Orientación.");
      return;
    }
    setSelectedCaseId(caseId);
    setInterventions((current) => [intervention, ...current]);
    setLastAction("Solicitud de devolución a Orientación registrada.");
    toast.success("Solicitud de devolución registrada.", { icon: "assignment_return" });
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
            interventions={interventions}
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
              onCreateAgreement={handleCreateAgreement}
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
