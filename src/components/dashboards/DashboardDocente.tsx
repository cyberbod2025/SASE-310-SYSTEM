import React, { useState, useMemo } from "react";
import { useApp } from "../../store";
import { UserRole, AppModule, IncidentType, CaseState } from "../../types";
import toast from "react-hot-toast";
import { useAuth } from "../AuthProvider";

export const DashboardDocente = () => {
  const {
    students,
    currentUserRole,
    setCurrentModule,
    addIncident,
    registerAttendance,
  } = useApp();

  // Filter alerts for relevant notifications (demo logic: last 5 incidents)
  const teacherAlerts = useMemo(() => {
    return students
      .filter((s) => s.caseState !== CaseState.CERRADO)
      .slice(0, 5);
  }, [students]);
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
    <div className="h-full flex flex-col bg-[#0f172a] overflow-hidden font-['Inter'] animate-fade-in relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
      {/* HEADER LIQUID GLASS */}
      <div className="glass-panel border-b border-white/5 px-8 py-5 flex justify-between items-center shadow-lg z-10 sticky top-0">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3 drop-shadow-lg">
            <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30">
              <span className="material-symbols-outlined text-3xl text-blue-400">
                school
              </span>
            </div>
            Panel Docente
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-14">
            Ciclo Escolar 2025-2026 • 3º Grado Grupo "B"
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Institutional Status Badge */}
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">
              Sistema Activo
            </span>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-2"></div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-200">
              JD
            </div>
            <div>
              <p className="text-xs font-black text-slate-700 uppercase">
                Prof. Juan D.
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">
                Titular
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS - NOW GLASS PILLS */}
      <div className="flex bg-slate-800/50 backdrop-blur-md p-1 rounded-2xl border border-white/5 w-fit mx-8 mt-6">
        {[
          { id: "GENERAL", label: "Vista General", icon: "dashboard" },
          { id: "ASISTENCIA", label: "Pase de Lista", icon: "fact_check" },
          {
            id: "CALIFICACIONES",
            label: "Evaluación",
            icon: "history_edu",
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
                  flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300
                  ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }
                `}
          >
            <span className="material-symbols-outlined text-lg">
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {/* VISTA GENERAL */}
        {activeTab === "GENERAL" && (
          <div className="grid grid-cols-12 gap-8">
            {/* Directorio de Estudiantes (Columna Principal) */}
            <div className="col-span-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-black text-white uppercase tracking-wide">
                    Mi Grupo
                  </h2>
                  {selectedStudentIds.size > 0 && (
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-fade-in">
                      {selectedStudentIds.size} seleccionados
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
                      className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all animate-bounce-short active:scale-95"
                    >
                      <span className="material-symbols-outlined text-sm">
                        campaign
                      </span>
                      Reportar Incidencia ({selectedStudentIds.size})
                    </button>
                  ) : (
                    <input
                      type="text"
                      placeholder="Buscar alumno..."
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs font-medium outline-none focus:border-blue-500 w-64 shadow-sm text-white placeholder-slate-400"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myStudents.map((student) => {
                  const isSelected = selectedStudentIds.has(student.id);
                  return (
                    <div
                      key={student.id}
                      className={`
                                    card-sase-blue transition-all hover:-translate-y-1 hover:shadow-lg group relative overflow-hidden
                                    ${isSelected ? "ring-2 ring-blue-500 border-blue-500 shadow-md bg-blue-50/50" : "border-white/10 shadow-sm"}
                                    ${student.caseState === CaseState.PATRON_DETECTADO ? "border-amber-200 shadow-amber-100" : ""}
                                `}
                    >
                      {/* Checkbox Overlay for Selection */}
                      <div className="absolute top-2 right-2 z-20">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStudentSelection(student.id);
                          }}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${isSelected ? "bg-blue-500 border-blue-500" : "border-slate-300 bg-white/10 hover:border-blue-400"}`}
                        >
                          {isSelected && (
                            <span className="material-symbols-outlined text-white text-sm font-bold">
                              check
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status Indicator Strip */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 ${
                          student.caseState === CaseState.PATRON_DETECTADO
                            ? "bg-amber-400"
                            : student.caseState === CaseState.INTERVENCION
                              ? "bg-rose-500"
                              : "bg-transparent"
                        }`}
                      ></div>

                      <div
                        className="flex items-center gap-4 cursor-pointer"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-blue-200 transition-colors">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-white uppercase group-hover:text-blue-400 transition-colors">
                            {student.name}
                          </h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {student.matricula}
                          </p>
                        </div>
                      </div>

                      {student.bapInfo?.hasBAP && (
                        <div className="mt-2 flex items-center gap-1.5 animate-pulse">
                          <span className="material-symbols-outlined text-blue-400 text-[14px]">
                            inclusive
                          </span>
                          <p className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">
                            Ajuste Razonable Activo
                          </p>
                        </div>
                      )}

                      {student.caseState !== CaseState.CERRADO && (
                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                          <span className="material-symbols-outlined text-amber-400 text-sm">
                            warning
                          </span>
                          <p className="text-[10px] font-bold text-amber-400 uppercase">
                            Seguimiento Activo
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Derecho */}
            <div className="col-span-4 space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="card-sase-blue flex items-center justify-between group cursor-pointer hover:border-blue-400/50">
                  <div>
                    <p className="text-[10px] font-bold text-blue-300/80 uppercase tracking-widest mb-1">
                      Alumnos Totales
                    </p>
                    <h3 className="text-3xl font-black text-white group-hover:scale-105 transition-transform origin-left">
                      {students.length}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-400 group-hover:text-white group-hover:bg-blue-500 transition-colors">
                    <span className="material-symbols-outlined">groups</span>
                  </div>
                </div>

                <div className="card-sase-blue flex items-center justify-between group cursor-pointer hover:border-emerald-400/50">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-300/80 uppercase tracking-widest mb-1">
                      Asistencia Hoy
                    </p>
                    <h3 className="text-3xl font-black text-white group-hover:scale-105 transition-transform origin-left">
                      98%
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 group-hover:text-white group-hover:bg-emerald-500 transition-colors">
                    <span className="material-symbols-outlined">
                      assignment_turned_in
                    </span>
                  </div>
                </div>

                <div className="card-sase-blue flex items-center justify-between group cursor-pointer hover:border-amber-400/50">
                  <div>
                    <p className="text-[10px] font-bold text-amber-300/80 uppercase tracking-widest mb-1">
                      Reportes Pendientes
                    </p>
                    <h3 className="text-3xl font-black text-white group-hover:scale-105 transition-transform origin-left">
                      3
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-400 group-hover:text-white group-hover:bg-amber-500 transition-colors">
                    <span className="material-symbols-outlined">
                      notification_important
                    </span>
                  </div>
                </div>
              </div>

              {/* Accesos Rápidos */}
              <div className="card-sase-blue p-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                  Acciones Rápidas
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setCurrentModule(AppModule.AGENDA)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors group text-left"
                  >
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-xl">
                        calendar_month
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase">
                        Agendar Actividad
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Exámenes, tareas, reuniones
                      </p>
                    </div>
                  </button>

                  <div className="h-px bg-white/5 my-2"></div>

                  <button
                    onClick={signOut}
                    className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase text-red-400 hover:bg-red-500/20 transition-colors border border-transparent hover:border-red-400/30 rounded-lg"
                  >
                    <span className="material-symbols-outlined text-sm">
                      logout
                    </span>
                    Cerrar Sesión
                  </button>
                </div>
              </div>

              {/* Alerts Feed */}
              <div className="card-sase-blue flex flex-col h-[400px] p-0">
                <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                  <h3 className="text-xs font-black text-red-400 uppercase tracking-widest">
                    Bitácora de Alertas
                  </h3>
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
                    {teacherAlerts.length} NUEVOS
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-0 scrollbar-thin">
                  {teacherAlerts.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                      onClick={() => setSelectedStudent(s)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold bg-white/10 text-slate-300 px-1 rounded-sm group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                          {s.matricula}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                          Hace 15 min
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white uppercase">
                        {s.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="material-symbols-outlined text-red-400 text-sm">
                          warning
                        </span>
                        <p className="text-xs text-slate-300 truncate font-medium">
                          {s.incidents[0]?.description ||
                            "Seguimiento requerido"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LISTA DE ALUMNOS (GLASS) */}
              <div className="card-sase-blue h-full overflow-hidden flex flex-col p-0">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-400">
                      group
                    </span>
                    Listado de Grupo
                  </h3>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                      <span className="material-symbols-outlined">
                        filter_list
                      </span>
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                      <span className="material-symbols-outlined">search</span>
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-black/30 backdrop-blur-sm border-b border-white/5">
                      <tr>
                        <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-400">
                          Alumno
                        </th>
                        <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-400 text-center">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {myStudents.map((student) => (
                        <tr
                          key={student.id}
                          className="hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={() => setSelectedStudent(student)}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                                <img
                                  src={student.avatar}
                                  alt={student.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-sm font-bold text-white uppercase">
                                {student.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            {student.caseState ===
                              CaseState.PATRON_DETECTADO && (
                              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                                Atención
                              </span>
                            )}
                            {student.caseState === CaseState.INTERVENCION && (
                              <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                                Intervención
                              </span>
                            )}
                            {student.caseState === CaseState.CERRADO ? (
                              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                                Normal
                              </span>
                            ) : (
                              <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                                Observación
                              </span>
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

        {/* MODAL DETALLE ALUMNO (METRO STYLE) */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-800 w-full max-w-2xl shadow-2xl border-t-8 border-blue-600 relative animate-slide-up-sm rounded-lg overflow-hidden">
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute top-2 right-2 p-2 hover:bg-white/5 text-slate-400 hover:text-red-400 transition-all rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="p-8">
                <div className="flex gap-6 mb-8">
                  <div className="w-24 h-24 bg-slate-700 border border-white/10 rounded-full overflow-hidden">
                    <img
                      src={selectedStudent.avatar}
                      alt={selectedStudent.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="inline-block bg-blue-500/20 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider mb-2">
                      Acompañamiento Activo
                    </span>
                    <h2 className="text-3xl font-black text-white uppercase leading-none mb-1">
                      {selectedStudent.name}
                    </h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      {selectedStudent.matricula} • 3º "B"
                    </p>
                  </div>
                </div>

                <div className="card-sase-blue p-6 mb-6">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">
                    Métricas Rápidas
                  </h4>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="border-r border-white/5">
                      <div className="text-2xl font-black text-white">9.2</div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Promedio
                      </div>
                    </div>
                    <div className="border-r border-white/5">
                      <div className="text-2xl font-black text-emerald-400">
                        96%
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Asistencia
                      </div>
                    </div>
                    <div className="border-r border-white/5">
                      <div className="text-2xl font-black text-amber-400">
                        {selectedStudent.incidents.length}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Reportes
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-white">0</div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Justificantes
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400">
                        history_edu
                      </span>
                      Trayectoria Escolar
                    </h3>
                  </div>
                  <div className="card-sase-blue p-0 overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-black/20 font-bold text-slate-400 uppercase">
                        <tr>
                          <th className="p-3">Fecha</th>
                          <th className="p-3">Tipo</th>
                          <th className="p-3">Descripción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {selectedStudent.incidents.length > 0 ? (
                          selectedStudent.incidents.map((inc: any) => (
                            <tr key={inc.id}>
                              <td className="p-3 text-slate-400 font-mono border-r border-white/5">
                                15/01/2026
                              </td>
                              <td className="p-3 font-bold text-white uppercase border-r border-white/5">
                                {inc.type}
                              </td>
                              <td className="p-3 text-slate-300">
                                {inc.description}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={3}
                              className="p-6 text-center text-slate-400 italic"
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
            </div>
          </div>
        )}

        {/* QUICK REPORT MODAL */}
        {isQuickReportOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-800 rounded-xl shadow-2xl border border-white/10 w-full max-w-md overflow-hidden">
              <div className="p-4 bg-black/20 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-sm font-black text-white uppercase tracking-wide">
                  Reporte Múltiple
                </h3>
                <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded-full">
                  {selectedStudentIds.size} Alumnos
                </span>
              </div>
              <div className="p-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Seleccione Incidencia Común:
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {quickComments.map((comment, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        handleBulkReport(comment.type, comment.label)
                      }
                      className="p-3 text-left border border-white/10 rounded-lg hover:bg-white/5 hover:border-white/20 transition-all flex items-center justify-between group"
                    >
                      <span className="text-sm font-bold text-white">
                        {comment.label}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          comment.type === IncidentType.CONDUCTA
                            ? "bg-amber-500/20 text-amber-400"
                            : comment.type === IncidentType.UNIFORME
                              ? "bg-slate-500/20 text-slate-400"
                              : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {comment.type}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setIsQuickReportOpen(false)}
                    className="text-slate-400 font-bold text-xs uppercase hover:text-white"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ASISTENCIA" && (
          <div className="card-sase-blue border-t-4 border-t-emerald-500 p-6">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-xl font-black text-white uppercase">
                  Pase de Lista Diario
                </h2>
                <p className="text-xs text-slate-400 font-bold uppercase mt-1">
                  {new Date().toLocaleDateString("es-MX", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <button
                className="px-6 py-2 bg-emerald-600 text-white font-bold text-sm uppercase tracking-wider hover:bg-emerald-700 transition shadow-sm rounded-lg flex items-center gap-2 active:scale-95"
                onClick={saveAttendance}
              >
                <span className="material-symbols-outlined text-[18px]">
                  save
                </span>
                Guardar Asistencia
              </button>
            </div>

            <div className="border border-white/10 rounded-lg overflow-hidden">
              <table className="w-full divide-y divide-white/5">
                <thead className="bg-black/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Alumno
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Observaciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-white/5">
                  {students.map((student) => {
                    const currentStatus = attendanceState[student.id] || "P"; // Default to Present
                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-white/5 transition"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-slate-700 border border-white/10 overflow-hidden shrink-0 rounded-full">
                              <img
                                src={student.avatar}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-white uppercase">
                                {student.name}
                              </div>
                              <div className="text-xs text-slate-400 font-mono">
                                {student.matricula}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="inline-flex border border-white/10 rounded-lg overflow-hidden shadow-sm">
                            <button
                              onClick={() =>
                                handleAttendanceChange(student.id, "P")
                              }
                              className={`px-4 py-2 text-xs font-bold transition-colors ${currentStatus === "P" ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
                            >
                              P
                            </button>
                            <button
                              onClick={() =>
                                handleAttendanceChange(student.id, "R")
                              }
                              className={`px-4 py-2 text-xs font-bold border-l border-r border-white/10 transition-colors ${currentStatus === "R" ? "bg-amber-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
                            >
                              R
                            </button>
                            <button
                              onClick={() =>
                                handleAttendanceChange(student.id, "F")
                              }
                              className={`px-4 py-2 text-xs font-bold transition-colors ${currentStatus === "F" ? "bg-red-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
                            >
                              F
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder-slate-400"
                              placeholder="Agregar nota..."
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400">
                              <span className="material-symbols-outlined text-[16px]">
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
          <div className="card-sase-blue border-t-4 border-t-amber-500 p-6">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-xl font-black text-white uppercase flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-400 text-3xl">
                    lock_clock
                  </span>
                  Evaluación Continua
                </h2>
                <div className="mt-1 flex items-center gap-2">
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider">
                    Solo Lectura
                  </span>
                  <p className="text-xs text-slate-400 font-bold uppercase">
                    Módulo de captura cerrado por Dirección
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-white/10 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-black/20 text-slate-400 border-b border-white/5">
                  <tr>
                    <th className="p-4 text-xs font-black uppercase tracking-wider w-1/3">
                      Alumno
                    </th>
                    <th className="p-4 text-xs font-black uppercase tracking-wider text-center">
                      Trimestre 1
                    </th>
                    <th className="p-4 text-xs font-black uppercase tracking-wider text-center">
                      Trimestre 2
                    </th>
                    <th className="p-4 text-xs font-black uppercase tracking-wider text-center">
                      Trimestre 3
                    </th>
                    <th className="p-4 text-xs font-black uppercase tracking-wider text-center bg-slate-100">
                      Promedio
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => {
                    // Mock average calculation
                    const t1 = 8.5; // Mock data
                    const t2 = 9.0;
                    const t3 = null;
                    const avg = ((t1 + t2) / 2).toFixed(1);

                    return (
                      <tr
                        key={s.id}
                        className="hover:bg-slate-50 group transition-colors"
                      >
                        <td className="p-4 border-r border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                              <img
                                src={s.avatar}
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-700 uppercase">
                              {s.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-slate-600 border-r border-slate-100">
                          {t1}
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-slate-600 border-r border-slate-100">
                          {t2}
                        </td>
                        <td className="p-4 text-center font-mono text-slate-300 border-r border-slate-100">
                          -
                        </td>
                        <td className="p-4 text-center font-black text-slate-800 bg-slate-50/50">
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
      </div>
    </div>
  );
};
