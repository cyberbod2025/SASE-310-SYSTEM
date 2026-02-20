import React, { useState, useRef, useMemo } from "react";
import { useApp } from "../../store";
import toast from "react-hot-toast";
import { CaseState, AppModule, Student, IncidentType } from "../../types";
import { Inscripciones } from "../Inscripciones";
import { Archivo } from "../Archivo";
import { CICLO_ESCOLAR } from "../../config/sase.config";
import { useAuth } from "../AuthProvider";
import { StudentAdvancedPanel } from "../StudentAdvancedPanel";

// --- TYPES FOR AI DISTRIBUTION ---
interface GroupStats {
  groupId: string;
  count: number;
  femaleCount: number;
  maleCount: number;
  totalGpa: number;
  avgGpa: number;
}

export const DashboardSecretaria = () => {
  const {
    students,
    logAccess,
    logAudit,
    addIncident,
    importStudents,
    currentModule,
    setCurrentModule,
    updateStudentAudit,
    notices,
    resolveSystemNotice,
  } = useApp();
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- DISTRIBUTION STATE ---
  const [showDistributionModal, setShowDistributionModal] = useState(false);
  const [proposedStudents, setProposedStudents] = useState<Student[]>([]);
  const [distributionAnalysis, setDistributionAnalysis] = useState<{
    before: GroupStats[];
    after: GroupStats[];
  } | null>(null);
  const [useAIDistribution, setUseAIDistribution] = useState(true);
  const [showDataRequests, setShowDataRequests] = useState(false);
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");

  const handleQuickRegister = (
    student: Student,
    type: "NO_CREDENCIAL" | "RETARDO",
  ) => {
    // Alerta inteligente de estatus de trámite para evitar reportes dobles
    if (type === "NO_CREDENCIAL" && student.credencialStatus === "en_tramite") {
      toast("Credencial ya está en trámite. No requiere reporte adicional.", {
        icon: "ℹ️",
        duration: 4000,
      });
    }

    addIncident(
      student.id,
      type === "RETARDO" ? IncidentType.RETARDO : IncidentType.CONDUCTA,
      `${type.replace("_", " ")} en Entrada Principal (Registro Veloz)`,
    );
    toast.success(`Registro exitoso: ${student.name} pasó al salón.`, {
      icon: "⚡",
      duration: 3000,
    });
    setShowQuickAccess(false);
    setQuickSearch("");
    logAudit(
      "CREACION",
      `${type} - Registro Veloz Entrada`,
      "alumnos",
      student.id,
    );
  };

  const activeUserName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Secretaria/o";
  const activeUserRole = "Control Escolar";

  if (currentModule === AppModule.INSCRIPCIONES) return <Inscripciones />;
  if (currentModule === AppModule.ARCHIVO) return <Archivo />;

  // --- AI DISTRIBUTION LOGIC ---
  const calculateGroupStats = (studentList: Student[]): GroupStats[] => {
    const groups: Record<string, GroupStats> = {};

    studentList.forEach((s) => {
      // Normalize group name
      const gName = s.group || "Sin Asignar";
      if (!groups[gName]) {
        groups[gName] = {
          groupId: gName,
          count: 0,
          femaleCount: 0,
          maleCount: 0,
          totalGpa: 0,
          avgGpa: 0,
        };
      }
      groups[gName].count++;
      if (s.gender === "F") groups[gName].femaleCount++;
      if (s.gender === "M") groups[gName].maleCount++;
      if (s.previousGpa) groups[gName].totalGpa += s.previousGpa;
    });

    return Object.values(groups)
      .map((g) => ({
        ...g,
        avgGpa: g.count > 0 ? parseFloat((g.totalGpa / g.count).toFixed(2)) : 0,
      }))
      .sort((a, b) => a.groupId.localeCompare(b.groupId));
  };

  const runDistributionAI = (newStudents: Student[]) => {
    // 1. Get Current Stats
    const currentStats = calculateGroupStats(students);
    const mockGroups = ["1º A", "1º B", "1º C", "2º A", "2º B", "3º A", "3º B"]; // Available groups context

    // Initialize stats for all groups if not present
    mockGroups.forEach((g) => {
      if (!currentStats.find((s) => s.groupId === g)) {
        currentStats.push({
          groupId: g,
          count: 0,
          femaleCount: 0,
          maleCount: 0,
          totalGpa: 0,
          avgGpa: 0,
        });
      }
    });

    // 2. Clone for simulation
    let simStats = JSON.parse(JSON.stringify(currentStats)) as GroupStats[];
    const distributedStudents = [...newStudents];

    // 3. Distribution algorithm
    distributedStudents.forEach((student) => {
      // If AI balance is OFF, respect current group or assign randomly/sequentially if empty
      if (!useAIDistribution) {
        if (!student.group) {
          student.group = mockGroups[0]; // Default
        }
      } else {
        // Find best group for this student (AI balanced)
        let bestGroup = "";
        let bestScore = -Infinity;

        simStats.forEach((group) => {
          const currentSize = group.count;
          const currentFemalePct =
            group.count > 0 ? group.femaleCount / group.count : 0.5;
          const currentAvg = group.avgGpa;

          const isFemale = student.gender === "F";
          const studentGpa = student.previousGpa || 8.0;

          const sizeScore = -currentSize * 10;
          let genderScore = 0;
          if (currentFemalePct > 0.55 && !isFemale) genderScore = 5;
          if (currentFemalePct < 0.45 && isFemale) genderScore = 5;

          let gpaScore = 0;
          if (currentAvg < 8.0 && studentGpa > 8.5) gpaScore = 3;
          if (currentAvg > 9.0 && studentGpa < 7.0) gpaScore = 3;

          const totalScore = sizeScore + genderScore + gpaScore;

          if (totalScore > bestScore) {
            bestScore = totalScore;
            bestGroup = group.groupId;
          }
        });
        student.group = bestGroup;
      }

      // Update Sim Stats
      const bestGroup = student.group;
      const groupIdx = simStats.findIndex(
        (g: GroupStats) => g.groupId === bestGroup,
      );
      if (groupIdx >= 0) {
        simStats[groupIdx].count++;
        if (student.gender === "F") simStats[groupIdx].femaleCount++;
        else simStats[groupIdx].maleCount++;
        simStats[groupIdx].totalGpa += student.previousGpa || 8.0;
        simStats[groupIdx].avgGpa =
          simStats[groupIdx].totalGpa / simStats[groupIdx].count;
      }
    });

    setProposedStudents(distributedStudents);
    setDistributionAnalysis({
      before: currentStats,
      after: simStats,
    });
    setShowDistributionModal(true);
  };

  const handleEdit = (id: string) => {
    const student = students.find((s) => s.id === id);
    setEditingId(id);
    logAccess(
      `Consultar Expediente (Usuario: ${activeUserName})`,
      id,
      student?.name,
    );
  };

  const handleSaveAudit = async (studentId: string) => {
    const student = students.find((s) => s.id === studentId);

    await logAudit(
      "ACTUALIZACION",
      `Expediente modificado por ${activeUserName} (${activeUserRole})`,
      "alumnos",
      studentId,
      student?.name,
      null,
      { modifiedBy: activeUserName, modifiedAt: new Date().toISOString() },
    );

    updateStudentAudit(studentId, activeUserName);
    toast.success(`[AUDITORÍA] Cambios guardados por: ${activeUserName}`);
    setEditingId(null);
  };

  const confirmDistribution = async () => {
    // Actually import the students with their assigned groups
    importStudents(proposedStudents);

    await logAudit(
      "CREACION",
      `Importación y distribución inteligente de ${proposedStudents.length} alumnos`,
      "sistema",
      "BATCH",
      "N/A",
      null,
      { count: proposedStudents.length, distributedBy: activeUserName },
    );
    toast.success("Alumnos importados y distribuidos correctamente");
    setShowDistributionModal(false);
    setProposedStudents([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const loadingToast = toast.loading("Analizando archivo con IA...");

      // GENERATE MOCK DATA FOR DEMO
      setTimeout(() => {
        const firstNamesM = [
          "Santiago",
          "Mateo",
          "Leonardo",
          "Emiliano",
          "Daniel",
        ];
        const firstNamesF = [
          "Sofía",
          "Valentina",
          "Regina",
          "Camila",
          "Valeria",
        ];
        const lastNames = [
          "García",
          "López",
          "Martínez",
          "Hernández",
          "González",
          "Pérez",
          "Rodríguez",
        ];

        const newStudents: Student[] = Array.from({ length: 15 }).map(
          (_, i) => {
            const isFemale = Math.random() > 0.5;
            const name = isFemale
              ? `${firstNamesF[Math.floor(Math.random() * firstNamesF.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
              : `${firstNamesM[Math.floor(Math.random() * firstNamesM.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

            return {
              id: `imp-${Date.now()}-${i}`,
              matricula: `2025-${i + 100}`,
              name: name,
              group: "", // TO BE ASSIGNED BY AI
              gender: isFemale ? "F" : "M",
              previousGpa: parseFloat(
                (Math.random() * (10 - 6) + 6).toFixed(1),
              ),
              avatar: `https://ui-avatars.com/api/?name=${name}&background=random`,
              caseState: CaseState.OBSERVADO, // Default state
              incidents: [],
              justificantes: [],
              guardianInfo: {
                name: `Tutor de ${name.split(" ")[0]}`,
                relationship: "Padre/Madre",
                phonePrimary: "55 1234 5678",
              },
            };
          },
        );

        toast.dismiss(loadingToast);
        runDistributionAI(newStudents);
      }, 1500);
    }
  };

  return (
    <div className="flex-1 w-full space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-cyan-500"></div>
            <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center text-cyan-600">
              <span className="material-symbols-outlined text-3xl">desk</span>
            </div>
          </div>
          <div>
            <h2
              id="secretaria-header"
              className="text-3xl font-black text-slate-800 tracking-tight"
            >
              Secretaría
            </h2>
            <div className="flex items-center gap-3 mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1.5 text-cyan-700">
                <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                Control Escolar
              </span>
              <span className="text-slate-300">|</span>
              <span>Expedientes y Auditoría</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white border border-slate-200 p-2 rounded-xl shadow-sm">
          <div className="flex flex-col items-end px-2">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Sesión de Auditoría
            </span>
            <span className="text-xs font-black text-slate-800 uppercase">
              {activeUserName}
            </span>
          </div>
          <div className="size-10 rounded-lg bg-cyan-50 border border-cyan-100 text-cyan-700 flex items-center justify-center font-black text-sm uppercase">
            {activeUserName.substring(0, 2)}
          </div>
        </div>
      </div>

      {/* Access Badge & Context */}
      <div className="flex flex-wrap items-center gap-6 p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-inner">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600 text-[20px]">
            verified_user
          </span>
          <p className="text-xs font-black text-slate-600 uppercase tracking-widest">
            Nivel de Acceso:{" "}
            <span className="text-emerald-700">Total (Supervisado)</span>
          </p>
        </div>
        <div className="hidden md:block w-px h-4 bg-slate-200"></div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">policy</span>
          Bitácora Activa: Toda consulta de expediente queda registrada
          institucionalmente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Data Import Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between group hover:border-cyan-200 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Carga Masiva e IA
              </h3>
              <p className="text-xs font-black text-slate-500 mt-1 uppercase tracking-widest">
                Layout SEP / Excel / CSV
              </p>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 group-hover:text-cyan-600 transition-colors">
              <span className="material-symbols-outlined">psychology</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Equilibrar con IA
            </span>
            <button
              onClick={() => setUseAIDistribution(!useAIDistribution)}
              className={`w-12 h-6 rounded-full p-1 transition-all ${useAIDistribution ? "bg-cyan-500" : "bg-slate-300"}`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-all ${useAIDistribution ? "translate-x-6" : "translate-x-0"}`}
              ></div>
            </button>
          </div>

          <p className="text-[10px] text-slate-400 mb-4 font-medium leading-relaxed italic">
            {useAIDistribution
              ? "La IA distribuirá a los alumnos para balancear género y promedio."
              : "Se respetará el grupo indicado en la lista oficial importada."}
          </p>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv,.xlsx"
            onChange={handleImport}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-600 uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">
              upload_file
            </span>
            Importar Alumnos
          </button>
        </div>

        {/* Trámites Card (New) */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col group hover:border-amber-200 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Trámites Activos
              </h3>
              <p className="text-xs font-black text-slate-500 mt-1 uppercase tracking-widest">
                Constancias y Certificados
              </p>
            </div>
            <div className="p-2 bg-amber-50 rounded-xl border border-amber-100 text-amber-600">
              <span className="material-symbols-outlined">description</span>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] font-black text-slate-500 uppercase">
                Pendientes
              </span>
              <span className="text-sm font-black text-amber-600">08</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] font-black text-slate-500 uppercase">
                En Proceso
              </span>
              <span className="text-sm font-black text-blue-600">12</span>
            </div>
          </div>

          <button
            onClick={() => setCurrentModule(AppModule.SOLICITUDES)}
            className="mt-4 w-full py-3 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100 hover:bg-amber-100 transition-all"
          >
            Gestionar Trámites
          </button>
        </div>

        {/* Info Card & Quick Access */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between group overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
            <div className="relative z-10">
              <h3 className="text-white/50 font-black text-[10px] uppercase tracking-[0.2em]">
                Total Matrícula
              </h3>
              <p className="text-3xl font-black text-white tabular-nums mt-1">
                {students.length}
              </p>
            </div>
            <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center text-white relative z-10">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>

          {/* Quick Entry Button (Magic Register) */}
          <button
            onClick={() => setShowQuickAccess(true)}
            className="w-full mt-4 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="material-symbols-outlined text-2xl relative z-10">
              bolt
            </span>
            <div className="text-left relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                Registro Veloz
              </p>
              <p className="text-xs font-black uppercase tracking-widest leading-none">
                Acceso Entrada (Entrada s/Credencial)
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* --- NUEVA SECCIÓN: CONTROL DE GRUPOS Y AVISOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Estadísticas de Grupos */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-500">
                analytics
              </span>
              Balance de Grupos (Ciclo {CICLO_ESCOLAR.nombre})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  toast.success("Preparando reporte para impresión...");
                  window.print();
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg border border-slate-200 hover:border-indigo-200 transition-all text-[10px] font-black uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                Imprimir
              </button>
              <button
                onClick={() =>
                  toast.success("Exportando estadísticas a CSV...", {
                    icon: "📊",
                  })
                }
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 rounded-lg border border-slate-200 hover:border-emerald-200 transition-all text-[10px] font-black uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-sm">
                  description
                </span>
                Exportar
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {calculateGroupStats(students).map((g) => (
              <div
                key={g.groupId}
                className="p-4 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-black text-slate-700">{g.groupId}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {g.count} Alumnos
                  </span>
                </div>
                <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-pink-400"
                    style={{ width: `${(g.femaleCount / g.count) * 100}%` }}
                  ></div>
                  <div
                    className="bg-blue-400"
                    style={{ width: `${(g.maleCount / g.count) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-[9px] font-black text-slate-500 uppercase">
                  <span>M: {g.femaleCount}</span>
                  <span>H: {g.maleCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel de Avisos de Otros Departamentos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-500">
                notification_important
              </span>
              Avisos Operativos
            </h3>
            <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-black rounded-full border border-rose-100">
              {notices.filter((n) => !n.resolved).length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {notices.filter((n) => !n.resolved).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center opacity-40">
                <span className="material-symbols-outlined text-4xl">
                  check_circle
                </span>
                <p className="text-[10px] font-bold uppercase mt-2">
                  Sin avisos pendientes
                </p>
              </div>
            ) : (
              notices
                .filter((n) => !n.resolved)
                .map((notice) => (
                  <div
                    key={notice.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-rose-200 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                          notice.type === "ACTUALIZACION_TELEFONO"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {notice.type.replace("_", " ")}
                      </span>
                      <button
                        onClick={() => resolveSystemNotice(notice.id)}
                        className="text-slate-300 hover:text-emerald-500"
                      >
                        <span className="material-symbols-outlined text-sm">
                          done_all
                        </span>
                      </button>
                    </div>
                    <p className="text-[11px] font-black text-slate-800 leading-tight uppercase">
                      {notice.studentName}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                      {notice.description}
                    </p>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
                      <span className="text-[8px] font-bold text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px]">
                          person
                        </span>
                        {notice.requestedBy}
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 italic">
                        {new Date(notice.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL: AI DISTRIBUTION VISUALIZER */}
      {showDistributionModal && distributionAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-600">
                    smart_toy
                  </span>
                  Propuesta de Distribución Inteligente
                </h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Basado en Promedio, Género y Carga de Grupo
                </p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold text-xs rounded-full">
                  {proposedStudents.length} Nuevos Alumnos
                </span>
              </div>
            </div>

            {/* Body: Comparative Stats */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Before */}
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">
                    Estado Actual
                  </h4>
                  <div className="space-y-3">
                    {distributionAnalysis.before
                      .filter((g) => g.count > 0)
                      .map((group) => (
                        <div
                          key={group.groupId}
                          className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm opacity-60"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-black text-slate-700">
                              {group.groupId}
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                              {group.count} alumnos
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 uppercase font-bold">
                            <div>GPA: {group.avgGpa.toFixed(1)}</div>
                            <div>
                              Fem:{" "}
                              {(
                                (group.femaleCount / group.count) *
                                100
                              ).toFixed(0)}
                              %
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* After (Proposal) */}
                <div>
                  <h4 className="text-xs font-black text-cyan-600 uppercase tracking-widest mb-4 border-b border-cyan-100 pb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                      auto_fix_high
                    </span>
                    Proyección IA
                  </h4>
                  <div className="space-y-3">
                    {distributionAnalysis.after
                      .filter((g) => g.count > 0)
                      .map((group) => {
                        const prev = distributionAnalysis.before.find(
                          (p) => p.groupId === group.groupId,
                        );
                        const countDiff = group.count - (prev?.count || 0);

                        return (
                          <div
                            key={group.groupId}
                            className="bg-white p-3 rounded-xl border border-cyan-200 shadow-md ring-1 ring-cyan-50"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-black text-slate-800 text-lg">
                                {group.groupId}
                              </span>
                              <div className="flex items-center gap-2">
                                {countDiff > 0 && (
                                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                                    +{countDiff}
                                  </span>
                                )}
                                <span className="text-xs font-bold text-slate-600">
                                  {group.count} alumnos
                                </span>
                              </div>
                            </div>

                            {/* Visual Bars for Balance */}
                            <div className="space-y-2 mt-2">
                              {/* GPA Bar */}
                              <div>
                                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase mb-0.5">
                                  <span>Promedio</span>
                                  <span>{group.avgGpa.toFixed(1)}</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-500"
                                    style={{
                                      width: `${(group.avgGpa / 10) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                              {/* Gender Bar */}
                              <div>
                                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase mb-0.5">
                                  <span>Equilibrio H/M</span>
                                  <span>
                                    {(
                                      (group.femaleCount / group.count) *
                                      100
                                    ).toFixed(0)}
                                    % M
                                  </span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                                  <div
                                    className="h-full bg-pink-400"
                                    style={{
                                      width: `${(group.femaleCount / group.count) * 100}%`,
                                    }}
                                  ></div>
                                  <div
                                    className="h-full bg-blue-400"
                                    style={{
                                      width: `${(group.maleCount / group.count) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDistributionModal(false);
                  setProposedStudents([]);
                }}
                className="px-4 py-3 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-50 uppercase tracking-widest transition-colors"
              >
                Cancelar Operación
              </button>
              <button
                onClick={confirmDistribution}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-cyan-200 transition-all flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined">check_circle</span>
                Confirmar Distribución
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student List */}
      <div
        id="secretaria-list"
        className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]"
      >
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
            <span className="material-symbols-outlined text-cyan-600">
              folder_shared
            </span>
            Directorio Estudiantil Institucional
          </h3>

          <div id="secretaria-search" className="relative w-full md:w-96">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined">
              search
            </span>
            <input
              type="text"
              placeholder="BUSCAR NOMBRE O MATRÍCULA..."
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-black text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all uppercase"
              onChange={(e) => {
                const term = e.target.value.toLowerCase();
                const rows = document.querySelectorAll(".student-row");
                rows.forEach((row) => {
                  const text = row.textContent?.toLowerCase() || "";
                  (row as HTMLElement).style.display = text.includes(term)
                    ? ""
                    : "none";
                });
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {students.length === 0 ? (
            <div className="p-20 text-center">
              <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">
                folder_off
              </span>
              <p className="text-slate-500 font-black uppercase text-xs tracking-widest italic">
                Base de datos local vacía
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-widest">
                    Estudiante
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-widest">
                    Grupo / Matrícula
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-widest">
                    Estado Administrativo
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-widest">
                    Detalle Tutor
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-widest text-center">
                    Protocolo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="student-row hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={student.avatar}
                          alt=""
                          className="size-10 rounded-full border border-slate-200 shadow-sm"
                        />
                        <span className="font-black text-slate-800 uppercase italic text-sm group-hover:text-cyan-700 transition-colors">
                          {student.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <p className="font-black text-slate-700">
                        {student.group}
                      </p>
                      <p className="font-bold text-slate-500 mt-0.5 tracking-tight">
                        {student.matricula}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border uppercase ${
                          student.caseState === CaseState.CERRADO
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : student.caseState === CaseState.OBSERVADO
                              ? "bg-blue-50 text-blue-700 border-blue-100"
                              : "bg-red-50 text-red-700 border-red-100"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            student.caseState === CaseState.CERRADO
                              ? "bg-emerald-500"
                              : student.caseState === CaseState.OBSERVADO
                                ? "bg-blue-500"
                                : "bg-red-500"
                          }`}
                        ></span>
                        {student.caseState}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === student.id ? (
                        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-lg animate-fade-in-up scale-100 max-w-xs ring-4 ring-cyan-500/10">
                          <h4 className="text-xs font-black text-cyan-700 uppercase mb-3 border-b border-cyan-50 pb-2">
                            Expediente del Tutor
                          </h4>
                          <div className="space-y-2">
                            <p className="text-xs font-black text-slate-800 uppercase italic">
                              {student.guardianInfo?.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase">
                              <span className="material-symbols-outlined text-sm text-cyan-600">
                                call
                              </span>
                              {student.guardianInfo?.phonePrimary}
                            </div>
                            <p className="text-[10px] font-black text-slate-500 italic mt-1 leading-tight">
                              {student.guardianInfo?.address ||
                                "Domicilio no suministrado"}
                            </p>
                          </div>
                          <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-2 text-xs font-black text-slate-500 hover:text-slate-700 uppercase tracking-widest transition-colors"
                            >
                              Cerrar
                            </button>
                            <button
                              onClick={() => handleSaveAudit(student.id)}
                              className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-black uppercase hover:bg-cyan-700 shadow-md transition-all active:scale-95"
                            >
                              Auditar y Guardar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className="material-symbols-outlined text-[18px]">
                            lock_person
                          </span>
                          <span className="text-xs font-black uppercase tracking-widest italic">
                            Confidencial
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowAdvancedPanel(true);
                          }}
                          className={`p-2 rounded-lg transition-all border ${
                            showAdvancedPanel &&
                            selectedStudent?.id === student.id
                              ? "bg-blue-50 text-blue-700 border-blue-200 shadow-inner"
                              : "bg-white text-slate-400 hover:text-blue-600 border-slate-200 hover:border-blue-300"
                          }`}
                          title="Gestión Avanzada y IA"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            settings_suggest
                          </span>
                        </button>
                        <button
                          onClick={() => handleEdit(student.id)}
                          className={`p-2 rounded-lg transition-all border ${
                            editingId === student.id
                              ? "bg-cyan-50 text-cyan-700 border-cyan-200 shadow-inner"
                              : "bg-white text-slate-400 hover:text-cyan-600 border-slate-200 hover:border-cyan-300"
                          }`}
                          title="Abrir Expediente"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {editingId === student.id
                              ? "visibility_off"
                              : "visibility"}
                          </span>
                        </button>
                        <button
                          onClick={() => toast.success("Kardex generado")}
                          className="p-2 rounded-lg bg-white text-slate-400 hover:text-emerald-600 border border-slate-200 hover:border-emerald-300 transition-all"
                          title="Imprimir Kardex"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            print
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {showAdvancedPanel && selectedStudent && (
        <StudentAdvancedPanel
          student={selectedStudent}
          onClose={() => setShowAdvancedPanel(false)}
        />
      )}

      {/* QUICK ACCESS MODAL (MAGIC REGISTER) */}
      {showQuickAccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-in">
            <div className="p-6 bg-emerald-500 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined">bolt</span>
                  Acceso Relámpago
                </h3>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
                  Entrada al Plantel - Registro Express
                </p>
              </div>
              <button
                onClick={() => setShowQuickAccess(false)}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined">
                  search
                </span>
                <input
                  autoFocus
                  type="text"
                  placeholder="BUSCAR POR NOMBRE O MATRÍCULA..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-black text-slate-800 focus:border-emerald-500 focus:bg-white transition-all uppercase"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                />
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar">
                {quickSearch.length >= 2 &&
                  students
                    .filter(
                      (s) =>
                        s.name
                          .toLowerCase()
                          .includes(quickSearch.toLowerCase()) ||
                        s.matricula.includes(quickSearch),
                    )
                    .slice(0, 5)
                    .map((student) => (
                      <div
                        key={student.id}
                        className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-300 hover:shadow-lg transition-all flex justify-between items-center group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar}
                            className="size-10 rounded-full border"
                          />
                          <div>
                            <p className="text-[11px] font-black text-slate-800 uppercase italic leading-tight">
                              {student.name}
                            </p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">
                              {student.group} · {student.matricula}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleQuickRegister(student, "NO_CREDENCIAL")
                            }
                            className="px-3 py-2 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase border border-rose-100 hover:bg-rose-100 transition-colors"
                          >
                            S/ Cred
                          </button>
                          <button
                            onClick={() =>
                              handleQuickRegister(student, "RETARDO")
                            }
                            className="px-3 py-2 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase border border-amber-100 hover:bg-amber-100 transition-colors"
                          >
                            Retardo
                          </button>
                        </div>
                      </div>
                    ))}
                {quickSearch.length > 0 && quickSearch.length < 2 && (
                  <p className="text-center py-8 text-[10px] font-black text-slate-400 uppercase">
                    Escribe al menos 2 caracteres...
                  </p>
                )}
                {quickSearch.length >= 2 &&
                  students.filter((s) =>
                    s.name.toLowerCase().includes(quickSearch.toLowerCase()),
                  ).length === 0 && (
                    <p className="text-center py-8 text-[10px] font-black text-slate-400 uppercase">
                      Alumno no encontrado
                    </p>
                  )}
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                Este registro genera una incidencia automática y permite el paso
                inmediato al aula.
                <br />
                El flujo de entrada no se detiene.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
