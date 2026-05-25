import React, { useState } from "react";
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
    setLastAction("Seguimiento activo registrado localmente.");
  };

  const handleRegisterCitatorio = (caseId: string) => {
    const currentCount = citatorios.filter((citatorio) => citatorio.caseId === caseId).length;
    setCitatorios((current) => [...current, createCitatorio(caseId, currentCount)]);
    setCaseStatus(caseId, "alerta_sin_respuesta");
    setLastAction("Nuevo citatorio registrado.");
  };

  const handleMarkAttendance = (citatorioId: string) => {
    setCitatorios((current) => current.map((citatorio) => citatorio.id === citatorioId ? { ...citatorio, respuesta: "asistio" } : citatorio));
    setLastAction("Asistencia familiar marcada en citatorio.");
  };

  const handleRegisterContact = (caseId: string, tipo: ContactType = "llamada", resultado = "Contacto familiar rapido registrado.") => {
    setSelectedCaseId(caseId);
    setContacts((current) => [createContact(caseId, tipo, resultado), ...current]);
    setCaseStatus(caseId, "contacto_familiar");
    setLastAction("Contacto familiar registrado.");
  };

  const handleRegisterVisit = (caseId: string, observaciones: string) => {
    setSelectedCaseId(caseId);
    setVisits((current) => [createVisit(caseId, observaciones), ...current]);
    setCaseStatus(caseId, "visita_programada");
    setLastAction("Visita domiciliaria agregada a la bitacora local.");
  };

  const handleUpdateCompliance = (agreementId: string, status: ComplianceStatus) => {
    setAgreements((current) => current.map((agreement) => agreement.id === agreementId ? { ...agreement, estado: status } : agreement));
    setLastAction("Cumplimiento actualizado.");
  };

  const handleEscalate = (caseId: string) => {
    setSelectedCaseId(caseId);
    setLastAction("Caso escalado a Direccion para decision institucional.");
  };

  const handleReturnToOrientacion = (caseId: string) => {
    setSelectedCaseId(caseId);
    setLastAction("Caso devuelto a Orientacion para ajuste del plan de intervencion.");
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
