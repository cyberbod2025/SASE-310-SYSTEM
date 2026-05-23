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
  const [showDeriveConfirm, setShowDeriveConfirm] = useState(false);
  const [showEscalateConfirm, setShowEscalateConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setShowDeriveConfirm(true);
  };

  const confirmDeriveSocialWork = async () => {
    if (!selectedCase) return;
    setIsSubmitting(true);
    try {
      await derivarTrabajoSocial(selectedCase.id);
      await refreshCases(selectedCase.id);
      toast.success("Caso derivado a Trabajo Social");
      setShowDeriveConfirm(false);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo derivar el caso");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscalateDirection = async () => {
    if (!selectedCase) return;
    setShowEscalateConfirm(true);
  };

  const confirmEscalateDirection = async () => {
    if (!selectedCase) return;
    setIsSubmitting(true);
    try {
      await escalarDireccion(selectedCase.id);
      await refreshCases(selectedCase.id);
      toast.success("Caso escalado a Dirección");
      setShowEscalateConfirm(false);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo escalar el caso");
    } finally {
      setIsSubmitting(false);
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
    {showDeriveConfirm && selectedCase && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-md rounded-[2rem] border border-indigo-500/20 bg-slate-950 p-6 shadow-2xl animate-scale-in">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-500 text-white">
              <span className="material-symbols-outlined text-2xl font-black">family_restroom</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-indigo-300">Derivación Especializada</p>
              <h3 className="text-lg font-black text-white">Derivar a Trabajo Social</h3>
            </div>
          </div>
          <p className="mt-4 text-xs leading-6 text-slate-300 font-medium">
            ¿Confirmas la derivación del caso de <strong className="text-white font-black">{selectedCase.alumnoNombre}</strong> al área de Trabajo Social?
          </p>
          <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-950/20 border border-indigo-500/20 p-3 rounded-xl leading-relaxed">
            ⚠️ Esta acción programará una visita domiciliaria y una investigación familiar para verificar el contexto sociofamiliar del alumno.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setShowDeriveConfirm(false)}
              disabled={isSubmitting}
              className="flex-1 min-h-[44px] rounded-xl border border-white/10 bg-white/[0.05] text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/[0.1] transition active:scale-95 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmDeriveSocialWork}
              disabled={isSubmitting}
              className="flex-1 min-h-[44px] rounded-xl bg-indigo-500 text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-400 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-icons animate-spin text-[14px]">progress_activity</span>
                  <span>Procesando...</span>
                </>
              ) : (
                "Confirmar"
              )}
            </button>
          </div>
        </div>
      </div>
    )}

    {showEscalateConfirm && selectedCase && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-md rounded-[2rem] border border-rose-500/20 bg-slate-950 p-6 shadow-2xl animate-scale-in">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-500 text-white">
              <span className="material-symbols-outlined text-2xl font-black">gavel</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-rose-300">Medida de Acompañamiento</p>
              <h3 className="text-lg font-black text-white">Escalar a Dirección</h3>
            </div>
          </div>
          <p className="mt-4 text-xs leading-6 text-slate-300 font-medium">
            ¿Confirmas el escalamiento del caso del alumno <strong className="text-white font-black">{selectedCase.alumnoNombre}</strong> a la Dirección escolar?
          </p>
          <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-950/20 border border-rose-500/20 p-3 rounded-xl leading-relaxed">
            ⚠️ Esta acción transferirá la custodia formal del caso a la Dirección General para establecer sanciones o medidas institucionales permanentes.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setShowEscalateConfirm(false)}
              disabled={isSubmitting}
              className="flex-1 min-h-[44px] rounded-xl border border-white/10 bg-white/[0.05] text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/[0.1] transition active:scale-95 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmEscalateDirection}
              disabled={isSubmitting}
              className="flex-1 min-h-[44px] rounded-xl bg-rose-500 text-[10px] font-black uppercase tracking-widest text-white hover:bg-rose-400 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-icons animate-spin text-[14px]">progress_activity</span>
                  <span>Procesando...</span>
                </>
              ) : (
                "Confirmar"
              )}
            </button>
          </div>
        </div>
      </div>
    )}
    </main>
  );
};

