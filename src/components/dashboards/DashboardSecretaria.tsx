import React, { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useApp } from "../../store";
import toast from "react-hot-toast";
import { CaseState, CaseLabels, AppModule, Student, IncidentType } from "../../types";
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
    groups,
    logAccess,
    logAudit,
    addIncident,
    importStudents,
    currentModule,
    setCurrentModule,
    updateStudentAudit,
    notices,
    resolveSystemNotice,
    printDocument,
  } = useApp();
  const { user, profile } = useAuth();
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
    profile?.nombre ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Secretaria/o";
  const activeUserRole =
    profile?.cargo_institucional || profile?.rol || "Control Escolar";

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
    const existingGroups = groups.map((g) => g.nombre || g.name);

    // Initialize stats for all groups if not present
    existingGroups.forEach((g) => {
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
          student.group = existingGroups[0] || "1º A"; // Default
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
    <div className="flex-1 min-h-full p-4 lg:p-8 bg-transparent relative overflow-x-hidden custom-scrollbar">
      {/* Tactical Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] [background-size:40px_40px]"></div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto space-y-8 italic-caps">
        {/* Administrative Command Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="h-1 w-10 bg-cyan-600 rounded-full shadow-[0_0_15px_#0891b2]"></span>
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">
                División de Servicios Escolares
              </p>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              CONTROL <span className="text-cyan-500">ADMINISTRATIVO</span>
            </h1>
          </div>
          <div className="flex items-center gap-6 px-6 py-3 rounded-2xl bg-white/5 border border-slate-200 backdrop-blur-xl">
            <div className="text-right">
              <p className="text-[9px] font-black text-cyan-500 uppercase tracking-widest mb-1">
                Operador Activo
              </p>
              <p className="text-[14px] font-black text-white uppercase italic tracking-tighter tabular-nums">
                {activeUserName}
              </p>
              <div className="flex items-center justify-end gap-2 mt-1">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="size-1.5 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                />
                <span className="text-[8px] font-black text-cyan-500/60 uppercase tracking-[0.3em]">
                  {activeUserRole} • CORE_SYNC_ACTIVE
                </span>
              </div>
            </div>
            <div
              className="size-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-black text-cyan-400"
              title={`Perfil de usuario: ${activeUserName}`}
            >
              {activeUserName.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Security & Context Banner */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 p-4 md:p-5 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl backdrop-blur-md animate-fade-in-up relative overflow-hidden group/banner delay-100">
          {/* Scanning Line */}
          <motion.div
            animate={{ left: ["-10%", "110%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 w-[2px] h-full bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent pointer-events-none z-0"
          />
          <div className="flex items-center gap-3 relative z-10">
            <span className="material-icons text-cyan-500 text-[20px] animate-pulse">
              verified_user
            </span>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
              Nivel de Auditoría:{" "}
              <span className="text-cyan-400">TOTAL / MONITOREADO</span>
            </p>
          </div>
          <div className="hidden md:block w-px h-4 bg-white/10 relative z-10"></div>
          <div className="flex items-center gap-3 relative z-10">
            <span className="material-icons text-slate-700 text-[18px]">
              history_edu
            </span>
            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              Sistema de Bóveda: Registro de consulta de expedientes activo
            </p>
          </div>
          {/* Decorative corner accent */}
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-cyan-500/20 opacity-20 group-hover/banner:opacity-100 transition-opacity"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Data Import Card */}
          <div className="card-sase p-6 flex flex-col justify-between group relative overflow-hidden cursor-default hover:bg-slate-100 transition-all">
            {/* Scanning Line */}
            <motion.div
              animate={{ top: ["-10%", "110%"] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent pointer-events-none z-0"
            />
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                  Carga Masiva e IA
                </h3>
                <p className="text-[9px] font-black text-slate-700 mt-1 uppercase tracking-[0.3em] leading-none italic">
                  Layout SEP / Excel / CSV
                </p>
              </div>
              <div className="size-10 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all duration-500">
                <span className="material-icons">psychology</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 bg-white/[0.02] p-3 rounded-xl border border-slate-100 relative z-10">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">
                Equilibrar con IA
              </span>
              <button
                id="ai-distribution-toggle"
                onClick={() => setUseAIDistribution(!useAIDistribution)}
                title={
                  useAIDistribution
                    ? "Desactivar equilibrio con IA (Asignación manual)"
                    : "Activar equilibrio con IA (Asignación automática optimizada)"
                }
                role="switch"
                aria-checked={useAIDistribution}
                aria-label="Alternar balanceo inteligente de grupos"
                className={`w-12 h-6 rounded-full p-1 transition-all focus:ring-2 focus:ring-cyan-500/50 outline-none ${useAIDistribution ? "bg-cyan-600" : "bg-white/10"}`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-[0_0_10px_white] transition-all ${useAIDistribution ? "translate-x-6" : "translate-x-0"}`}
                ></div>
              </button>
            </div>

            <p className="text-[9px] text-slate-700 mb-6 font-medium leading-relaxed italic uppercase relative z-10">
              {useAIDistribution
                ? "Algoritmo de balanceo por género y promedio activo."
                : "Asignación secuencial por grupo nominal."}
            </p>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv,.xlsx"
              onChange={handleImport}
              title="Archivo de importación de alumnos"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Cargar archivo Excel o CSV para inscripción masiva"
              className="btn-sase-primary w-full py-4 text-[10px] font-black tracking-[0.2em] shadow-cyan-600/20 relative z-10"
            >
              <span className="material-icons text-[18px]">
                upload_file
              </span>
              INICIAR IMPORTACIÓN
            </button>
            {/* Decorative corner accent */}
            <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-slate-200 opacity-20 group-hover:opacity-100 transition-opacity"></div>
          </div>

          {/* Trámites Card */}
          <div className="card-sase p-6 flex flex-col group relative overflow-hidden cursor-default hover:bg-slate-100 transition-all">
            {/* Scanning Line */}
            <motion.div
              animate={{ top: ["-10%", "110%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent pointer-events-none z-0"
            />
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                  Trámites Activos
                </h3>
                <p className="text-[9px] font-black text-slate-700 mt-1 uppercase tracking-[0.3em] leading-none italic">
                  Constancias y Certificados
                </p>
              </div>
              <div className="size-10 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <span className="material-icons">description</span>
              </div>
            </div>

            <div className="space-y-3 flex-1 relative z-10">
              <div className="flex justify-between items-center p-3 bg-white/[0.02] border border-slate-100 rounded-xl">
                <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] italic">
                  Pendientes
                </span>
                <span className="text-2xl font-black text-amber-500 italic tabular-nums tracking-tighter drop-shadow-xl shadow-black/5">
                  08
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/[0.02] border border-slate-100 rounded-xl">
                <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] italic">
                  En Proceso
                </span>
                <span className="text-2xl font-black text-cyan-500 italic tabular-nums tracking-tighter drop-shadow-xl shadow-black/5">
                  12
                </span>
              </div>
            </div>

            <button
              onClick={() => setCurrentModule(AppModule.SOLICITUDES)}
              className="mt-6 w-full py-3 bg-white/[0.02] hover:bg-white/[0.05] text-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative z-10 active:scale-95"
              title="Ver y gestionar trámites pendientes de constancias y certificados"
            >
              SALA DE GESTIÓN
            </button>
            {/* Decorative corner accent */}
            <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-slate-200 opacity-20 group-hover:opacity-100 transition-opacity"></div>
          </div>

          {/* Info Card & Quick Access */}
          <div className="flex flex-col gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between group/total overflow-hidden relative cursor-default hover:border-cyan-500/30 transition-all">
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl group-hover/total:bg-cyan-500/20 transition-all duration-700"></div>
              {/* Scanning Line */}
              <motion.div
                animate={{ top: ["-10%", "110%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent pointer-events-none z-0"
              />
              <div className="relative z-10">
                <h3 className="text-white/50 font-black text-[9px] uppercase tracking-[0.3em] italic">
                  Total Matrícula
                </h3>
                <p className="text-4xl font-black text-white tabular-nums mt-1 italic tracking-tighter drop-shadow-xl shadow-black/5 scale-95 group-hover/total:scale-100 transition-transform duration-500 origin-left">
                  {students.length}
                </p>
              </div>
              <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center text-white relative z-10 group-hover/total:scale-110 transition-transform duration-500">
                <span className="material-icons">group</span>
              </div>
              {/* Decorative corner accent */}
              <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-slate-200 opacity-20 group-hover/total:opacity-100 transition-opacity"></div>
            </div>

            {/* Quick Entry Button (Magic Register) */}
            <button
              onClick={() => setShowQuickAccess(true)}
              className="w-full mt-4 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-xl shadow-black/5 shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 group overflow-hidden relative"
              title="Registrar rápidamente la entrada de alumnos sin credencial o con retardo"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="material-icons text-2xl relative z-10">
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
          <div className="lg:col-span-2 card-sase p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="material-icons text-cyan-500 animate-pulse">
                    analytics
                  </span>
                  BALANCE INSTITUCIONAL{" "}
                  <span className="text-slate-700">
                    [{CICLO_ESCOLAR.nombre}]
                  </span>
                </h3>
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-1">
                  Monitoreo de densidad poblacional por aula
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    toast.success("Preparando reporte para impresión...");
                    window.print();
                  }}
                  className="btn-sase-secondary px-4 py-2 text-[9px] font-black"
                  title="Imprimir reporte de balance institucional de grupos"
                >
                  <span className="material-icons text-sm">
                    print
                  </span>
                  PDF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {(() => {
                const stats = calculateGroupStats(students);
                const allGroupNames = groups.map((g) => g.nombre || g.name);
                
                // Asegurar que todos los grupos oficiales aparezcan
                allGroupNames.forEach(name => {
                  if (!stats.find(s => s.groupId === name)) {
                    stats.push({
                      groupId: name,
                      count: 0,
                      femaleCount: 0,
                      maleCount: 0,
                      totalGpa: 0,
                      avgGpa: 0
                    });
                  }
                });

                const sortedStats = [...stats].sort((a, b) => a.groupId.localeCompare(b.groupId, undefined, { numeric: true }));

                return sortedStats.map((g, idx) => (
                  <motion.div
                    key={g.groupId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-white/[0.02] rounded-2xl border border-slate-100 hover:border-cyan-500/30 hover:bg-slate-100 transition-all group/stat relative overflow-hidden cursor-default"
                  >
                    {/* Scanning Line */}
                    <motion.div
                      animate={{ top: ["-10%", "110%"] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                        delay: idx * 0.4,
                      }}
                      className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent pointer-events-none z-0"
                    />
                    <div className="flex justify-between items-center mb-4 relative z-10">
                      <span className="font-black text-white italic text-lg tracking-tighter tabular-nums group-hover/stat:text-cyan-400 transition-colors">
                        {g.groupId}
                      </span>
                      <div className="text-right">
                        <p className="text-[22px] font-black text-cyan-400 tabular-nums leading-none tracking-tighter drop-shadow-xl shadow-black/5 scale-95 group-hover/stat:scale-100 transition-transform duration-500">
                          {g.count}
                        </p>
                        <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.2em] italic">
                          Alumnos
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 relative z-10">
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                        <div
                          style={{ width: g.count > 0 ? `${(g.femaleCount / g.count) * 100}%` : "0%" }}
                          className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000"
                        />
                        <div
                          style={{ width: g.count > 0 ? `${(g.maleCount / g.count) * 100}%` : "0%" }}
                          className="h-full bg-slate-500 transition-all duration-1000"
                        />
                      </div>

                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
                          <span className="text-cyan-500">
                            Fem: {g.femaleCount}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                          <span className="text-slate-600">
                            Mas: {g.maleCount}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Decorative corner accent */}
                    <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-slate-200 opacity-20 group-hover/stat:opacity-100 transition-opacity"></div>
                  </motion.div>
                ));
              })() as any}
            </div>
          </div>

          {/* Panel de Avisos de Otros Departamentos */}
          <div className="card-sase p-6 flex flex-col overflow-hidden relative group/notices">
            {/* Scanning Line */}
            <motion.div
              animate={{ top: ["-10%", "110%"] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-500/15 to-transparent pointer-events-none z-0"
            />
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="material-icons text-rose-500 animate-pulse">
                    notification_important
                  </span>
                  PROTOCOLOS ACTIVOS
                </h3>
                <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] mt-1 italic">
                  Intervención departamentos externos
                </p>
              </div>
              <span className="px-3 py-1.5 bg-rose-500/10 text-rose-500 text-[10px] font-black rounded-2xl border border-rose-500/20 tabular-nums drop-shadow-sm">
                {notices.filter((n) => !n.resolved).length}
              </span>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {notices.filter((n) => !n.resolved).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-20 py-12">
                  <span className="material-icons text-5xl mb-2">
                    verified
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Zero Incidencias
                  </p>
                </div>
              ) : (
                notices
                  .filter((n) => !n.resolved)
                  .map((notice) => (
                    <div
                      key={notice.id}
                      className="p-4 bg-white/[0.02] border border-slate-100 rounded-2xl hover:bg-white/[0.04] transition-all group/notice"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[8px] font-black px-2 py-0.5 rounded bg-white/10 text-white uppercase tracking-widest">
                          {notice.type.replace("_", " ")}
                        </span>
                        <button
                          onClick={() => resolveSystemNotice(notice.id)}
                          className="text-slate-700 hover:text-cyan-400 transition-colors"
                        >
                          <span className="material-icons text-sm">
                            check_circle
                          </span>
                        </button>
                      </div>
                      <p className="text-[11px] font-black text-white uppercase italic mb-1">
                        {notice.studentName}
                      </p>
                      <p className="text-[10px] text-slate-700 line-clamp-2 uppercase font-medium leading-tight mb-3">
                        {notice.description}
                      </p>
                      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="size-5 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[8px] font-black text-cyan-500">
                            {notice.requestedBy.charAt(0)}
                          </div>
                          <span className="text-[8px] font-black text-slate-600 uppercase">
                            {notice.requestedBy}
                          </span>
                        </div>
                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-tighter italic">
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020408]/80 backdrop-blur-2xl p-4 animate-fade-in">
            <div className="card-sase w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border-slate-200 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
              {/* Header */}
              <div className="p-8 border-b border-slate-100 bg-white/[0.01] flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-widest flex items-center gap-3">
                    <span className="material-icons text-cyan-500 animate-pulse">
                      smart_toy
                    </span>
                    PROPUESTA DE DISTRIBUCIÓN{" "}
                    <span className="text-cyan-500/50">INTELIGENTE</span>
                  </h3>
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] mt-1">
                    ANÁLISIS ALGORÍTMICO BASADO EN PROMEDIO, GÉNERO Y DENSIDAD
                    OPERATIVA
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="px-4 py-2 bg-white/5 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest block">
                      Nuevos Ingresos
                    </span>
                    <span className="text-xl font-black text-white tabular-nums">
                      {proposedStudents.length}{" "}
                      <span className="text-[10px] text-slate-700">
                        ALUMNOS
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Body: Comparative Stats */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Before */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <span className="material-icons text-slate-700">
                        history_toggle_off
                      </span>
                      <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">
                        ESTADO DE CARGA ACTUAL
                      </h4>
                    </div>
                    <div className="space-y-4">
                      {distributionAnalysis.before
                        .filter((g) => g.count > 0)
                        .map((group) => (
                          <div
                            key={group.groupId}
                            className="bg-white/[0.02] p-4 rounded-2xl border border-slate-100 opacity-40 hover:opacity-60 transition-opacity"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-black text-white italic tracking-tighter">
                                {group.groupId}
                              </span>
                              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                                {group.count}{" "}
                                <span className="text-[8px]">EXPEDIENTES</span>
                              </span>
                            </div>
                            <div className="flex gap-6 mt-2">
                              <div className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                                PROMEDIO:{" "}
                                <span className="text-white">
                                  {group.avgGpa.toFixed(1)}
                                </span>
                              </div>
                              <div className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                                BALANCE (F):{" "}
                                <span className="text-white">
                                  {(
                                    (group.femaleCount / group.count) *
                                    100
                                  ).toFixed(0)}
                                  %
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* After (Proposal) */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="material-icons text-cyan-500">
                          dynamic_form
                        </span>
                        <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em]">
                          PROYECCIÓN DE EQUILIBRIO IA
                        </h4>
                      </div>
                      <div className="group relative">
                        <span className="material-icons text-slate-700 text-sm cursor-help hover:text-cyan-400 transition-colors">
                          help_outline
                        </span>
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-[#0b0e14]/90 backdrop-blur-xl border border-slate-200 rounded-xl text-[9px] text-slate-600 opacity-0 pointer-events-none group-hover:opacity-100 transition-all z-50 shadow-2xl">
                          Nuestro motor de IA analiza el promedio de grado y la
                          balance de género para optimizar la cohesión del
                          grupo.
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
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
                              className="bg-cyan-500/[0.03] p-5 rounded-2xl border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.05)] group/prop"
                            >
                              <div className="flex justify-between items-center mb-4">
                                <span className="font-black text-white text-xl italic tracking-tighter group-hover/prop:text-cyan-400 transition-colors">
                                  {group.groupId}
                                </span>
                                <div className="flex items-center gap-3">
                                  {countDiff > 0 && (
                                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-1 rounded-2xl border border-emerald-500/30 animate-pulse">
                                      +{countDiff} ASIGNADOS
                                    </span>
                                  )}
                                  <span className="text-xs font-black text-slate-900 tracking-widest uppercase">
                                    {group.count} ALUMNOS
                                  </span>
                                </div>
                              </div>

                              {/* Visual Bars for Balance */}
                              <div className="space-y-4">
                                {/* GPA Bar */}
                                <div>
                                  <div className="flex justify-between text-[9px] font-black text-slate-700 uppercase tracking-widest mb-1.5">
                                    <span>CALIDAD ACADÉMICA (PROMEDIO)</span>
                                    <span className="text-cyan-500">
                                      {group.avgGpa.toFixed(1)}
                                    </span>
                                  </div>
                                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <svg
                                      width={`${(group.avgGpa / 10) * 100}%`}
                                      className="h-full transition-all duration-1000"
                                    >
                                      <rect
                                        width="100%"
                                        height="100%"
                                        className="fill-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                      />
                                    </svg>
                                  </div>
                                </div>
                                {/* Gender Bar */}
                                <div>
                                  <div className="flex justify-between text-[9px] font-black text-slate-700 uppercase tracking-widest mb-1.5">
                                    <span>ESTRUCTURA DE GÉNERO (BALANCE)</span>
                                    <span className="text-white">
                                      {(
                                        (group.femaleCount / group.count) *
                                        100
                                      ).toFixed(0)}
                                      % F /{" "}
                                      {(
                                        (group.maleCount / group.count) *
                                        100
                                      ).toFixed(0)}
                                      % M
                                    </span>
                                  </div>
                                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                                    <svg
                                      width={`${(group.femaleCount / group.count) * 100}%`}
                                      className="h-full transition-all duration-1000"
                                    >
                                      <rect
                                        width="100%"
                                        height="100%"
                                        className="fill-pink-500/80"
                                      />
                                    </svg>
                                    <svg
                                      width={`${(group.maleCount / group.count) * 100}%`}
                                      className="h-full transition-all duration-1000"
                                    >
                                      <rect
                                        width="100%"
                                        height="100%"
                                        className="fill-blue-500/80"
                                      />
                                    </svg>
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
              <div className="p-6 border-t border-slate-100 bg-white/[0.01] flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowDistributionModal(false);
                    setProposedStudents([]);
                  }}
                  title="Cancelar y descartar la propuesta de distribución"
                  aria-label="Abortar operación de distribución"
                  className="px-6 py-4 text-[10px] font-black text-slate-700 hover:text-white uppercase tracking-[0.2em] transition-colors"
                >
                  ABORTAR OPERACIÓN
                </button>
                <button
                  onClick={confirmDistribution}
                  title="Confirmar y aplicar la distribución de alumnos en los grupos propuestos"
                  aria-label="Confirmar y ejecutar asignación por IA"
                  className="btn-sase-primary px-10 py-4 text-[10px] font-black flex items-center gap-3 group"
                >
                  <span className="material-icons group-hover:rotate-12 transition-transform">
                    verified
                  </span>
                  EJECUTAR DISTRIBUCIÓN IA
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student List */}
        <div
          id="secretaria-list"
          className="card-sase overflow-hidden flex flex-col min-h-[600px] border-slate-200"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.01]">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="material-icons text-cyan-500 text-sm">
                  folder_shared
                </span>
                DIRECTORIO ESTUDIANTIL{" "}
                <span className="text-slate-700">/ INSTITUCIONAL</span>
              </h3>
              <p className="text-[9px] font-medium text-slate-700 uppercase tracking-widest mt-0.5">
                Base de datos centralizada de expedientes electrónicos
              </p>
            </div>

            <div
              id="secretaria-search"
              className="relative w-full md:w-[450px] group"
            >
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 material-icons group-focus-within:text-cyan-500 transition-colors">
                search
              </span>
              <input
                type="text"
                placeholder="FILTRAR POR NOMBRE O MATRÍCULA..."
                className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-xs font-black text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/40 focus:bg-white/[0.05] transition-all uppercase tracking-widest"
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

          <div className="flex-1 overflow-x-auto custom-scrollbar">
            {students.length === 0 ? (
              <div className="py-32 text-center">
                <span className="material-icons text-7xl text-white/5 mb-6 animate-pulse">
                  cloud_off
                </span>
                <p className="text-slate-700 font-black uppercase text-[10px] tracking-[0.3em] italic">
                  Sincronización requerida: Base de datos vacía
                </p>
              </div>
            ) : (
              <>
                {/* --- MÓVIL: VISTA DE TARJETAS (Renderizado Estratégico) --- */}
                <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="card-sase p-5 bg-slate-100 border-slate-200 hover:border-cyan-500/30 transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="size-14 rounded-2xl border border-slate-200 shadow-xl shadow-black/5"
                        />
                        <div className="flex-1">
                          <h4 className="font-black text-white uppercase italic text-sm leading-tight">
                            {student.name}
                          </h4>
                          <p className="text-[10px] font-black text-cyan-500/60 uppercase tracking-widest mt-1">
                            {student.group} • {student.matricula}
                          </p>
                        </div>
                        <span
                          className={`size-3 rounded-full animate-pulse ${
                            student.caseState === CaseState.CERRADO
                              ? "bg-emerald-500"
                              : student.caseState === CaseState.OBSERVADO
                                ? "bg-cyan-500"
                                : "bg-rose-500"
                          }`}
                        ></span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowAdvancedPanel(true);
                          }}
                          className="aspect-square rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex flex-col items-center justify-center gap-1"
                        >
                          <span className="material-icons text-xl">
                            psychology
                          </span>
                          <span className="text-[7px] font-black uppercase">
                            IA
                          </span>
                        </button>
                        <button
                          onClick={() =>
                            printDocument({
                              type: "BITACORA" as any,
                              studentId: student.id,
                              data: student,
                            })
                          }
                          className="aspect-square rounded-xl bg-white/5 border border-slate-200 text-slate-600 flex flex-col items-center justify-center gap-1"
                        >
                          <span className="material-icons text-xl">
                            badge
                          </span>
                          <span className="text-[7px] font-black uppercase">
                            CRED
                          </span>
                        </button>
                        <button
                          onClick={() =>
                            printDocument({
                              type: "BITACORA" as any,
                              studentId: student.id,
                              data: student,
                            })
                          }
                          className="aspect-square rounded-xl bg-white/5 border border-slate-200 text-slate-600 flex flex-col items-center justify-center gap-1"
                        >
                          <span className="material-icons text-xl">
                            assignment
                          </span>
                          <span className="text-[7px] font-black uppercase">
                            DOCS
                          </span>
                        </button>
                        <button
                          onClick={() => handleEdit(student.id)}
                          className="aspect-square rounded-xl bg-white/5 border border-slate-200 text-slate-600 flex flex-col items-center justify-center gap-1"
                        >
                          <span className="material-icons text-xl">
                            manage_search
                          </span>
                          <span className="text-[7px] font-black uppercase">
                            MOD
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* --- WEB/DESKTOP: VISTA DE TABLA (Renderizado Robusto) --- */}
                <table className="hidden md:table w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-slate-100">
                      <th className="px-8 py-6 text-[9px] font-black text-slate-700 uppercase tracking-[0.25em]">
                        EXPEDIENTE / IDENTIDAD
                      </th>
                      <th className="px-8 py-6 text-[9px] font-black text-slate-700 uppercase tracking-[0.25em]">
                        ESTRUCTURA ACADÉMICA
                      </th>
                      <th className="px-8 py-6 text-[9px] font-black text-slate-700 uppercase tracking-[0.25em]">
                        ESTADO DE CONTROL
                      </th>
                      <th className="px-8 py-6 text-[9px] font-black text-slate-700 uppercase tracking-[0.25em]">
                        INFORMACIÓN DE TUTORÍA
                      </th>
                      <th className="px-8 py-6 text-[9px] font-black text-slate-700 uppercase tracking-[0.25em] text-center">
                        ACCIONES DE CONTROL
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {students.map((student) => (
                      <tr
                        key={student.id}
                        className="student-row hover:bg-cyan-500/[0.02] transition-all duration-300 group/row border-transparent border-l-2 hover:border-cyan-500/40"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img
                                src={student.avatar}
                                alt={`Expediente de ${student.name}`}
                                title={`Avatar de ${student.name}`}
                                className="size-11 rounded-xl border border-slate-200 group-hover/row:border-cyan-500/50 transition-all shadow-xl"
                              />
                              <div className="absolute -bottom-1 -right-1 size-3 bg-emerald-500 border-2 border-[#020408] rounded-full"></div>
                            </div>
                            <div>
                              <span className="block font-black text-white uppercase italic text-sm tracking-tight group-hover/row:text-cyan-400 transition-colors">
                                {student.name}
                              </span>
                              <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest mt-0.5 block">
                                SASE-ID: {student.id.substring(0, 8)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-black text-white text-sm italic tracking-tighter">
                              {student.group}
                            </span>
                            <span className="font-black text-cyan-600/60 text-[10px] uppercase tabular-nums tracking-widest">
                              {student.matricula}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-[10px] font-black border uppercase tracking-widest ${
                              student.caseState === CaseState.CERRADO
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : student.caseState === CaseState.OBSERVADO
                                  ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
                                  : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            }`}
                          >
                            <span className="size-1.5 rounded-full bg-current animate-pulse"></span>
                            {CaseLabels[student.caseState]}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          {editingId === student.id ? (
                            <div className="card-sase p-5 absolute z-20 w-[320px] -translate-x-12 -translate-y-4 animate-fade-in-up shadow-2xl shadow-black border-cyan-500/40 ring-1 ring-cyan-500/20">
                              <h4 className="text-[10px] font-black text-cyan-500 uppercase mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                                <span className="material-icons text-sm">
                                  shield_person
                                </span>
                                EXPEDIENTE DE TUTORÍA
                              </h4>
                              <div className="space-y-3">
                                <p className="text-xs font-black text-white uppercase italic">
                                  {student.guardianInfo?.name}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase">
                                  <span className="material-icons text-sm text-cyan-500">
                                    call
                                  </span>
                                  {student.guardianInfo?.phonePrimary}
                                </div>
                                <p className="text-[9px] font-black text-slate-700 italic leading-tight uppercase">
                                  {student.guardianInfo?.address ||
                                    "Domicilio en reserva institucional"}
                                </p>
                              </div>
                              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                                <button
                                  onClick={() => setEditingId(null)}
                                  title="Cerrar vista de expediente de tutoría"
                                  aria-label="Cerrar detalles de tutoría"
                                  className="text-[9px] font-black text-slate-700 hover:text-white uppercase tracking-widest transition-colors"
                                >
                                  CERRAR
                                </button>
                                <button
                                  onClick={() => handleSaveAudit(student.id)}
                                  title="Confirmar revisión y auditar este expediente"
                                  aria-label="Auditar registro de alumno"
                                  className="btn-sase-primary px-4 py-2 text-[9px] font-black"
                                >
                                  AUDITAR REGISTRO
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-700">
                              <span className="material-icons text-[18px]">
                                lock_person
                              </span>
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">
                                CONFIDENCIAL
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowAdvancedPanel(true);
                              }}
                              className="size-10 rounded-xl bg-white/5 border border-slate-200 text-slate-600 hover:text-cyan-500 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all flex items-center justify-center group/btn"
                              title="Despliegue de IA: Análisis Avanzado del Alumno"
                              aria-label="Ejecutar análisis predictivo"
                            >
                              <span className="material-icons text-[20px] group-hover/btn:scale-110 transition-transform">
                                psychology
                              </span>
                            </button>

                            {/* BOTÓN CREDENCIAL */}
                            <button
                              onClick={() =>
                                printDocument({
                                  type: "BITACORA" as any,
                                  studentId: student.id,
                                  data: student,
                                })
                              }
                              className="size-10 rounded-xl bg-white/5 border border-slate-200 text-slate-600 hover:text-cyan-500 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all flex items-center justify-center group/btn"
                              title="Generar Credencial Institucional"
                            >
                              <span className="material-icons text-[20px] group-hover/btn:scale-110 transition-transform">
                                badge
                              </span>
                            </button>

                            {/* BOTÓN INSCRIPCIÓN */}
                            <button
                              onClick={() =>
                                printDocument({
                                  type: "BITACORA" as any,
                                  studentId: student.id,
                                  data: student,
                                })
                              }
                              className="size-10 rounded-xl bg-white/5 border border-slate-200 text-slate-600 hover:text-cyan-500 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all flex items-center justify-center group/btn"
                              title="Ver Formulario de Inscripción"
                            >
                              <span className="material-icons text-[20px] group-hover/btn:scale-110 transition-transform">
                                assignment
                              </span>
                            </button>

                            <button
                              onClick={() => handleEdit(student.id)}
                              className={`size-10 rounded-xl border transition-all flex items-center justify-center group/btn ${
                                editingId === student.id
                                  ? "bg-cyan-500 text-white border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                                  : "bg-white/5 border-slate-200 text-slate-600 hover:text-cyan-400 hover:border-cyan-400/30"
                              }`}
                              title={
                                editingId === student.id
                                  ? "Cerrar Expediente"
                                  : "Modificar Expediente"
                              }
                              aria-label={
                                editingId === student.id
                                  ? "Cerrar Expediente"
                                  : "Modificar Expediente"
                              }
                            >
                              <span className="material-icons text-[20px] group-hover/btn:scale-110 transition-transform">
                                {editingId === student.id
                                  ? "visibility_off"
                                  : "manage_search"}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020408]/90 backdrop-blur-2xl p-4 animate-fade-in">
            <div className="card-sase w-full max-w-lg overflow-hidden flex flex-col border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)] animate-scale-in">
              <div className="p-8 bg-emerald-500/[0.03] border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-widest flex items-center gap-3">
                    <span className="material-icons text-emerald-500 animate-pulse">
                      bolt
                    </span>
                    ACCESO <span className="text-emerald-500">RELÁMPAGO</span>
                  </h3>
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] mt-1">
                    PROTOCOLO DE REGISTRO EXPRESS - CONTROL DE ENTRADA
                  </p>
                </div>
                <button
                  onClick={() => setShowQuickAccess(false)}
                  title="Cerrar panel de acceso relámpago"
                  aria-label="Cerrar panel emergente"
                  className="size-10 rounded-xl bg-white/5 border border-slate-200 text-slate-700 hover:text-white hover:bg-rose-500/20 transition-all flex items-center justify-center"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 material-icons group-focus-within:text-emerald-500 transition-colors">
                    search
                  </span>
                  <input
                    autoFocus
                    type="text"
                    placeholder="INGRESAR NOMBRE O MATRÍCULA..."
                    title="Búsqueda rápida de alumnos"
                    aria-label="Búsqueda rápida de alumnos"
                    className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-5 pl-14 pr-4 text-xs font-black text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 focus:bg-white/[0.05] transition-all uppercase tracking-widest"
                    value={quickSearch}
                    onChange={(e) => setQuickSearch(e.target.value)}
                  />
                </div>

                <div className="max-h-[350px] overflow-y-auto space-y-3 custom-scrollbar pr-2">
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
                          className="p-4 bg-white/[0.02] border border-slate-100 rounded-2xl hover:bg-white/[0.04] hover:border-emerald-500/30 transition-all flex justify-between items-center group/item"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={student.avatar}
                              alt={`Avatar de ${student.name}`}
                              title={`Avatar de ${student.name}`}
                              className="size-11 rounded-xl border border-slate-200 group-hover/item:border-emerald-500/50 transition-colors"
                            />
                            <div>
                              <p className="text-xs font-black text-white uppercase italic leading-tight group-hover/item:text-emerald-400">
                                {student.name}
                              </p>
                              <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-1">
                                {student.group}{" "}
                                <span className="text-emerald-500/40">//</span>{" "}
                                {student.matricula}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                handleQuickRegister(student, "NO_CREDENCIAL")
                              }
                              title="Registrar entrada sin credencial (Incidencia automática)"
                              aria-label={`Registrar entrada sin credencial para ${student.name}`}
                              className="px-4 py-2.5 bg-rose-500/10 text-rose-500 rounded-xl text-[9px] font-black uppercase border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-xl shadow-black/5 active:scale-95"
                            >
                              S/ CRED
                            </button>
                            <button
                              onClick={() =>
                                handleQuickRegister(student, "RETARDO")
                              }
                              title="Registrar retardo oficial (Incidencia automática)"
                              aria-label={`Registrar retardo para ${student.name}`}
                              className="px-4 py-2.5 bg-amber-500/10 text-amber-500 rounded-xl text-[9px] font-black uppercase border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all shadow-xl shadow-black/5 active:scale-95"
                            >
                              RETARDO
                            </button>
                          </div>
                        </div>
                      ))}

                  {quickSearch.length >= 2 &&
                    students.filter(
                      (s) =>
                        s.name
                          .toLowerCase()
                          .includes(quickSearch.toLowerCase()) ||
                        s.matricula.includes(quickSearch),
                    ).length === 0 && (
                      <p className="text-center py-8 text-[10px] font-black text-slate-600 uppercase">
                        Alumno no encontrado
                      </p>
                    )}
                </div>
              </div>

              <div className="p-6 bg-white/[0.01] border-t border-slate-100 text-center">
                <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-relaxed italic">
                  Este registro genera una incidencia automática y permite el
                  paso inmediato al aula.
                  <br />
                  El flujo de entrada no se detiene.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
