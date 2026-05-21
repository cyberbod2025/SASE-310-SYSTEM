import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useApp } from "../../store";
import { useAuth } from "../AuthProvider";
import { GlassCard } from "../ui/GlassCard";
import { OrientacionRoleHeader } from "../orientacion/OrientacionRoleHeader";
import { OrientacionInsights } from "../orientacion/OrientacionInsights";
import { OrientacionCaseInbox } from "../orientacion/OrientacionCaseInbox";
import { OrientacionCaseDetail } from "../orientacion/OrientacionCaseDetail";
import { StudentInstitutionalHistory } from "../orientacion/StudentInstitutionalHistory";
import { TeacherDiagnosisRequests } from "../orientacion/TeacherDiagnosisRequests";
import { InterventionPlanEditor } from "../orientacion/InterventionPlanEditor";
import { OrientacionFollowUpPanel } from "../orientacion/OrientacionFollowUpPanel";
import { OrientacionReportPreview } from "../orientacion/OrientacionReportPreview";
import {
  abrirCasoOrientacion,
  crearPlanIntervencion,
  derivarTrabajoSocial,
  escalarDireccion,
  loadDocentes,
  loadOrientacionCasos,
  loadStudentHistory,
  solicitarDiagnostico,
} from "../orientacion/orientacionApi";
import type {
  OrientacionCaseSummary,
  OrientacionDiagnosisRequest,
  OrientacionDocenteOption,
  OrientacionFollowUp,
  OrientacionHistoryItem,
  OrientacionPlan,
  OrientacionStudentSummary,
} from "../orientacion/orientacionTypes";
import { supabase } from "../../supabase/client";

type StudentSuggestion = OrientacionStudentSummary & { rawId: string };

export const DashboardOrientacion = () => {
  const { students } = useApp();
  const { user } = useAuth();
  const [cases, setCases] = useState<OrientacionCaseSummary[]>([]);
  const [docentes, setDocentes] = useState<OrientacionDocenteOption[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [history, setHistory] = useState<{
    summary: any | null;
    incidents: OrientacionHistoryItem[];
    citations: OrientacionHistoryItem[];
    contacts: OrientacionHistoryItem[];
    interventions: OrientacionHistoryItem[];
    teacherReports: OrientacionHistoryItem[];
    plans: OrientacionPlan[];
    requests: OrientacionDiagnosisRequest[];
    followUps: OrientacionFollowUp[];
  }>({
    summary: null,
    incidents: [],
    citations: [],
    contacts: [],
    interventions: [],
    teacherReports: [],
    plans: [],
    requests: [],
    followUps: [],
  });
  const [loading, setLoading] = useState(true);

  const suggestions: StudentSuggestion[] = students
    .filter((student) => student.caseState !== "CERRADO")
    .slice(0, 6)
    .map((student) => ({
      rawId: student.id,
      id: student.id,
      nombre: student.name,
      grupo: student.group ?? null,
      matricula: student.matricula ?? null,
      puntajeRiesgo: student.puntajeRiesgo ?? null,
      estadoSemaforo: student.estadoSemaforo ?? null,
    }));

  const selectedCase = cases.find((item) => item.id === selectedCaseId) ?? cases[0] ?? null;
  const activeCases = cases.filter((item) => item.estado !== "cerrado").length;
  const pendingRequests = history.requests.filter((item) => item.estado === "pendiente").length;
  const criticalCases = cases.filter((item) => item.prioridad === "critica" || item.estado === "escalado_direccion").length;

  useEffect(() => {
    const load = async () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("demo") === "1") {
        setCases([]);
        setDocentes([]);
        setSelectedCaseId(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [loadedCases, loadedDocentes] = await Promise.all([loadOrientacionCasos(), loadDocentes()]);
        setCases(loadedCases);
        setDocentes(loadedDocentes);
        setSelectedCaseId((current) => current ?? loadedCases[0]?.id ?? null);
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar los casos de Orientación");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      if (!selectedCase?.alumnoId) return;

      try {
        const data = await loadStudentHistory(selectedCase.alumnoId, selectedCase.id);
        setHistory(data);
      } catch (error) {
        console.error(error);
        toast.error("No se pudo cargar el historial del alumno");
      }
    };

    loadHistory();
  }, [selectedCase?.alumnoId, selectedCase?.id]);

  const refreshCases = async (caseIdToSelect?: string) => {
    const loadedCases = await loadOrientacionCasos();
    setCases(loadedCases);
    setSelectedCaseId(caseIdToSelect ?? loadedCases[0]?.id ?? null);
    return loadedCases;
  };

  const handleOpenStudentCase = async (studentId: string) => {
    const student = suggestions.find((item) => item.rawId === studentId);
    if (!student) return;

    try {
      const caseId = await abrirCasoOrientacion({
        alumnoId: student.rawId,
        motivo: `Seguimiento preventivo solicitado por Orientación para ${student.nombre}.`,
        resumen: `Semáforo: ${student.estadoSemaforo ?? "sin dato"}. Puntaje: ${student.puntajeRiesgo ?? 0}.`,
        prioridad: student.puntajeRiesgo && student.puntajeRiesgo >= 70 ? "alta" : "media",
      });
      await refreshCases(caseId);
      toast.success("Caso de Orientación abierto");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo abrir el caso");
    }
  };

  const handleRequestDiagnosis = async (docenteId: string, observaciones: string) => {
    if (!selectedCase) return;

    try {
      await solicitarDiagnostico({ docenteId, casoId: selectedCase.id, observaciones });
      await refreshCases(selectedCase.id);
      toast.success("Solicitud de diagnóstico enviada");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo enviar la solicitud");
    }
  };

  const handleCreatePlan = async (payload: { objetivo: string; acciones: string; responsable: string; fechaRevision: string }) => {
    if (!selectedCase) return;

    try {
      await crearPlanIntervencion({
        casoId: selectedCase.id,
        objetivo: payload.objetivo,
        acciones: payload.acciones,
        responsable: payload.responsable,
        fechaRevision: payload.fechaRevision || null,
      });
      await refreshCases(selectedCase.id);
      toast.success("Plan de intervención guardado");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo guardar el plan");
    }
  };

  const handleAddFollowUp = async (payload: { tipo: string; descripcion: string; evidenciaUrl: string }) => {
    if (!selectedCase) return;

    try {
      const { error } = await supabase.from("seguimiento_orientacion" as any).insert({
        caso_id: selectedCase.id,
        tipo: payload.tipo,
        descripcion: payload.descripcion,
        evidencia_url: payload.evidenciaUrl || null,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
      await refreshCases(selectedCase.id);
      toast.success("Seguimiento registrado");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo registrar el seguimiento");
    }
  };

  const handleQuickOpenCase = async () => {
    const student = suggestions[0];
    if (!student) {
      toast.error("No hay alumnos sugeridos");
      return;
    }
    await handleOpenStudentCase(student.rawId);
  };

  const handleDeriveSocialWork = async () => {
    if (!selectedCase) return;
    try {
      await derivarTrabajoSocial(selectedCase.id);
      await refreshCases(selectedCase.id);
      toast.success("Caso derivado a Trabajo Social");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo derivar el caso");
    }
  };

  const handleEscalateDirection = async () => {
    if (!selectedCase) return;
    try {
      await escalarDireccion(selectedCase.id);
      await refreshCases(selectedCase.id);
      toast.success("Caso escalado a Dirección");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo escalar el caso");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const studentLabel = selectedCase
    ? `${selectedCase.alumnoNombre} · ${selectedCase.grupo ?? "Sin grupo"}`
    : "Selecciona un caso para ver el historial";

  return (
    <main className="min-h-screen overflow-y-auto bg-slate-950 px-4 py-4 text-white md:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <OrientacionRoleHeader
          activeCases={activeCases}
          pendingRequests={pendingRequests}
          criticalCases={criticalCases}
          onNewCase={handleQuickOpenCase}
          onPrint={handlePrint}
        />

        <OrientacionInsights
          urgent={criticalCases}
          openRequests={pendingRequests}
          plans={history.plans.length}
          followUps={history.followUps.length}
        />

        {loading ? (
          <GlassCard className="border border-white/5 bg-slate-950/55">
            <div className="p-6 text-center text-slate-400">Cargando casos de Orientación...</div>
          </GlassCard>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <OrientacionCaseInbox
                cases={cases}
                students={suggestions}
                selectedCaseId={selectedCase?.id ?? null}
                onSelectCase={(caseId) => setSelectedCaseId(caseId)}
                onOpenStudentCase={handleOpenStudentCase}
              />
              <OrientacionCaseDetail
                selectedCase={selectedCase}
                requests={history.requests}
                plans={history.plans}
                followUps={history.followUps}
                onRequestDiagnosis={() => {
                  const nextDocente = docentes[0]?.id;
                  if (!nextDocente || !selectedCase) return toast.error("No hay docente disponible");
                  void handleRequestDiagnosis(nextDocente, `Solicitud institucional para ${selectedCase.alumnoNombre}.`);
                }}
                onDeriveSocialWork={handleDeriveSocialWork}
                onEscalateDirection={handleEscalateDirection}
              />
              <StudentInstitutionalHistory
                studentLabel={studentLabel}
                summary={history.summary}
                incidents={history.incidents}
                citations={history.citations}
                contacts={history.contacts}
                interventions={history.interventions}
                teacherReports={history.teacherReports}
              />
            </div>

            <div className="space-y-4">
              <TeacherDiagnosisRequests
                requests={history.requests}
                docentes={docentes}
                onRequest={handleRequestDiagnosis}
              />
              <InterventionPlanEditor plans={history.plans} onCreatePlan={handleCreatePlan} />
              <OrientacionFollowUpPanel followUps={history.followUps} onAddFollowUp={handleAddFollowUp} />
              <OrientacionReportPreview selectedCase={selectedCase} history={history} plans={history.plans} followUps={history.followUps} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
