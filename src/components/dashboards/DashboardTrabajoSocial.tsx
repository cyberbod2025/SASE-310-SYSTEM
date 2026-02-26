import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../store";
import { VoiceInput } from "../VoiceInput";
import { GenericActionModal } from "../GenericActionModal";
import toast from "react-hot-toast";

// -- ATOMIC COMPONENTS --

const SocialMetric = ({ label, value, icon, color, pct }: any) => {
  const colors: any = {
    orange: "text-orange-500 border-orange-500/20 bg-orange-500/5",
    blue: "text-blue-500 border-blue-500/20 bg-blue-500/5",
    rose: "text-rose-500 border-rose-500/20 bg-rose-500/5",
    indigo: "text-indigo-500 border-indigo-500/20 bg-indigo-500/5",
  };

  return (
    <div
      className={`card-sase p-6 border ${colors[color]} relative overflow-hidden group`}
    >
      <div className="flex justify-between items-center mb-4">
        <div
          className={`size-10 rounded-xl border ${colors[color]} flex items-center justify-center`}
        >
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        {pct && (
          <span className="text-[10px] font-black px-2 py-0.5 rounded border border-white/10 bg-white/5 text-slate-500 italic">
            {pct}% DEL_TOTAL
          </span>
        )}
      </div>
      <h4 className="text-3xl font-black text-white italic tracking-tighter mb-1 leading-none">
        {value}
      </h4>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
        {label}
      </p>

      {pct && (
        <div className="w-full bg-white/5 h-[2px] mt-4 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            className={`h-full bg-current ${colors[color].split(" ")[0]}`}
          />
        </div>
      )}
    </div>
  );
};

export const DashboardTrabajoSocial = () => {
  const { students, addJustificante, addIncident, printDocument } = useApp();
  const [activeTab, setActiveTab] = useState<
    "justificantes" | "riesgos" | "comunidad"
  >("justificantes");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Logic for Justificantes
  const [justForm, setJustForm] = useState({
    student: "",
    start: "",
    end: "",
    reason: "Médico" as any,
    desc: "",
    distal: false,
  });

  const handleGenerateJustificante = () => {
    if (!justForm.student || !justForm.start) return;

    if (justForm.distal) {
      addIncident(
        justForm.student,
        "ACADEMICO" as any,
        `⚠️ AVISO TS: Alumno a DISTANCIA del ${justForm.start} al ${justForm.end || justForm.start}.`,
      );
      toast.success("Notificación enviada a Docencia", { icon: "📧" });
    }

    addJustificante(justForm.student, {
      startDate: justForm.start,
      endDate: justForm.end || justForm.start,
      reason: justForm.reason,
      description: justForm.desc,
      issuedBy: "Trabajo Social",
    });

    toast.success("Justificante Timbrado con Éxito");
    setJustForm({ ...justForm, student: "", desc: "" });
  };

  const recentJustificantes = useMemo(
    () =>
      students
        .flatMap((s) =>
          s.justificantes.map((j) => ({
            ...j,
            studentName: s.name,
            group: s.group,
            studentId: s.id,
          })),
        )
        .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)),
    [students],
  );

  const dropoutRisk = students.filter(
    (s) =>
      s.incidents.filter((i) => i.type === "Asistencia / Falta").length >= 3,
  );

  const communityAnalysis = useMemo(() => {
    const total = students.length || 1;
    return {
      nuclear: students.filter(
        (s) => s.socioeconomicData?.familyType === "Nuclear",
      ).length,
      mono: students.filter(
        (s) => s.socioeconomicData?.familyType === "Monoparental",
      ).length,
      internet: Math.round(
        (students.filter((s) => s.socioeconomicData?.internetAccess).length /
          total) *
          100,
      ),
      vulnerability: Math.round(
        ((students.filter((s) => s.socioeconomicData?.incomeLevel === "Bajo")
          .length +
          students.filter(
            (s) => s.socioeconomicData?.familyType === "Monoparental",
          ).length) /
          (total * 2)) *
          100,
      ),
    };
  }, [students]);

  return (
    <div className="flex-1 min-h-screen p-6 lg:p-10 space-y-10 bg-transparent relative overflow-y-auto custom-scrollbar font-sans selection:bg-orange-500/30">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
        <div className="flex items-center gap-6">
          <div className="size-16 bg-[#0a0f18] border border-orange-500/30 rounded-2xl flex items-center justify-center text-orange-500 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <span className="material-symbols-outlined text-4xl">
              diversity_3
            </span>
            <motion.div
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-[1px] bg-orange-500/50"
            />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded text-[9px] font-black text-orange-400 uppercase tracking-widest">
                UNIT_03 // SOCIAL_CORE
              </span>
              <div className="size-1.5 bg-orange-600 rounded-full animate-ping"></div>
            </div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
              TRABAJO <span className="text-orange-500 italic">SOCIAL</span>
            </h2>
          </div>
        </div>

        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-inner">
          <button
            onClick={() => setActiveTab("justificantes")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === "justificantes" ? "bg-orange-600 text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
          >
            Justificantes
          </button>
          <button
            onClick={() => setActiveTab("riesgos")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === "riesgos" ? "bg-orange-600 text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
          >
            Riesgos ({dropoutRisk.length})
          </button>
          <button
            onClick={() => setActiveTab("comunidad")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === "comunidad" ? "bg-orange-600 text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
          >
            Análisis Comunidad
          </button>
        </div>
      </div>

      {activeTab === "justificantes" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* TERMINAL GENERATOR */}
          <div className="card-sase border-white/5 p-8 bg-[#0a0f18]/40 backdrop-blur-xl">
            <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.3em] mb-8 italic flex items-center gap-3">
              <span className="material-symbols-outlined text-xl">
                history_edu
              </span>
              EMISOR_JUSTIFICANTES
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">
                  OBJETIVO_ESTUDIANTE
                </label>
                <select
                  className="w-full bg-[#05070a] border border-white/10 rounded-xl p-4 text-xs text-white focus:border-orange-500/50 outline-none transition-all uppercase font-bold"
                  value={justForm.student}
                  title="Seleccionar alumno para justificante"
                  onChange={(e) =>
                    setJustForm({ ...justForm, student: e.target.value })
                  }
                >
                  <option value="">SELECCIONAR_TARGET...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.group}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">
                    INICIO
                  </label>
                  <input
                    type="date"
                    title="Fecha de inicio"
                    value={justForm.start}
                    onChange={(e) =>
                      setJustForm({ ...justForm, start: e.target.value })
                    }
                    className="w-full bg-[#05070a] border border-white/10 rounded-xl p-4 text-xs text-white focus:border-orange-500/50 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">
                    FIN
                  </label>
                  <input
                    type="date"
                    title="Fecha de fin"
                    value={justForm.end}
                    onChange={(e) =>
                      setJustForm({ ...justForm, end: e.target.value })
                    }
                    className="w-full bg-[#05070a] border border-white/10 rounded-xl p-4 text-xs text-white focus:border-orange-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">
                  NATURALEZA_DEL_MOTIVO
                </label>
                <select
                  className="w-full bg-[#05070a] border border-white/10 rounded-xl p-4 text-xs text-white focus:border-orange-500/50 outline-none transition-all uppercase font-bold"
                  value={justForm.reason}
                  title="Motivo del justificante"
                  onChange={(e) =>
                    setJustForm({ ...justForm, reason: e.target.value as any })
                  }
                >
                  <option value="Médico">MOTIVO_MÉDICO</option>
                  <option value="Social">MOTIVO_FAMILIAR</option>
                  <option value="Legal">TRÁMITE_LEGAL</option>
                </select>
              </div>

              <div
                className={`p-4 rounded-2xl border flex items-center gap-4 cursor-pointer transition-all ${justForm.distal ? "bg-orange-600/10 border-orange-500/30" : "bg-white/5 border-white/10 opacity-50"}`}
                onClick={() =>
                  setJustForm({ ...justForm, distal: !justForm.distal })
                }
              >
                <div
                  className={`size-6 rounded-lg border-2 flex items-center justify-center transition-all ${justForm.distal ? "bg-orange-500 border-orange-500" : "border-slate-600"}`}
                >
                  {justForm.distal && (
                    <span className="material-symbols-outlined text-white text-sm">
                      check
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">
                    TRABAJO_A_DISTANCIA
                  </p>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter italic">
                    NOTIFICAR_CUERPO_DOCENTE
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
                    OBSERVACIONES_CAMPO
                  </label>
                  <VoiceInput
                    onTranscript={(t) =>
                      setJustForm({
                        ...justForm,
                        desc: justForm.desc + " " + t,
                      })
                    }
                  />
                </div>
                <textarea
                  value={justForm.desc}
                  onChange={(e) =>
                    setJustForm({ ...justForm, desc: e.target.value })
                  }
                  placeholder="DATOS_ADICIONALES..."
                  className="w-full bg-[#05070a] border border-white/10 rounded-xl p-4 text-xs h-24 text-white resize-none outline-none focus:border-orange-500/50"
                />
              </div>

              <button
                onClick={handleGenerateJustificante}
                disabled={!justForm.student || !justForm.start}
                className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-orange-600/20 active:scale-95 transition-all disabled:grayscale disabled:opacity-40"
              >
                TIMBRAR_REGISTRO_OFICIAL
              </button>
            </div>
          </div>

          {/* HISTORY TABLE */}
          <div className="lg:col-span-2 card-sase border-white/5 bg-[#0a0f18]/20 flex flex-col h-full">
            <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3 italic">
                <span className="material-symbols-outlined text-orange-500">
                  inventory
                </span>
                HISTORIAL_DE_EMISIÓN_SINCRO
              </h3>
            </div>

            <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-slate-500 text-[9px] uppercase font-black border-b border-white/5 italic italic tracking-widest font-mono">
                    <th className="px-8 py-5">FOLIO_ID</th>
                    <th className="px-8 py-5">EXPEDIENTE</th>
                    <th className="px-8 py-5">VIGENCIA</th>
                    <th className="px-8 py-5">TIPO</th>
                    <th className="px-8 py-5 text-right">OPS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {recentJustificantes.map((j) => (
                    <tr
                      key={j.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-8 py-6 font-mono text-[10px] text-slate-500 font-bold">
                        {j.folio}
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-black text-white text-sm uppercase italic tracking-tighter group-hover:text-orange-400 transition-colors">
                          {j.studentName}
                        </p>
                        <p className="text-[9px] font-bold text-slate-600 uppercase mt-1">
                          {j.group}
                        </p>
                      </td>
                      <td className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase italic">
                        {j.startDate}{" "}
                        <span className="text-white/20 px-1">/</span>{" "}
                        {j.endDate}
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest italic group-hover:border-orange-500/40">
                          {j.reason}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() =>
                            printDocument({
                              type: "JUSTIFICANTE",
                              studentId: j.studentId,
                              data: j,
                            })
                          }
                          className="size-10 bg-white/5 hover:bg-orange-600 hover:text-white rounded-xl flex items-center justify-center transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">
                            print
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {recentJustificantes.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-20 text-center text-slate-700 font-black uppercase text-[10px] tracking-widest opacity-30 italic"
                      >
                        NO_DATA_STREAM_AVAILABLE
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "riesgos" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {dropoutRisk.map((s) => (
            <div
              key={s.id}
              className="card-sase p-8 border-rose-500/20 bg-rose-500/[0.02] group relative overflow-hidden border-l-4 border-l-rose-600"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="size-14 bg-[#0a0f18] border border-white/10 rounded-2xl flex items-center justify-center text-rose-500 text-2xl font-black italic">
                  {s.name.charAt(0)}
                </div>
                <span className="px-3 py-1 bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg animate-pulse">
                  ALERTA_DESERCIÓN
                </span>
              </div>

              <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-1">
                {s.name}
              </h3>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">
                FALTAS_DETECTADAS:{" "}
                {
                  s.incidents.filter((i) => i.type === "Asistencia / Falta")
                    .length
                }
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-rose-500 text-lg">
                    error
                  </span>
                  <p className="text-[10px] font-black text-slate-400 uppercase italic">
                    Patrón de inasistencia crítico
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-600 text-lg">
                    home_pin
                  </span>
                  <p className="text-[10px] font-black text-slate-600 uppercase italic">
                    Visita domiciliaria pendiente
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedStudentId(s.id);
                    setIsModalOpen(true);
                  }}
                  className="flex-1 py-3.5 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all active:scale-95"
                >
                  Programar Visita
                </button>
                <button
                  onClick={() =>
                    toast.success(
                      `Iniciando enlace telefónico con tutor de ${s.name}...`,
                      { icon: "📞" },
                    )
                  }
                  className="size-12 bg-white/5 border border-white/10 text-slate-500 rounded-2xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined">call</span>
                </button>
              </div>
            </div>
          ))}
          {dropoutRisk.length === 0 && (
            <div className="col-span-full py-40 text-center opacity-30 flex flex-col items-center gap-6">
              <span className="material-symbols-outlined text-6xl text-emerald-500">
                verified_user
              </span>
              <p className="text-[11px] font-black uppercase tracking-[0.5em] italic">
                NULL_RISK_DETECTED_IN_CORE
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "comunidad" && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <SocialMetric
              label="Familias Nucleares"
              value={communityAnalysis.nuclear}
              icon="family_restroom"
              color="indigo"
            />
            <SocialMetric
              label="Vulnerabilidad Social"
              value={`${communityAnalysis.vulnerability}%`}
              icon="priority_high"
              color="rose"
              pct={communityAnalysis.vulnerability}
            />
            <SocialMetric
              label="Acceso Conectividad"
              value={`${communityAnalysis.internet}%`}
              icon="wifi"
              color="blue"
              pct={communityAnalysis.internet}
            />
            <SocialMetric
              label="Crecimiento Social"
              value="+12"
              icon="trending_up"
              color="emerald"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card-sase p-10 bg-slate-900 border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-8xl text-orange-500">
                  online_prediction
                </span>
              </div>
              <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-6 flex items-center gap-4">
                <span className="material-symbols-outlined text-orange-500">
                  auto_awesome
                </span>
                SOCIAL_INSIGHT_IA
              </h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed uppercase italic max-w-lg mb-8">
                EL ANÁLISIS DE INTERACCIÓN SOCIOECONÓMICA DETECTA UN PERFIL DE
                COMUNIDAD CON FUERTE COHESIÓN FAMILIAR PERO BAJA CAPACIDAD
                TÉCNICA. SE RECOMIENDA PRIORIZAR EL PROGRAMA DE BECAS DE
                TRANSPORTE.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-orange-300 text-[10px] font-black uppercase tracking-widest">
                  <span className="size-1.5 bg-orange-500 rounded-full"></span>
                  ALTO IMPACTO EN MOVILIDAD GEOGRÁFICA
                </div>
                <div className="flex items-center gap-3 text-orange-300 text-[10px] font-black uppercase tracking-widest">
                  <span className="size-1.5 bg-orange-500 rounded-full"></span>
                  DEMANDA CRECIENTE DE APOYO PSICOPEDAGÓGICO
                </div>
              </div>
            </div>

            <div className="card-sase p-10 border-2 border-dashed border-white/5 flex flex-col flex-col items-center justify-center text-center group">
              <div className="size-20 bg-white/5 rounded-3xl flex items-center justify-center text-slate-600 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
                <span className="material-symbols-outlined text-4xl">
                  analytics
                </span>
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-2 italic italic">
                EXPORTAR_INTELIGENCIA_SOCIAL
              </h3>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-8 max-w-xs">
                GÉNERA EL REPORTE ESTADÍSTICO PARA SUPERVISIÓN DE ZONA
              </p>
              <button
                onClick={() =>
                  toast.success("Compilando Atlas Social del Plantel...")
                }
                className="px-10 py-4 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-600/20 hover:bg-orange-500 transition-all active:scale-95"
              >
                DESCARGAR_ESTADÍSTICA_GZ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA VISITAS */}
      <GenericActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Programar Visita de Campo"
        description="Coordinación de intervención domiciliaria"
        fields={[
          {
            name: "date",
            label: "FECHA_INTERVENCIÓN",
            type: "date",
            required: true,
          },
          {
            name: "objective",
            label: "OBJETIVOS_TÁCTICOS",
            type: "textarea",
            required: true,
          },
        ]}
        onSubmit={async () => {
          toast.success("Visita programada en Agenda TS");
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default DashboardTrabajoSocial;
