import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../store";
import { UserRole, AppModule, IncidentType, CaseState } from "../../types";
import toast from "react-hot-toast";
import { useAuth } from "../AuthProvider";
import { startProductTour } from "../TourGuide";
import { StudentAdvancedPanel } from "../StudentAdvancedPanel";
import { TestGlowCard } from "../TestGlowCard";
import { GlassCard } from "../ui/GlassCard";
import { useEcosystemModules } from "../../hooks/useEcosystemModules";

export const DashboardDocente = () => {
  const {
    students,
    currentUserRole,
    setCurrentModule,
    addIncident,
    registerAttendance,
    userCreatedAt,
  } = useApp();

  // Filter alerts for relevant notifications (demo logic: last 5 incidents)
  const teacherAlerts = useMemo(() => {
    return students
      .filter((s) => s.caseState !== CaseState.CERRADO)
      .slice(0, 5);
  }, [students]);
  const { ecosystemModules } = useEcosystemModules();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "GENERAL" | "ASISTENCIA" | "CALIFICACIONES"
  >("GENERAL");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Multi-select state
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(
    new Set(),
  );
  const [isQuickReportOpen, setIsQuickReportOpen] = useState(false);

  // Attendance state
  const [attendanceState, setAttendanceState] = useState<
    Record<string, "P" | "R" | "F">
  >({});

  const medirKPIProductividad = (tipoAccion: string) => {
    const kpiRegistrado = localStorage.getItem(`kpi_primer_${tipoAccion}`);
    if (!kpiRegistrado && userCreatedAt) {
      const diffTime = Math.abs(
        new Date().getTime() - new Date(userCreatedAt).getTime(),
      );
      const diasTardados = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      console.log(
        `[KPI LOG] Tiempo a Productividad (${tipoAccion}): ${diasTardados} dias`,
      );

      localStorage.setItem(`kpi_primer_${tipoAccion}`, "true");
    }
  };

  // --- FILTROS DE VISTA ---
  const myStudents = students;

  const toggleStudentSelection = (id: string) => {
    const newSet = new Set(selectedStudentIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedStudentIds(newSet);
  };

  const handleBulkReport = (type: IncidentType, description: string) => {
    selectedStudentIds.forEach((id) => {
      addIncident(id, type, description);
    });
    import("../../utils/sound").then((s) => s.playSuccessSound());
    medirKPIProductividad("reporte_grupal");
    toast.success(`Reporte creado para ${selectedStudentIds.size} alumnos`);
    setIsQuickReportOpen(false);
    setSelectedStudentIds(new Set());
  };

  // Pre-defined quick comments
  const quickComments = [
    { label: "No trajo tarea", type: IncidentType.ACADEMICO },
    { label: "Falta de uniforme", type: IncidentType.UNIFORME },
    { label: "Indisciplina leve", type: IncidentType.CONDUCTA },
    { label: "Uso de celular", type: IncidentType.CONDUCTA },
    { label: "Sin material", type: IncidentType.ACADEMICO },
  ];

  const commandTabs = [
    {
      id: "GENERAL",
      label: "Vista General",
      icon: "dashboard",
      color: "text-sase-info",
    },
    {
      id: "ASISTENCIA",
      label: "Pase de Lista",
      icon: "fact_check",
      color: "text-sase-clinical",
    },
    {
      id: "CALIFICACIONES",
      label: "Evaluacion",
      icon: "history_edu",
      color: "text-sase-warning",
    },
    {
      id: "TOUR",
      label: "Induccion",
      icon: "auto_awesome",
      color: "text-sase-info",
      action: () => startProductTour(),
    },
  ];

  const ecosystemQuickActions = ecosystemModules;

  const handleAttendanceChange = (
    studentId: string,
    status: "P" | "R" | "F",
  ) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const saveAttendance = async () => {
    const studentsToRegister = Object.entries(attendanceState);
    if (studentsToRegister.length === 0) {
      toast.error("No hay cambios en la asistencia para guardar");
      return;
    }

    try {
      const promise = Promise.all(
        studentsToRegister.map(([id, status]) => {
          const mappedStatus =
            status === "P" ? "presente" : status === "R" ? "retardo" : "falta";
          return registerAttendance(id, mappedStatus as any);
        }),
      );

      medirKPIProductividad("pase_lista");
      toast.promise(promise, {
        loading: "Registrando asistencia...",
        success: "Asistencia guardada correctamente",
        error: "Error al guardar algunos registros",
      });

      setAttendanceState({}); // Clear local changes after success
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <GlassCard className="flex-1 min-h-full p-4 lg:p-8 bg-[rgba(121,118,124,0.08)] relative overflow-hidden custom-scrollbar pb-32">
      <div className="max-w-[420px] w-full mb-6">
        <TestGlowCard />
      </div>
      {/* Background SASE Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.02] z-0">
        <h1 className="text-[25vw] font-black italic tracking-tighter text-white">
          SASE
        </h1>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Institutional Branding Header - REFINED HARMONY */}
        <div className="w-full flex justify-between items-start mb-8 opacity-40 px-4">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[10px] font-semibold text-sase-info tracking-[0.4em] uppercase">
              SEP // ESD_310
            </span>
            <span className="text-[8px] font-semibold text-[var(--sase-text-muted)] uppercase tracking-[0.2em] italic">
              "PRESIDENTES DE MÉXICO"
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-white tracking-[0.3em] uppercase opacity-60">
              CENTRAL_UNIT
            </span>
            <div className="h-px w-8 bg-sase-info/30 mt-1 ml-auto"></div>
          </div>
        </div>

        {/* ORB LAYOUT WRAPPER - Fixes mobile overlapping by reserving space */}
        <div
          id="docente-tabs"
          className="relative flex items-center justify-center w-full min-h-[320px] md:min-h-[380px] mb-8"
        >
          {/* Central IA Identity Nucleus */}
          <div className="relative z-20 text-center flex flex-col items-center group">
            <div className="size-32 md:size-44 bg-sase-info/10 rounded-full blur-3xl absolute animate-pulse"></div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="size-20 md:size-28 flex items-center justify-center relative overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-sase-info/5 rounded-full blur-xl animate-pulse"></div>

              {/* Inner scanning ring */}
              <div className="absolute inset-2 border border-sase-info/10 rounded-full animate-spin-slow opacity-20"></div>
            </motion.div>

            {/* Central Identity Text - MOVED BELOW ORB FOR CLARITY */}
            <div className="relative mt-4 flex flex-col items-center justify-center">
                <span className="text-[7px] font-semibold text-sase-info tracking-[0.3em] leading-none mb-1 opacity-50 uppercase">
                NUCLEO IA OPERATIVO
              </span>
              <span className="text-lg font-black text-slate-200 italic tracking-tighter leading-none pulse-glow">
                SASE-310
              </span>
            </div>

            <div className="mt-6" id="docente-dashboard-title">
              <h2 className="text-xl md:text-2xl font-black text-slate-200 italic tracking-tighter uppercase leading-none mb-1">
                CENTRO <span className="text-sase-info">DE MANDO</span>
              </h2>
              <div className="flex items-center gap-2 justify-center opacity-30">
                <span className="h-px w-4 bg-white/20"></span>
                <span className="text-[7px] font-black text-[var(--sase-text-muted)] uppercase tracking-[0.3em] italic leading-tight">
                  CENTRO DE MANDO DOCENTE
                </span>
                <span className="h-px w-4 bg-white/20"></span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {commandTabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                    <button
                      key={tab.id}
                      onClick={tab.action || (() => setActiveTab(tab.id as any))}
                      className={`px-4 py-2 rounded-full border text-[9px] font-semibold uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                        isActive
                          ? "bg-[rgba(121,118,124,0.16)] border-[var(--sase-border-ghost)] text-white shadow-[0_0_20px_rgba(129,106,184,0.18)]"
                          : "bg-[var(--sase-surface-low)] border-[var(--sase-border-ghost)] text-[var(--sase-text-muted)] hover:text-white hover:border-[rgba(227,221,236,0.18)]"
                      }`}
                    >
                    <span
                      className={`material-icons text-sm ${tab.color}`}
                    >
                      {tab.icon}
                    </span>
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}

      {/* VISTA GENERAL */}
      {activeTab === "GENERAL" && (
        <div className="grid grid-cols-12 gap-8">
          {/* Directorio de Estudiantes (Columna Principal) */}
          <div className="col-span-12 xl:col-span-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-black text-slate-300 uppercase tracking-[0.2em] italic">
                  MI_GRUPO
                </h2>
                {selectedStudentIds.size > 0 && (
                  <span className="bg-sase-info text-white px-3 py-1 rounded-full text-[10px] font-black animate-fade-in">
                    {selectedStudentIds.size} SELECCIONADOS
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {selectedStudentIds.size > 0 ? (
                  <button
                    onClick={() => {
                      import("../../utils/sound").then((s) =>
                        s.playAlertSound(),
                      );
                      setIsQuickReportOpen(true);
                    }}
                    title="Realizar un reporte masivo de incidencias para los alumnos seleccionados"
                    className="bg-sase-danger hover:bg-sase-danger text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 shadow-xl shadow-black/5 shadow-sase-danger/20 transition-all active:scale-95"
                  >
                    <span className="material-icons text-sm">
                      campaign
                    </span>
                    REPORTAR ({selectedStudentIds.size})
                  </button>
                ) : (
                  <input
                    type="text"
                    placeholder="Escriba nombre o matrícula..."
                    title="Filtrar por nombre o matrícula del alumno"
                    className="bg-[var(--sase-surface-low)] border border-[var(--sase-border-ghost)] rounded-xl px-4 py-3 text-[10px] font-semibold outline-none focus:border-sase-info/40 focus:bg-[rgba(121,118,124,0.12)] w-64 text-white placeholder-[var(--sase-text-muted)] uppercase tracking-widest transition-all"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myStudents.map((student) => {
                const isSelected = selectedStudentIds.has(student.id);
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={student.id}
                    className={`
                      card-sase transition-all hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden cursor-pointer
                      ${isSelected ? "ring-2 ring-sase-info border-sase-info/30 bg-sase-info/[0.05]" : "border-[var(--sase-border-ghost)]"}
                      ${student.caseState === CaseState.PATRON_DETECTADO ? "border-sase-warning/20" : ""}
                    `}
                  >
                    {/* Checkbox Overlay for Selection */}
                    <div className="absolute top-3 right-3 z-20">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStudentSelection(student.id);
                        }}
                        title={
                          isSelected
                            ? "Quitar selección"
                            : "Seleccionar alumno para reporte masivo"
                        }
                        className={`size-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${isSelected ? "bg-sase-info border-sase-info" : "border-white/20 bg-[var(--sase-surface-low)] hover:border-sase-info/50"}`}
                      >
                        {isSelected && (
                          <span className="material-icons text-white text-sm font-bold">
                            check
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Indicator Strip */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl ${
                        student.caseState === CaseState.PATRON_DETECTADO
                          ? "bg-sase-warning"
                          : student.caseState === CaseState.INTERVENCION
                            ? "bg-sase-danger"
                            : "bg-transparent"
                      }`}
                    ></div>

                    <div
                      className="flex items-center gap-4"
                      onClick={() => setSelectedStudent(student)}
                      title={`Ver detalles completos de ${student.name}`}
                    >
                      <div className="size-12 rounded-xl overflow-hidden border border-[var(--sase-border-ghost)] group-hover:border-sase-info/30 transition-colors">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-300 uppercase tracking-tight group-hover:text-sase-info transition-colors">
                          {student.name}
                        </h3>
                        <p className="text-[9px] font-black text-[var(--sase-text-muted)] uppercase tracking-widest mt-0.5 font-mono">
                          {student.matricula}
                        </p>
                      </div>
                    </div>

                    {student.bapInfo?.hasBAP && (
                      <div className="mt-3 flex items-center gap-1.5">
                        <span className="material-icons text-sase-info text-[14px] animate-pulse">
                          inclusive
                        </span>
                        <p className="text-[9px] font-black text-sase-info uppercase tracking-tighter">
                          Ajuste Razonable Activo
                        </p>
                      </div>
                    )}

                    {student.caseState !== CaseState.CERRADO && (
                      <div className="mt-3 pt-3 border-t border-[var(--sase-border-ghost)] flex items-center gap-2">
                        <span className="size-1.5 bg-sase-warning rounded-full animate-ping"></span>
                        <p className="text-[9px] font-black text-sase-warning uppercase tracking-widest">
                          SEGUIMIENTO_ACTIVO
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Derecho */}
          <div className="col-span-12 xl:col-span-4 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="card-sase p-4 flex flex-col items-center text-center group cursor-pointer hover:border-sase-info/20 hover:bg-white/[0.04] transition-all relative overflow-hidden"
              >
                <motion.div
                  animate={{ top: ["-10%", "110%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-sase-info/20 to-transparent pointer-events-none z-0"
                />
                <div className="p-2.5 rounded-xl bg-sase-info/10 border border-sase-info/20 text-sase-info mb-3 relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <span className="material-icons">groups</span>
                </div>
                <h3 className="text-3xl font-black text-slate-200 tracking-tighter italic font-mono tabular-nums relative z-10 drop-shadow-xl shadow-black/5">
                  {students.length}
                </h3>
                        <p className="text-[8px] font-black text-[var(--sase-text-muted)] uppercase tracking-widest mt-1 relative z-10 transition-colors">
                  TOTAL
                </p>
                <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[var(--sase-border-ghost)] opacity-20 group-hover:opacity-100 transition-opacity"></div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="card-sase p-4 flex flex-col items-center text-center group cursor-pointer hover:border-sase-clinical/20 hover:bg-white/[0.04] transition-all relative overflow-hidden"
              >
                <motion.div
                  animate={{ top: ["-10%", "110%"] }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-sase-clinical/20 to-transparent pointer-events-none z-0"
                />
                <div className="p-2.5 rounded-xl bg-sase-clinical/10 border border-sase-clinical/20 text-sase-clinical mb-3 relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <span className="material-icons">
                    assignment_turned_in
                  </span>
                </div>
                <h3 className="text-3xl font-black text-slate-200 tracking-tighter italic font-mono tabular-nums relative z-10 drop-shadow-xl shadow-black/5">
                  98%
                </h3>
                <p className="text-[8px] font-black text-[var(--sase-text-muted)] uppercase tracking-widest mt-1 relative z-10 transition-colors">
                  ASIST.
                </p>
                <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[var(--sase-border-ghost)] opacity-20 group-hover:opacity-100 transition-opacity"></div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                id="risk-semaphore"
                className="card-sase p-4 flex flex-col items-center text-center group cursor-pointer hover:border-sase-warning/20 hover:bg-white/[0.04] transition-all relative overflow-hidden"
              >
                <motion.div
                  animate={{ top: ["-10%", "110%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-sase-warning/20 to-transparent pointer-events-none z-0"
                />
                <div className="p-2.5 rounded-xl bg-sase-warning/10 border border-sase-warning/20 text-sase-warning mb-3 relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <span className="material-icons">
                    notification_important
                  </span>
                </div>
                <h3 className="text-3xl font-black text-slate-200 tracking-tighter italic font-mono tabular-nums relative z-10 drop-shadow-xl shadow-black/5">
                  3
                </h3>
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1 relative z-10 group-hover:text-slate-600 transition-colors">
                  PEND.
                </p>
                <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[var(--sase-border-ghost)] opacity-20 group-hover:opacity-100 transition-opacity"></div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="card-sase p-4 flex flex-col items-center text-center group cursor-pointer hover:border-sase-info/20 hover:bg-white/[0.04] transition-all relative overflow-hidden"
              >
                <motion.div
                  animate={{ top: ["-10%", "110%"] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-sase-info/20 to-transparent pointer-events-none z-0"
                />
                <div className="p-2.5 rounded-xl bg-sase-info/10 border border-sase-info/20 text-sase-info mb-3 relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <span className="material-icons">
                    auto_awesome
                  </span>
                </div>
                <h3 className="text-3xl font-black text-slate-200 tracking-tighter italic font-mono tabular-nums relative z-10 drop-shadow-xl shadow-black/5">
                  {students.reduce(
                    (acc, s) => acc + (s.gamificacion?.total_puntos || 0),
                    0,
                  )}
                </h3>
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1 relative z-10 group-hover:text-slate-600 transition-colors">
                  GAMIFIC.
                </p>
                <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[var(--sase-border-ghost)] opacity-20 group-hover:opacity-100 transition-opacity"></div>
              </motion.div>
            </div>

            {/* Acciones Rápidas */}
            <div className="card-sase p-6 border-[var(--sase-border-ghost)] relative overflow-hidden group/qa">
              {/* Scanning Line */}
              <motion.div
                animate={{ top: ["-10%", "110%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-sase-info/20 to-transparent pointer-events-none z-0"
              />
              <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[var(--sase-border-ghost)] opacity-20 group-hover/qa:opacity-100 transition-opacity"></div>
              <h3 className="text-[10px] font-semibold text-[var(--sase-text-muted)] uppercase tracking-[0.2em] mb-4 italic relative z-10">
                ACCIONES_RÁPIDAS
              </h3>
              <div className="space-y-3">
                {ecosystemQuickActions.map((module, index) => (
                  <React.Fragment key={module.key}>
                    <button
                      onClick={() => setCurrentModule(module.appModule)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl border border-sase-info/30 bg-sase-info/5 hover:bg-sase-info/10 hover:border-sase-info/50 transition-all group text-left relative overflow-hidden"
                    >
                      <div className="p-2 bg-sase-info/20 border border-sase-info/30 text-sase-info rounded-xl group-hover:bg-sase-info group-hover:text-white transition-all">
                        <span className="material-icons text-xl">{module.icon}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-tight">
                          {module.name}
                        </p>
                        <p className="text-[9px] text-sase-info font-black uppercase tracking-widest">
                          {module.launchSubtitle}
                        </p>
                      </div>
                    </button>

                    {index < ecosystemQuickActions.length - 1 && (
                      <div className="h-px bg-white/5"></div>
                    )}
                  </React.Fragment>
                ))}

                {ecosystemQuickActions.length > 0 && (
                  <div className="h-px bg-white/5"></div>
                )}

                <button
                  onClick={() => setCurrentModule(AppModule.AGENDA)}
                  title="Acceder al calendario institucional para agendar actividades"
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-[var(--sase-border-ghost)] hover:bg-[rgba(121,118,124,0.1)] hover:border-sase-info/20 transition-all group text-left"
                >
                  <div className="p-2 bg-sase-info/10 border border-sase-info/20 text-sase-info rounded-xl group-hover:bg-sase-info group-hover:text-white group-hover:border-sase-info transition-all">
                    <span className="material-icons text-xl">
                      calendar_month
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-tight">
                      Agendar Actividad
                    </p>
                      <p className="text-[9px] text-[var(--sase-text-muted)] font-black uppercase tracking-widest">
                      Exámenes, tareas, reuniones
                    </p>
                  </div>
                </button>

                <div className="h-px bg-white/5"></div>

                <button
                  onClick={signOut}
                  title="Finalizar sesión y salir del sistema SASE"
                  className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-sase-danger/60 hover:bg-sase-danger/10 hover:text-sase-danger transition-all border border-transparent hover:border-sase-danger/20 rounded-xl"
                >
                  <span className="material-icons text-sm">
                    logout
                  </span>
                  CERRAR_SESIÓN
                </button>
              </div>
            </div>

            {/* Alerts Feed */}
            <div className="card-sase flex flex-col max-h-[400px] p-0 border-[var(--sase-border-ghost)] overflow-hidden relative">
              {/* Scanning Line */}
              <motion.div
                animate={{ top: ["-10%", "110%"] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-sase-danger/20 to-transparent pointer-events-none z-10"
              />
              <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[var(--sase-border-ghost)] opacity-20"></div>
              <div className="p-5 border-b border-[var(--sase-border-ghost)] bg-[rgba(121,118,124,0.06)] flex justify-between items-center">
                <h3 className="text-[10px] font-black text-sase-danger uppercase tracking-[0.2em] italic flex items-center gap-2">
                  <span className="size-1.5 bg-sase-danger rounded-full animate-ping"></span>
                  BITÁCORA_ALERTAS
                </h3>
                <span className="bg-sase-danger/10 text-sase-danger text-[9px] font-black px-2.5 py-1 rounded border border-sase-danger/20 uppercase tracking-widest">
                  {teacherAlerts.length} NUEVOS
                </span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {teacherAlerts.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    onClick={() => setSelectedStudent(s)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[9px] font-mono font-black bg-[rgba(121,118,124,0.08)] text-[var(--sase-text-muted)] px-1.5 py-0.5 rounded group-hover:bg-sase-info/10 group-hover:text-sase-info transition-colors">
                        {s.matricula}
                      </span>
                      <span className="text-[9px] text-[var(--sase-text-muted)] font-black uppercase tracking-widest">
                        Hace 15 min
                      </span>
                    </div>
                    <p className="text-xs font-black text-white uppercase tracking-tight mt-1">
                      {s.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="material-icons text-sase-warning text-sm">
                        warning
                      </span>
                        <p className="text-[10px] text-[var(--sase-text-muted)] truncate font-black uppercase">
                        {s.incidents[0]?.description || "Seguimiento requerido"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LISTA DE ALUMNOS */}
            <div className="card-sase overflow-hidden flex flex-col p-0 border-[var(--sase-border-ghost)]">
              <div className="p-5 border-b border-[var(--sase-border-ghost)] bg-[rgba(121,118,124,0.06)] flex justify-between items-center">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic flex items-center gap-2">
                  <span className="material-icons text-sase-info text-lg">
                    group
                  </span>
                  LISTADO_GRUPO
                </h3>
                <div className="flex gap-2">
                  <button
                    title="Filtrar listado de alumnos"
                    className="p-2 rounded-2xl hover:bg-[rgba(121,118,124,0.08)] text-[var(--sase-text-muted)] hover:text-white transition-colors"
                  >
                    <span className="material-icons text-lg">
                      filter_list
                    </span>
                  </button>
                  <button
                    title="Buscar alumno en el grupo"
                    className="p-2 rounded-2xl hover:bg-[rgba(121,118,124,0.08)] text-[var(--sase-text-muted)] hover:text-white transition-colors"
                  >
                    <span className="material-icons text-lg">
                      search
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[500px]">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-[rgba(22,20,27,0.88)] backdrop-blur-sm border-b border-[var(--sase-border-ghost)]">
                    <tr>
                      <th className="p-4 text-[9px] font-black uppercase tracking-widest text-[var(--sase-text-muted)]">
                        Alumno
                      </th>
                      <th className="p-4 text-[9px] font-black uppercase tracking-widest text-[var(--sase-text-muted)] text-center">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {myStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-2xl bg-[var(--sase-surface-low)] border border-[var(--sase-border-ghost)] overflow-hidden">
                              <img
                                src={student.avatar}
                                alt={student.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-xs font-black text-white uppercase tracking-tight">
                              {student.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          {student.caseState === CaseState.PATRON_DETECTADO && (
                            <span className="bg-sase-warning/10 text-sase-warning text-[9px] font-black px-2.5 py-1 rounded border border-sase-warning/20 uppercase tracking-widest">
                              Atención
                            </span>
                          )}
                          {student.caseState === CaseState.INTERVENCION && (
                            <span className="bg-sase-danger/10 text-sase-danger text-[9px] font-black px-2.5 py-1 rounded border border-sase-danger/20 uppercase tracking-widest">
                              Intervención
                            </span>
                          )}
                          {student.caseState === CaseState.CERRADO ? (
                            <span className="bg-sase-clinical/10 text-sase-clinical text-[9px] font-black px-2.5 py-1 rounded border border-sase-clinical/20 uppercase tracking-widest">
                              Normal
                            </span>
                          ) : (
                            student.caseState !== CaseState.PATRON_DETECTADO &&
                            student.caseState !== CaseState.INTERVENCION && (
                              <span className="bg-sase-info/10 text-sase-info text-[9px] font-black px-2.5 py-1 rounded border border-sase-info/20 uppercase tracking-widest">
                                Observación
                              </span>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE ALUMNO */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="card-sase w-full max-w-2xl border-[var(--sase-border-ghost)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sase-info via-sase-info to-sase-info"></div>
              <button
                onClick={() => setSelectedStudent(null)}
                title="Cerrar ventana de detalles"
                  className="absolute top-4 right-4 p-2 hover:bg-[rgba(121,118,124,0.08)] text-[var(--sase-text-muted)] hover:text-sase-danger transition-all rounded-xl"
              >
                <span className="material-icons">close</span>
              </button>

              <div className="p-8">
                <div className="flex gap-6 mb-8">
                  <div className="size-20 bg-[var(--sase-surface-low)] border border-[var(--sase-border-ghost)] rounded-2xl overflow-hidden">
                    <img
                      src={selectedStudent.avatar}
                      alt={selectedStudent.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="inline-block bg-sase-info/10 text-sase-info text-[9px] font-black px-2.5 py-1 rounded border border-sase-info/20 uppercase tracking-widest mb-2">
                      TRACKING_ACTIVE
                    </span>
                    <h2 className="text-2xl font-black text-white uppercase leading-none mb-1 italic tracking-tighter">
                      {selectedStudent.name}
                    </h2>
                    <p className="text-[10px] font-black text-[var(--sase-text-muted)] uppercase tracking-[0.2em] font-mono">
                      {selectedStudent.matricula} • 3º "B"
                    </p>
                  </div>
                </div>

                <div className="card-sase p-6 border-[var(--sase-border-ghost)] mb-6">
                  <h4 className="text-[9px] font-black text-[var(--sase-text-muted)] uppercase tracking-widest mb-4 pb-2 border-b border-[var(--sase-border-ghost)]">
                    MÉTRICAS_RÁPIDAS
                  </h4>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div className="border-r border-[var(--sase-border-ghost)]">
                      <div className="text-2xl font-black text-white italic font-mono">
                        9.2
                      </div>
                      <div className="text-[9px] uppercase font-black text-[var(--sase-text-muted)] tracking-widest">
                        Promedio
                      </div>
                    </div>
                      <div className="border-r border-[var(--sase-border-ghost)]">
                      <div className="text-2xl font-black text-sase-clinical italic font-mono">
                        96%
                      </div>
                      <div className="text-[9px] uppercase font-black text-slate-600 tracking-widest">
                        Asistencia
                      </div>
                    </div>
                      <div className="border-r border-[var(--sase-border-ghost)]">
                      <div className="text-2xl font-black text-sase-warning italic font-mono">
                        {selectedStudent.incidents.length}
                      </div>
                      <div className="text-[9px] uppercase font-black text-slate-600 tracking-widest">
                        Reportes
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-white italic font-mono">
                        0
                      </div>
                      <div className="text-[9px] uppercase font-black text-slate-600 tracking-widest">
                        Justif.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 italic">
                    <span className="material-icons text-[var(--sase-text-muted)] text-lg">
                      history_edu
                    </span>
                    TRAYECTORIA_ESCOLAR
                  </h3>
                    <div className="card-sase p-0 overflow-hidden border-[var(--sase-border-ghost)]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[rgba(121,118,124,0.08)] border-b border-[var(--sase-border-ghost)]">
                        <tr>
                          <th className="p-3 text-[9px] font-black text-[var(--sase-text-muted)] uppercase tracking-widest">
                            Fecha
                          </th>
                          <th className="p-3 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                            Tipo
                          </th>
                          <th className="p-3 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                            Descripción
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        {selectedStudent.incidents.length > 0 ? (
                          selectedStudent.incidents.map((inc: any) => (
                            <tr key={inc.id} className="hover:bg-[rgba(121,118,124,0.08)]">
                              <td className="p-3 text-[var(--sase-text-muted)] font-mono text-[10px]">
                                15/01/2026
                              </td>
                              <td className="p-3 font-black text-white uppercase text-[10px]">
                                {inc.type}
                              </td>
                              <td className="p-3 text-[var(--sase-text-muted)] text-[10px]">
                                {inc.description}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={3}
                            className="p-8 text-center text-[var(--sase-text-muted)] italic text-[10px] font-black uppercase tracking-widest"
                            >
                              Sin registros en este periodo.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUICK REPORT MODAL */}
      <AnimatePresence>
        {isQuickReportOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg relative group"
            >
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-sase-info/30 to-sase-purple/30 blur-2xl opacity-50 group-hover:opacity-80 transition duration-500" />

              <div className="relative rounded-2xl border border-[var(--sase-border-ghost)] bg-[linear-gradient(180deg,rgba(121,118,124,0.16)_0%,rgba(121,118,124,0.08)_100%)] p-8 shadow-[0_35px_100px_rgba(18,16,23,0.38)] backdrop-blur-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Reporte Rápido
                </h2>
                <p className="text-slate-300 mb-6 text-sm">
                  Selecciona la incidencia para los {selectedStudentIds.size}
                  alumnos seleccionados.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {quickComments.map((comment, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() =>
                        handleBulkReport(comment.type, comment.label)
                      }
                      className="p-3 rounded-xl border border-[var(--sase-border-ghost)] bg-[rgba(121,118,124,0.08)] hover:bg-sase-info/20 hover:border-sase-info hover:shadow-[0_0_15px_rgba(129,106,184,0.18)] transition-all text-slate-200 font-medium text-sm flex items-center gap-2"
                    >
                      <span className="material-icons text-sase-info text-sm">
                        bolt
                      </span>
                      {comment.label}
                    </motion.button>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setIsQuickReportOpen(false)}
                    className="px-6 py-2 rounded-full border border-[var(--sase-border-ghost)] text-[var(--sase-text-muted)] hover:text-white hover:bg-[rgba(121,118,124,0.1)] transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === "ASISTENCIA" && (
        <div className="card-sase border-[var(--sase-border-ghost)] overflow-hidden relative">
          {/* Scanning Line */}
          <motion.div
            animate={{ top: ["-10%", "110%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-sase-clinical/20 to-transparent pointer-events-none z-10"
          />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[var(--sase-border-ghost)] opacity-20"></div>
          <div className="p-6 border-b border-[var(--sase-border-ghost)] bg-[rgba(121,118,124,0.06)] flex justify-between items-center relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-sase-clinical"></div>
            <div className="pl-4">
              <h2 className="text-sm font-black text-slate-300 uppercase tracking-[0.2em] italic">
                PASE DE LISTA <span className="text-sase-clinical">DIARIO</span>
              </h2>
              <p className="text-[9px] text-[var(--sase-text-muted)] font-black uppercase tracking-widest mt-1">
                {new Date().toLocaleDateString("es-MX", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <button
              className="px-6 py-3 bg-sase-clinical text-white font-black text-[10px] uppercase tracking-[0.15em] hover:bg-sase-clinical transition-all shadow-xl shadow-black/5 shadow-sase-clinical/20 rounded-xl flex items-center gap-2 active:scale-95"
              onClick={saveAttendance}
              title="Guardar los cambios en el pase de lista de hoy"
            >
              <span className="material-icons text-lg">save</span>
              GUARDAR
            </button>
          </div>

          <div className="overflow-hidden">
            <table className="w-full divide-y divide-white/[0.03]">
              <thead className="bg-[rgba(121,118,124,0.08)]">
                <tr>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-[var(--sase-text-muted)] uppercase tracking-widest">
                    Alumno
                  </th>
                  <th className="px-6 py-4 text-center text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    Observaciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {students.map((student) => {
                  const currentStatus = attendanceState[student.id] || "P"; // Default to Present
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-[rgba(121,118,124,0.08)] transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="size-10 bg-[var(--sase-surface-low)] border border-[var(--sase-border-ghost)] overflow-hidden shrink-0 rounded-xl">
                            <img
                              src={student.avatar}
                              alt={`Foto de ${student.name}`}
                              title={`Foto de perfil de ${student.name}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-xs font-black text-white uppercase tracking-tight">
                              {student.name}
                            </div>
                            <div className="text-[10px] text-[var(--sase-text-muted)] font-mono font-black">
                              {student.matricula}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="inline-flex border border-[var(--sase-border-ghost)] rounded-xl overflow-hidden">
                          <button
                            onClick={() =>
                              handleAttendanceChange(student.id, "P")
                            }
                            title="Marcar como Presente"
                            className={`px-5 py-2.5 text-[10px] font-black transition-all ${currentStatus === "P" ? "bg-sase-clinical text-white shadow-xl shadow-black/5 shadow-sase-clinical/30" : "bg-[var(--sase-surface-low)] text-[var(--sase-text-muted)] hover:bg-[rgba(121,118,124,0.12)]"}`}
                          >
                            P
                          </button>
                          <button
                            onClick={() =>
                              handleAttendanceChange(student.id, "R")
                            }
                            title="Marcar como Retardo"
                            className={`px-5 py-2.5 text-[10px] font-black border-l border-r border-[var(--sase-border-ghost)] transition-all ${currentStatus === "R" ? "bg-sase-warning text-[#1d1a12] shadow-xl shadow-black/5 shadow-sase-warning/30" : "bg-[var(--sase-surface-low)] text-[var(--sase-text-muted)] hover:bg-[rgba(121,118,124,0.12)]"}`}
                          >
                            R
                          </button>
                          <button
                            onClick={() =>
                              handleAttendanceChange(student.id, "F")
                            }
                            title="Marcar como Falta"
                            className={`px-5 py-2.5 text-[10px] font-black transition-all ${currentStatus === "F" ? "bg-sase-danger text-white shadow-xl shadow-black/5 shadow-sase-danger/30" : "bg-[var(--sase-surface-low)] text-[var(--sase-text-muted)] hover:bg-[rgba(121,118,124,0.12)]"}`}
                          >
                            F
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full bg-[var(--sase-surface-low)] border border-[var(--sase-border-ghost)] rounded-xl px-4 py-2.5 text-[10px] text-white outline-none focus:border-sase-info/40 focus:bg-[rgba(121,118,124,0.12)] transition-all placeholder-[var(--sase-text-muted)] font-black uppercase tracking-widest"
                            placeholder="Agregar nota..."
                            title={`Observación de asistencia para ${student.name}`}
                          />
                          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sase-text-muted)] hover:text-sase-info transition-colors">
                            <span className="material-icons text-[16px]">
                              edit_note
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "CALIFICACIONES" && (
        <div className="card-sase border-[var(--sase-border-ghost)] overflow-hidden relative">
          {/* Scanning Line */}
          <motion.div
            animate={{ top: ["-10%", "110%"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-sase-warning/20 to-transparent pointer-events-none z-10"
          />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[var(--sase-border-ghost)] opacity-20"></div>
          <div className="p-6 border-b border-[var(--sase-border-ghost)] bg-[rgba(121,118,124,0.06)] flex justify-between items-center relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-sase-warning"></div>
            <div className="pl-4">
              <h2 className="text-sm font-black text-slate-300 uppercase tracking-[0.2em] italic flex items-center gap-3">
                <span className="material-icons text-sase-warning text-xl">
                  lock_clock
                </span>
                EVALUACIÓN <span className="text-sase-warning">CONTINUA</span>
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="bg-sase-warning/10 text-sase-warning text-[9px] font-black px-2.5 py-1 rounded border border-sase-warning/20 uppercase tracking-widest">
                  SOLO_LECTURA
                </span>
                <p className="text-[9px] text-[var(--sase-text-muted)] font-black uppercase tracking-widest">
                  Módulo de captura cerrado por Dirección
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[rgba(121,118,124,0.08)] border-b border-[var(--sase-border-ghost)]">
                <tr>
                  <th className="p-4 text-[9px] font-black uppercase tracking-widest text-[var(--sase-text-muted)] w-1/3">
                    Alumno
                  </th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-600 text-center">
                    T1
                  </th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-600 text-center">
                    T2
                  </th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-600 text-center">
                    T3
                  </th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-widest text-sase-admin text-center bg-white/[0.02]">
                    PROMEDIO
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {students.map((s) => {
                  // Mock average calculation
                  const t1 = 8.5; // Mock data
                  const t2 = 9.0;
                  const t3 = null;
                  const avg = ((t1 + t2) / 2).toFixed(1);

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-white/[0.02] group transition-colors"
                    >
                      <td className="p-4 border-r border-white/[0.03]">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-2xl bg-[var(--sase-surface-low)] border border-[var(--sase-border-ghost)] overflow-hidden">
                            <img
                              src={s.avatar}
                              alt={`Foto de ${s.name}`}
                              title={`Foto de ${s.name}`}
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                            />
                          </div>
                          <span className="text-xs font-black text-white uppercase tracking-tight">
                            {s.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center font-mono font-black text-[var(--sase-text-muted)] text-sm border-r border-white/[0.03]">
                        {t1}
                      </td>
                      <td className="p-4 text-center font-mono font-black text-slate-600 text-sm border-r border-white/[0.03]">
                        {t2}
                      </td>
                      <td className="p-4 text-center font-mono text-slate-600 text-sm border-r border-white/[0.03]">
                        -
                      </td>
                      <td className="p-4 text-center font-black text-white font-mono text-sm bg-[rgba(121,118,124,0.08)] [text-shadow:0_0_15px_rgba(125,114,147,0.22)]">
                        {avg}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE ALUMNO (StudentAdvancedPanel) */}
      {selectedStudent && (
        <StudentAdvancedPanel
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {/* MODAL REPORTE MASIVO */}
      <AnimatePresence>
        {isQuickReportOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuickReportOpen(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0f172a] border border-sase-info/20 rounded-3xl shadow-2xl p-6 md:p-8 overflow-hidden"
            >
              {/* Premium Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className="size-12 rounded-xl bg-sase-danger/20 text-sase-danger flex items-center justify-center border border-sase-danger/30">
                    <span className="material-icons text-2xl">
                      gavel
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">
                      Reporte Grupal
                    </h2>
                    <p className="text-xs text-[var(--sase-text-muted)] mt-1 uppercase tracking-widest font-black">
                      {selectedStudentIds.size} ALUMNOS SELECCIONADOS
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsQuickReportOpen(false)}
                  className="text-[var(--sase-text-muted)] hover:text-white transition-colors"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Comentarios Rápidos */}
                <div>
                  <label className="text-xs font-black text-[var(--sase-text-muted)] uppercase tracking-widest mb-3 block">
                    Motivos Frecuentes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {quickComments.map((comment, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          handleBulkReport(comment.type, comment.label)
                        }
                        className="px-4 py-2 rounded-xl border border-[var(--sase-border-ghost)] bg-[rgba(121,118,124,0.08)] text-white text-xs font-bold hover:bg-[rgba(121,118,124,0.14)] hover:border-sase-info/30 hover:text-sase-info transition-all text-left flex items-center gap-2"
                      >
                        <span className="material-icons text-sm opacity-50">
                          {comment.type === IncidentType.CONDUCTA
                            ? "sports_kabaddi"
                            : comment.type === IncidentType.ACADEMICO
                              ? "menu_book"
                              : "assignment_late"}
                        </span>
                        {comment.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--sase-border-ghost)]">
                  <p className="text-[10px] text-[var(--sase-text-muted)] text-center uppercase tracking-widest font-black">
                    El reporte se aplicará a todos los alumnos seleccionados al
                    hacer clic en el motivo.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};
