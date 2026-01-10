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
    <div
      id="ts-generator"
      className="bg-black/20 backdrop-blur-xl p-6 rounded-xl border border-white/10 shadow-lg"
    >
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-white">
        <span className="material-symbols-outlined text-orange-400">
          history_edu
        </span>
        Emitir Justificante Oficial
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
            Alumno
          </label>
          <select
            className="w-full bg-black/40 border border-white/10 rounded-md p-2 text-sm text-white focus:border-orange-500/50 outline-none"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="" className="text-gray-500">
              Seleccione alumno...
            </option>
            {students.map((s) => (
              <option key={s.id} value={s.id} className="text-black">
                {s.name} - {s.group}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Desde
            </label>
            <input
              type="date"
              className="w-full bg-black/40 border border-white/10 rounded-md p-2 text-sm text-white focus:border-orange-500/50 outline-none scheme-dark"
              value={dates.start}
              onChange={(e) => setDates({ ...dates, start: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Hasta
            </label>
            <input
              type="date"
              className="w-full bg-black/40 border border-white/10 rounded-md p-2 text-sm text-white focus:border-orange-500/50 outline-none scheme-dark"
              value={dates.end}
              onChange={(e) => setDates({ ...dates, end: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
            Motivo
          </label>
          <select
            className="w-full bg-black/40 border border-white/10 rounded-md p-2 text-sm text-white focus:border-orange-500/50 outline-none"
            value={reason}
            onChange={(e) => setReason(e.target.value as any)}
          >
            <option value="Médico" className="text-black">
              Médico
            </option>
            <option value="Social" className="text-black">
              Social / Familiar
            </option>
            <option value="Legal" className="text-black">
              Trámite Legal
            </option>
          </select>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-bold text-gray-400 uppercase">
              Observaciones
            </label>
            <VoiceInput onTranscript={handleVoiceInput} className="scale-75" />
          </div>
          <textarea
            className="w-full bg-black/40 border border-white/10 rounded-md p-2 text-sm h-20 text-white placeholder-gray-600 focus:border-orange-500/50 outline-none"
            placeholder="Detalles para el expediente..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          ></textarea>
        </div>
        <button
          onClick={handleGenerate}
          disabled={!selectedStudent}
          className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-lg hover:from-orange-500 hover:to-amber-500 shadow-lg shadow-orange-900/30 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generar y Timbrar
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-6">
          <div className="relative group p-2">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-orange-400/50 animate-spin-pause pointer-events-none"></div>
            <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none"></div>
            <div className="relative rounded-full overflow-hidden">
              <img
                src="/assets/branding/T.SOCIAL.png"
                alt="Trabajo Social Logo"
                className="w-24 h-24 object-contain drop-shadow-2xl z-10 relative animate-float"
                style={{
                  filter: "drop-shadow(0 0 15px rgba(249,115,22,0.6))",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full animate-shine-sweep pointer-events-none z-20"></div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <h1
              id="ts-header"
              className="text-white text-3xl md:text-5xl font-black tracking-tight"
              style={{ textShadow: "0 0 20px rgba(249,115,22,0.6)" }}
            >
              Trabajo Social
            </h1>
            <p className="text-orange-200 text-lg font-medium tracking-wide">
              Gestión de Justificantes y Estudios Socioeconómicos
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <JustificanteGenerator />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg">
            <h3 className="font-bold text-lg mb-4 text-white">
              Historial de Justificantes
            </h3>
            {recentJustificantes.length === 0 ? (
              <p className="text-sm text-text-secondary">
                No hay justificantes recientes.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-2">Folio</th>
                      <th className="px-4 py-2">Alumno</th>
                      <th className="px-4 py-2">Fechas</th>
                      <th className="px-4 py-2">Motivo</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {recentJustificantes.map((j) => (
                      <tr
                        key={j.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-400">
                          {j.folio}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-white">
                            {j.studentName}
                          </div>
                          <div className="text-xs text-gray-400">{j.group}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-300">
                          {j.startDate} al {j.endDate}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full bg-orange-900/30 text-orange-200 border border-orange-500/20 text-xs font-bold">
                            {j.reason}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <PrintButtons compact />
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
