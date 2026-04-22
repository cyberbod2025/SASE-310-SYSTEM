import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../store";
import { GenericActionModal } from "../GenericActionModal";
import toast from "react-hot-toast";
import { GlassCard } from "../ui/GlassCard";

export const DashboardUDEII = () => {
  const { students, addIncident, updateBapInfo, printDocument } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const studentsWithBAP = useMemo(
    () => students.filter((s) => s.bapInfo?.hasBAP),
    [students],
  );

  const handleUpdateAdjustment = async (data: any) => {
    if (!selectedStudent) return;
    await updateBapInfo(selectedStudent.id, {
      ...selectedStudent.bapInfo,
      accommodations: [data.adjustment],
    });
    toast.success(`Ajuste razonable actualizado para ${selectedStudent.name}`);
    setModalOpen(false);
  };

  return (
    <GlassCard className="flex-1 min-h-screen p-6 lg:p-10 space-y-10 bg-[#0B1120]/60 relative overflow-y-auto custom-scrollbar font-sans selection:bg-sase-info/30">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-100 pb-10">
        <div className="flex items-center gap-6">
          <div className="size-16 bg-[#0a0f18] border border-sase-info/30 rounded-2xl flex items-center justify-center text-sase-info shadow-[0_0_20px_rgba(99,102,241,0.15)] relative overflow-hidden backdrop-blur-xl">
            <span className="material-icons text-4xl">
              accessibility_new
            </span>
            <motion.div
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-[1px] bg-sase-info/50 shadow-[0_0_10px_#6366f1]"
            />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2 py-0.5 bg-sase-info/10 border border-sase-info/20 rounded text-[9px] font-black text-sase-info uppercase tracking-widest">
                UNIT_04 // INCLUSION_CORE
              </span>
              <div className="size-1.5 bg-sase-info rounded-full animate-pulse shadow-[0_0_8px_#6366f1]"></div>
            </div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
              CENTRO <span className="text-sase-info italic">UDEII</span>
            </h2>
          </div>
        </div>

        <button
          onClick={() => toast.success("Generando Reporte de Inclusión...")}
          className="px-8 py-3.5 bg-sase-info text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-sase-info/20 hover:bg-sase-info transition-all active:scale-95 flex items-center gap-3"
        >
          <span className="material-icons text-xl">file_save</span>
          Generar reporte BAP
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* BAP MONITOR TABLE */}
        <div className="xl:col-span-2 card-sase border-slate-100 bg-[#0a0f18]/40 overflow-hidden flex flex-col group">
          <div className="p-6 border-b border-slate-100 bg-white/[0.01] flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] flex items-center gap-3 italic">
              <span className="material-icons text-sase-info">
                monitoring
              </span>
              MONITOR DE BARRERAS (BAP)
            </h3>
            <span className="px-3 py-1 bg-white/5 rounded-2xl text-[9px] font-black text-slate-700">
              {studentsWithBAP.length} casos activos
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-slate-700 text-[9px] uppercase font-black border-b border-slate-100 italic">
                  <th className="px-8 py-5">Expediente</th>
                  <th className="px-8 py-5">ESTUDIANTE</th>
                  <th className="px-8 py-5">Condicion BAP</th>
                  <th className="px-8 py-5">AJUSTES</th>
                  <th className="px-8 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {studentsWithBAP.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-sase-info/[0.02] transition-colors group"
                  >
                    <td className="px-8 py-6 font-mono text-[10px] text-slate-600">
                      {s.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-white text-sm uppercase italic tracking-tighter group-hover:text-sase-info transition-colors">
                        {s.name}
                      </p>
                      <p className="text-[9px] font-bold text-slate-600 uppercase mt-1">
                        {s.group}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-2 py-1 bg-sase-info/5 border border-sase-info/20 text-[9px] font-black text-sase-info rounded uppercase">
                        {s.bapInfo.diagnosisPrivate || "Inclusión Genérica"}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-[10px] text-slate-600 font-medium italic line-clamp-1">
                        {s.bapInfo.accommodations.join(", ") ||
                          "Sin ajustes registrados"}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedStudent(s);
                          setModalOpen(true);
                        }}
                        className="size-10 bg-white/5 hover:bg-sase-info hover:text-white rounded-xl flex items-center justify-center transition-all group-hover:border-sase-info/30 border border-transparent active:scale-90"
                      >
                        <span className="material-icons text-lg">
                          edit_note
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          printDocument({
                            type: "BITACORA",
                            studentId: s.id,
                            data: {
                              ...s.bapInfo,
                              accommodations: s.bapInfo.accommodations || [],
                              details:
                                "Estrategias de intervención para barreras identificadas.",
                            },
                          })
                        }
                        className="size-10 bg-white/5 hover:bg-sase-info hover:text-white rounded-xl flex items-center justify-center transition-all border border-transparent active:scale-90"
                      >
                        <span className="material-icons text-lg">
                          print
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDEBAR TOOLS */}
        <div className="space-y-8">
          <div className="card-sase p-8 border-sase-info/20 bg-sase-info/[0.02] relative overflow-hidden group">
            <h3 className="text-[10px] font-black text-sase-info uppercase tracking-[0.4em] mb-8 italic flex items-center gap-3">
              <span className="size-2 bg-sase-info rounded-full shadow-[0_0_8px_#6366f1]"></span>
              Herramientas UDEII
            </h3>

            <div className="space-y-4">
              <button
                onClick={() => toast("Abriendo Guia de Ajustes Razonables...")}
                className="w-full p-5 bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-5 hover:bg-white/10 transition-all text-left"
              >
                <span className="material-icons text-sase-info">
                  menu_book
                </span>
                <span className="text-[11px] font-black text-white uppercase tracking-widest italic">
                  Manual de Estrategias
                </span>
              </button>
              <button
                onClick={() => toast("Enviando comunicación a padres...")}
                className="w-full p-5 bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-5 hover:bg-white/10 transition-all text-left"
              >
                <span className="material-icons text-sase-clinical">
                  mark_as_unread
                </span>
                <span className="text-[11px] font-black text-white uppercase tracking-widest italic">
                  Notificar a Tutores
                </span>
              </button>
            </div>
          </div>

          <div className="card-sase p-10 bg-sase-info/10 border-sase-info/10 flex flex-col items-center text-center">
            <div className="size-16 bg-sase-info/10 rounded-2xl flex items-center justify-center text-sase-info mb-6">
              <span className="material-icons text-3xl font-black italic">
                psychology
              </span>
            </div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-2">
              Asesor de inclusion IA
            </h4>
            <p className="text-[10px] font-medium text-slate-700 uppercase italic">
              SE DETECTA NECESIDAD DE REFUERZO EN LECTOESCRITURA PARA EL 25% DE
              LOS CASOS BAP EN 1ER GRADO.
            </p>
          </div>
        </div>
      </div>

      <GenericActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Actualizar Ajustes Razonables"
        description={`Sincronización de estrategias para ${selectedStudent?.name}`}
        fields={[
          {
            name: "adjustment",
            label: "DESCRIPCIÓN_DEL_AJUSTE",
            type: "textarea",
            required: true,
          },
        ]}
        onSubmit={handleUpdateAdjustment}
      />
    </GlassCard>
  );
};

export default DashboardUDEII;
