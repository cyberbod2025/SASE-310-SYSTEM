import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../store";
import { GenericActionModal } from "../GenericActionModal";

export const DashboardPromotora = () => {
  const { saveEvidence } = useApp();
  const [activeTab, setActiveTab] = useState<
    "AVANCES" | "EVENTOS" | "EVIDENCIAS"
  >("AVANCES");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveEvidence = async (data: any) => {
    const title = String(data.title || "").trim();
    const description = String(data.desc || "").trim();

    if (!title || !description) {
      throw new Error("Complete los datos requeridos.");
    }

    const result = await saveEvidence({
      title: `Evidencia de promotoría: ${title}`,
      fileType: "registro_promotoria",
      notes: description,
      proyectoNombre: title,
    });

    if (!result.success) {
      throw new Error(result.error || "No se pudo guardar la evidencia.");
    }
  };

  return (
    <div className="flex-1 min-h-screen p-6 lg:p-10 space-y-10 bg-transparent relative overflow-y-auto custom-scrollbar font-sans selection:bg-sase-clinical/30">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-100 pb-10">
        <div className="flex items-center gap-6">
          <div className="size-16 bg-[#0a0f18] border border-sase-clinical/30 rounded-2xl flex items-center justify-center text-sase-clinical shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden backdrop-blur-xl">
            <span className="material-icons text-4xl">
              local_activity
            </span>
            <motion.div
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-[1px] bg-sase-clinical/50"
            />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2 py-0.5 bg-sase-clinical/10 border border-sase-clinical/20 rounded text-[9px] font-black text-sase-clinical uppercase tracking-widest">
                UNIT_05 // PROMOTION_CORE
              </span>
              <div className="size-1.5 bg-sase-clinical rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
            </div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
              MANDO DE{" "}
              <span className="text-sase-clinical italic">PROMOTORÍA</span>
            </h2>
          </div>
        </div>

        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
          <button
            onClick={() => setActiveTab("AVANCES")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === "AVANCES" ? "bg-sase-clinical text-white shadow-xl shadow-black/5" : "text-slate-700 hover:text-white"}`}
          >
            Avances
          </button>
          <button
            onClick={() => setActiveTab("EVENTOS")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === "EVENTOS" ? "bg-sase-clinical text-white shadow-xl shadow-black/5" : "text-slate-700 hover:text-white"}`}
          >
            Eventos
          </button>
          <button
            onClick={() => setActiveTab("EVIDENCIAS")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === "EVIDENCIAS" ? "bg-sase-clinical text-white shadow-xl shadow-black/5" : "text-slate-700 hover:text-white"}`}
          >
            Evidencias
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
        <div className="xl:col-span-2 space-y-8">
          {activeTab === "AVANCES" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <ProgressCard
                title="Taller de Nutrición"
                pct={85}
                date="25 Feb"
                status="Finalizando"
              />
              <ProgressCard
                title="Feria de la Salud"
                pct={40}
                date="12 Mar"
                status="En Planeación"
              />
              <ProgressCard
                title="Campaña Dental"
                pct={100}
                date="10 Feb"
                status="Completado"
              />
              <ProgressCard
                title="Brigada de Seguridad"
                pct={15}
                date="30 Mar"
                status="Iniciando"
              />
            </div>
          )}

          {activeTab === "EVENTOS" && (
            <div className="card-sase border-slate-100 bg-[#0a0f18]/40 overflow-hidden divide-y divide-white/5 animate-slide-up">
              <EventRow
                title="Plática: Prevención de Adicciones"
                time="10:00 AM"
                room="Auditorio"
              />
              <EventRow
                title="Macro-Gimnasia Estudiantil"
                time="08:30 AM"
                room="Patio Central"
              />
              <EventRow
                title="Reunión de Enlace Comunitario"
                time="04:00 PM"
                room="Sala Juntas"
              />
            </div>
          )}

          {activeTab === "EVIDENCIAS" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              <div
                className="card-sase p-6 border-sase-clinical/10 flex flex-col items-center justify-center text-center group cursor-pointer"
                onClick={() => setIsModalOpen(true)}
              >
                <span className="material-icons text-4xl text-sase-clinical mb-4 group-hover:scale-110 transition-transform">
                  add_a_photo
                </span>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">
                  Subir Evidencia
                </p>
              </div>
              <EvidenceThumb label="Campaña Dental" type="JPG" />
              <EvidenceThumb label="Taller Nutrición" type="MP4" />
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="card-sase p-8 border-sase-clinical/20 bg-sase-clinical/[0.02] relative overflow-hidden group">
            <h3 className="text-[10px] font-black text-sase-clinical uppercase tracking-[0.4em] mb-8 italic flex items-center gap-3">
              <span className="size-2 bg-sase-clinical rounded-full"></span>
              ESTADÍSTICAS_IMPACTO
            </h3>
            <div className="space-y-6">
              <ImpactStat
                label="Alumnos Alcanzados"
                value="450"
                color="emerald"
              />
              <ImpactStat
                label="Padres Participantes"
                value="128"
                color="blue"
              />
              <ImpactStat label="Eventos Ejecutados" value="12" color="amber" />
            </div>
          </div>
        </div>
      </div>

      <GenericActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Repositorio de Evidencias"
        description="Carga táctica de documentación visual"
        fields={[
          {
            name: "title",
            label: "TÍTULO_DEL_EVENTO",
            type: "text",
            required: true,
          },
          {
            name: "desc",
            label: "DESCRIPCIÓN_LOGÍSTICA",
            type: "textarea",
            required: true,
          },
        ]}
        onSubmit={handleSaveEvidence}
      />
    </div>
  );
};

// -- HELPER COMPONENTS --

const ProgressCard = ({ title, pct, date, status }: any) => (
  <div className="card-sase p-6 border-slate-100 bg-[#0a0f18]/30 group hover:border-sase-clinical/30 transition-all">
    <div className="flex justify-between items-start mb-6">
      <h4 className="text-sm font-black text-white uppercase italic tracking-tighter">
        {title}
      </h4>
      <span className="text-[9px] font-black text-sase-clinical/60 uppercase">
        {date}
      </span>
    </div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">
        {status}
      </span>
      <span className="text-[10px] font-black text-white italic">{pct}%</span>
    </div>
    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        className="h-full bg-sase-clinical"
      />
    </div>
  </div>
);

const EventRow = ({ title, time, room }: any) => (
  <div className="p-6 flex items-center justify-between group hover:bg-sase-clinical/[0.02] transition-colors">
    <div className="flex items-center gap-5">
      <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-700 group-hover:text-sase-clinical transition-colors">
        <span className="material-icons">event</span>
      </div>
      <div>
        <p className="text-sm font-black text-white uppercase italic tracking-tighter">
          {title}
        </p>
        <p className="text-[9px] font-black text-slate-600 uppercase mt-1">
          {room}
        </p>
      </div>
    </div>
    <span className="text-[10px] font-mono text-sase-clinical bg-sase-clinical/10 px-3 py-1.5 rounded-2xl border border-sase-clinical/20">
      {time}
    </span>
  </div>
);

const EvidenceThumb = ({ label, type }: any) => (
  <div className="card-sase p-6 border-slate-100 bg-[#0a0f18]/20 flex flex-col items-center justify-center text-center group hover:border-white/20 transition-all">
    <div className="size-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-600 mb-3 group-hover:text-sase-clinical">
      <span className="material-icons text-3xl">
        insert_drive_file
      </span>
    </div>
    <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1">
      {label}
    </p>
    <p className="text-[8px] font-black text-slate-600 uppercase">
      {type}_FILE
    </p>
  </div>
);

const ImpactStat = ({ label, value, color }: any) => (
  <div className="flex items-end justify-between border-b border-slate-100 pb-4">
    <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">
      {label}
    </span>
    <span
      className={`text-2xl font-black italic tracking-tighter text-${color}-500`}
    >
      {value}
    </span>
  </div>
);
