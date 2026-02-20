import React, { useState } from "react";
import { useApp } from "../../store";
import { PrintButtons } from "../PrintButtons";
import { VoiceInput } from "../VoiceInput";
import toast from "react-hot-toast";

// -- COMPONENT: Justificante Generator (Trabajo Social) --
const JustificanteGenerator = () => {
  const { students, addJustificante, addIncident } = useApp();
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [isDistancia, setIsDistancia] = useState(false);
  const [dates, setDates] = useState({ start: "", end: "" });
  const [reason, setReason] = useState<"Médico" | "Social" | "Legal">("Médico");
  const [desc, setDesc] = useState("");

  const handleGenerate = () => {
    if (!selectedStudent || !dates.start) return;

    // Si es a distancia, enviamos comunicación a docentes
    if (isDistancia) {
      addIncident(
        selectedStudent,
        "ACADEMICO" as any,
        `⚠️ AVISO INSTITUCIONAL: Alumno trabajando A DISTANCIA del ${dates.start} al ${dates.end || dates.start}. Favor de prever actividades por Classroom/SASE.`,
      );
      toast.success("Aviso de Trabajo a Distancia enviado a Docentes", {
        icon: "📧",
      });
    }

    addJustificante(selectedStudent, {
      startDate: dates.start,
      endDate: dates.end || dates.start,
      reason,
      description: desc,
      issuedBy: "Trabajo Social",
    });
    // Reset
    setDates({ start: "", end: "" });
    setDesc("");
  };

  const handleVoiceInput = (text: string) => {
    setDesc((prev) => (prev ? `${prev} ${text}` : text));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <span className="material-symbols-outlined text-orange-600">
          history_edu
        </span>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
          Emisión de Justificante
        </h3>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
            Alumno / Estudiante
          </label>
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10 outline-none transition-all"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">Seleccione un alumno...</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} - {s.group}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 outline-none transition-all"
              value={dates.start}
              onChange={(e) => setDates({ ...dates, start: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
              Fecha Término
            </label>
            <input
              type="date"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 outline-none transition-all"
              value={dates.end}
              onChange={(e) => setDates({ ...dates, end: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
            Tipo de Motivo
          </label>
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10 outline-none transition-all"
            value={reason}
            onChange={(e) => setReason(e.target.value as any)}
          >
            <option value="Médico">Motivo Médico</option>
            <option value="Social">Motivo Familiar / Social</option>
            <option value="Legal">Trámite Legal u Oficial</option>
          </select>
        </div>

        <div
          className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl mb-4 group cursor-pointer"
          onClick={() => setIsDistancia(!isDistancia)}
        >
          <div
            className={`size-6 rounded-lg border-2 flex items-center justify-center transition-all ${isDistancia ? "bg-blue-600 border-blue-600" : "border-blue-300"}`}
          >
            {isDistancia && (
              <span className="material-symbols-outlined text-white text-sm">
                check
              </span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-blue-800 uppercase tracking-widest">
              Modalidad a Distancia
            </p>
            <p className="text-[10px] text-blue-600 font-bold uppercase transition-opacity">
              Notificar a docentes automáticamente
            </p>
          </div>
          <span className="material-symbols-outlined text-blue-400 group-hover:rotate-12 transition-transform">
            cloud_sync
          </span>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5 ml-1">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">
              Observaciones
            </label>
            <VoiceInput
              onTranscript={handleVoiceInput}
              className="scale-75 origin-right"
            />
          </div>
          <textarea
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm h-24 text-slate-800 placeholder-slate-400 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10 outline-none resize-none transition-all"
            placeholder="Documentación presentada, folio médico, etc..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          ></textarea>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!selectedStudent}
          className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 transition-all active:scale-[0.98] disabled:opacity-40 disabled:grayscale uppercase tracking-widest text-xs flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">
            verified
          </span>
          REGISTRAR Y TIMBRAR JUSTIFICANTE
        </button>
      </div>
    </div>
  );
};

export const DashboardTrabajoSocial = () => {
  const { students } = useApp();
  const [activeTab, setActiveTab] = useState<
    "justificantes" | "casos" | "comunidad"
  >("justificantes");

  const recentJustificantes = students
    .flatMap((s) =>
      s.justificantes.map((j) => ({
        ...j,
        studentName: s.name,
        group: s.group,
      })),
    )
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));

  // Alumnos con patrón de falta (más de 3 faltas en el historial de incidentes)
  const dropoutRisk = students.filter(
    (s) =>
      s.incidents.filter((i) => i.type === "Asistencia / Falta").length >= 3,
  );

  // Estadísticas de Comunidad (Socioeconómicas)
  const calculateCommunityAnalysis = () => {
    const total = students.length || 1;
    const stats = {
      nuclear: students.filter(
        (s) => s.socioeconomicData?.familyType === "Nuclear",
      ).length,
      mono: students.filter(
        (s) => s.socioeconomicData?.familyType === "Monoparental",
      ).length,
      internet: students.filter((s) => s.socioeconomicData?.internetAccess)
        .length,
      lowIncome: students.filter(
        (s) => s.socioeconomicData?.incomeLevel === "Bajo",
      ).length,
    };

    return {
      ...stats,
      internetPct: Math.round((stats.internet / total) * 100),
      vulnerabilityPct: Math.round(
        ((stats.mono + stats.lowIncome) / (total * 2)) * 100,
      ),
    };
  };

  const communityAnalysis = calculateCommunityAnalysis();

  return (
    <div className="flex-1 w-full space-y-8 animate-fade-in custom-scrollbar overflow-y-auto h-full p-2">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden hidden md:block">
            <div className="absolute top-0 right-0 w-1 h-full bg-orange-600"></div>
            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
              <span className="material-symbols-outlined text-3xl">
                diversity_3
              </span>
            </div>
          </div>
          <div>
            <h2
              id="ts-header"
              className="text-3xl font-black text-slate-800 tracking-tight"
            >
              Trabajo Social
            </h2>
            <div className="flex items-center gap-3 mt-1 text-xs font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5 text-orange-700">
                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                Atención Socioeducativa
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 uppercase">Plantel ESD 310</span>
            </div>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 shadow-inner border border-slate-200">
          <button
            onClick={() => setActiveTab("justificantes")}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === "justificantes" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Justificantes
          </button>
          <button
            onClick={() => setActiveTab("casos")}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === "casos" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Riesgos ({dropoutRisk.length})
          </button>
          <button
            onClick={() => setActiveTab("comunidad")}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === "comunidad" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Análisis de Comunidad
          </button>
        </div>
      </div>

      {activeTab === "justificantes" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div id="ts-form-justificante" className="lg:col-span-1">
            <JustificanteGenerator />
          </div>

          <div className="lg:col-span-2">
            <div
              id="ts-history"
              className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-600 text-[20px]">
                    inventory
                  </span>
                  Historial de Justificantes Emitidos
                </h3>
              </div>

              {recentJustificantes.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 gap-3 grayscale opacity-40">
                  <span className="material-symbols-outlined text-5xl">
                    folder_off
                  </span>
                  <p className="text-sm font-black uppercase tracking-widest">
                    Sin actividad reciente
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-black border-b border-slate-100">
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Alumno</th>
                        <th className="px-6 py-4">Vigencia</th>
                        <th className="px-6 py-4">Motivo</th>
                        <th className="px-6 py-4 text-right">Docs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {recentJustificantes.map((j) => (
                        <tr
                          key={j.id}
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="px-6 py-5 font-mono text-[10px] text-slate-400 font-bold">
                            {j.folio}
                          </td>
                          <td className="px-6 py-5">
                            <p className="font-bold text-slate-800 text-sm group-hover:text-orange-700 transition-colors uppercase italic">
                              {j.studentName}
                            </p>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">
                              {j.group}
                            </p>
                          </td>
                          <td className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase">
                            {j.startDate}{" "}
                            <span className="text-slate-300 mx-1">/</span>{" "}
                            {j.endDate}
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                                j.reason === "Médico"
                                  ? "bg-blue-50 text-blue-700 border-blue-100"
                                  : j.reason === "Legal"
                                    ? "bg-red-50 text-red-700 border-red-100"
                                    : "bg-orange-50 text-orange-700 border-orange-100"
                              }`}
                            >
                              {j.reason}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <span className="material-symbols-outlined text-slate-300 group-hover:text-orange-600 transition-colors cursor-pointer">
                              print
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === "casos" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dropoutRisk.map((student) => (
            <div
              key={student.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-rose-500"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-lg">
                  {student.name.charAt(0)}
                </div>
                <span className="px-2 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  RIESGO DE DESERCIÓN
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1">
                {student.name}
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                {student.group} • {student.id.substring(0, 6)}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-rose-500 text-sm">
                    event_busy
                  </span>
                  <p className="text-xs text-slate-600 font-medium">
                    Patrón de inasistencia detectado (+3)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-sm">
                    home
                  </span>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">
                    Visita domiciliaria pendiente
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-black transition-all">
                  Programar Visita
                </button>
                <button className="px-3 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-all">
                  <span className="material-symbols-outlined text-sm">
                    call
                  </span>
                </button>
              </div>
            </div>
          ))}

          {dropoutRisk.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-30">
              <span className="material-symbols-outlined text-5xl mb-3">
                verified
              </span>
              <p className="text-sm font-black uppercase tracking-[0.2em]">
                Todos los expedientes están al corriente
              </p>
            </div>
          )}
        </div>
      ) : (
        /* TAB: ANÁLISIS DE COMUNIDAD (ESPECIAL) */
        <div className="space-y-8 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-3xl text-white shadow-xl shadow-orange-500/20">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">
                Familias Nucleares
              </p>
              <h4 className="text-4xl font-black">
                {communityAnalysis.nuclear}
              </h4>
              <p className="text-[9px] font-bold uppercase mt-2 bg-white/20 inline-block px-2 py-0.5 rounded-full">
                Predominante
              </p>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Familias Monoparentales
              </p>
              <h4 className="text-4xl font-black text-slate-800">
                {communityAnalysis.mono}
              </h4>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4">
                <div
                  className="bg-orange-500 h-full rounded-full"
                  style={{
                    width: `${Math.round((communityAnalysis.mono / (students.length || 1)) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Acceso a Internet
              </p>
              <h4 className="text-4xl font-black text-slate-800">
                {communityAnalysis.internetPct}%
              </h4>
              <p className="text-[9px] font-bold text-emerald-600 mt-2 uppercase">
                Conectividad Estable
              </p>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Índice de Vulnerabilidad
              </p>
              <h4 className="text-4xl font-black text-rose-600">
                {communityAnalysis.vulnerabilityPct}%
              </h4>
              <p className="text-[9px] font-bold text-rose-400 mt-2 uppercase tracking-tighter">
                Requiere Atención Social
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Análisis Predictivo IA */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-8xl">
                  psychology
                </span>
              </div>
              <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-orange-400">
                  auto_awesome
                </span>
                Análisis de Perfil Comunitario (IA)
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Basado en los estudios socioeconómicos capturados, la comunidad
                estudiantil del plantel 310 presenta un perfil de **clase
                media-baja** con un fuerte núcleo familiar. Se detecta un **
                {communityAnalysis.vulnerabilityPct}% de casos en situación de
                riesgo social** que podrían derivar en deserción escolar.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-xs font-bold text-orange-200">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                  Alta demanda de becas de transporte (Radio &gt; 5km)
                </li>
                <li className="flex items-center gap-3 text-xs font-bold text-orange-200">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                  Necesidad de talleres de convivencia monoparental
                </li>
              </ul>
            </div>

            {/* Generación de Reportes */}
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                <span className="material-symbols-outlined text-3xl">
                  analytics
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">
                Reportes de Trabajo Social
              </h3>
              <p className="text-xs text-slate-500 mb-6 max-w-xs">
                Genera el análisis estadístico completo de la comunidad para
                supervisión de zona.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    toast.success(
                      "Generando Estudio Socioeconómico Colectivo...",
                    )
                  }
                  className="px-6 py-3 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase hover:shadow-lg hover:shadow-orange-600/20 transition-all"
                >
                  Exportar Análisis de Comunidad
                </button>
                <button
                  onClick={() =>
                    toast.success("Imprimiendo Estadísticas Sociales...")
                  }
                  className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all font-symbols"
                >
                  <span className="material-symbols-outlined text-sm">
                    print
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
