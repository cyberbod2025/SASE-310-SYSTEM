import React, { useState } from "react";
import { useApp } from "../../store";
import { PrintButtons } from "../PrintButtons";
import { VoiceInput } from "../VoiceInput";

// -- COMPONENT: Justificante Generator (Trabajo Social) --
const JustificanteGenerator = () => {
  const { students, addJustificante } = useApp();
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [dates, setDates] = useState({ start: "", end: "" });
  const [reason, setReason] = useState<"Médico" | "Social" | "Legal">("Médico");
  const [desc, setDesc] = useState("");

  const handleGenerate = () => {
    if (!selectedStudent || !dates.start) return;
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
  const recentJustificantes = students
    .flatMap((s) =>
      s.justificantes.map((j) => ({
        ...j,
        studentName: s.name,
        group: s.group,
      }))
    )
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));

  return (
    <div className="flex-1 w-full space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-orange-600"></div>
            <img
              src="/assets/branding/T.SOCIAL.png"
              alt="Trabajo Social"
              className="w-14 h-14 object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              Trabajo Social
            </h1>
            <div className="flex items-center gap-3 mt-1 text-xs font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5 text-orange-700">
                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                Atención Socioeducativa
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">
                Gestión de Inasistencias y Justificantes
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <JustificanteGenerator />
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-600 text-[20px]">
                  inventory
                </span>
                Historial de Justificantes Emitidos
              </h3>
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                {recentJustificantes.length} Registros totales
              </span>
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
                      <th className="px-6 py-4">Folio/ID</th>
                      <th className="px-6 py-4">Alumno/Estudiante</th>
                      <th className="px-6 py-4">Vigencia Oficial</th>
                      <th className="px-6 py-4">Motivo</th>
                      <th className="px-6 py-4 text-right">Documentos</th>
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
                          <div className="flex justify-end gap-1 scale-90 origin-right">
                            <PrintButtons compact />
                          </div>
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
    </div>
  );
};
