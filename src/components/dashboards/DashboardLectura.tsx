import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../store";
import { AppModule } from "../../types";
import { GenericActionModal } from "../GenericActionModal";
import toast from "react-hot-toast";

export const DashboardLectura = () => {
  const [activeTab, setActiveTab] = useState<
    "PROYECTOS" | "EVENTOS" | "EVIDENCIAS"
  >("PROYECTOS");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveEvidence = async (data: any) => {
    toast.success("Evidencia de lectura sincronizada correctamente");
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 min-h-screen p-6 lg:p-10 space-y-10 bg-transparent relative overflow-y-auto custom-scrollbar font-sans selection:bg-pink-500/30">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
        <div className="flex items-center gap-6">
          <div className="size-16 bg-[#0a0f18] border border-pink-500/30 rounded-2xl flex items-center justify-center text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.15)] relative overflow-hidden backdrop-blur-xl">
            <span className="material-symbols-outlined text-4xl">
              menu_book
            </span>
            <motion.div
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-[1px] bg-pink-500/50"
            />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2 py-0.5 bg-pink-500/10 border border-pink-500/20 rounded text-[9px] font-black text-pink-400 uppercase tracking-widest">
                UNIT_08 // LITERACY_CORE
              </span>
              <div className="size-1.5 bg-pink-500 rounded-full animate-pulse shadow-[0_0_8px_#ec4899]"></div>
            </div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
              MANDO DE <span className="text-pink-400 italic">LECTURA</span>
            </h2>
          </div>
        </div>

        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-inner">
          <button
            onClick={() => setActiveTab("PROYECTOS")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === "PROYECTOS" ? "bg-pink-600 text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
          >
            Proyectos
          </button>
          <button
            onClick={() => setActiveTab("EVENTOS")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === "EVENTOS" ? "bg-pink-600 text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
          >
            Círculos
          </button>
          <button
            onClick={() => setActiveTab("EVIDENCIAS")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === "EVIDENCIAS" ? "bg-pink-600 text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
          >
            Portafolio
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
        <div className="xl:col-span-2 space-y-8">
          {activeTab === "PROYECTOS" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <ProjectCard
                title="Lectura en Espiral"
                pct={92}
                date="05 Mar"
                status="En Curso"
              />
              <ProjectCard
                title="Poesía de Patio"
                pct={45}
                date="18 Mar"
                status="Planeación"
              />
              <ProjectCard
                title="Libros Libres"
                pct={100}
                date="15 Feb"
                status="Completado"
              />
              <ProjectCard
                title="Bitácora de Sueños"
                pct={10}
                date="22 Mar"
                status="Iniciando"
              />
            </div>
          )}

          {activeTab === "EVENTOS" && (
            <div className="card-sase border-white/5 bg-[#0a0f18]/40 overflow-hidden divide-y divide-white/5 animate-slide-up">
              <EventRow
                title="Círculo de Lectura: Realismo Mágico"
                time="11:30 AM"
                room="Biblioteca"
              />
              <EventRow
                title="Maratón de Cuentos Cortos"
                time="09:00 AM"
                room="Patio C"
              />
              <EventRow
                title="Encuentro con Autor Local"
                time="01:30 PM"
                room="Auditorio"
              />
            </div>
          )}

          {activeTab === "EVIDENCIAS" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              <div
                className="card-sase p-6 border-pink-500/10 flex flex-col items-center justify-center text-center group cursor-pointer"
                onClick={() => setIsModalOpen(true)}
              >
                <span className="material-symbols-outlined text-4xl text-pink-500 mb-4 group-hover:scale-110 transition-transform">
                  cloud_upload
                </span>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">
                  Subir Bitácora
                </p>
              </div>
              <EvidenceThumb label="Muestra 'Espiral'" type="PDF" />
              <EvidenceThumb label="Video Círculo" type="MOV" />
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="card-sase p-8 border-pink-500/20 bg-pink-500/[0.02] relative overflow-hidden group">
            <h3 className="text-[10px] font-black text-pink-400 uppercase tracking-[0.4em] mb-8 italic flex items-center gap-3">
              <span className="size-2 bg-pink-500 rounded-full"></span>
              IMPACTO_LECTOR
            </h3>
            <div className="space-y-6">
              <ImpactStat label="Libros Prestados" value="214" color="pink" />
              <ImpactStat label="Lectores Activos" value="385" color="blue" />
              <ImpactStat label="Sesiones / Mes" value="28" color="amber" />
            </div>
          </div>
        </div>
      </div>

      <GenericActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registro de Actividades"
        description="Documentación de fomento a la lectura"
        fields={[
          {
            name: "proyecto",
            label: "PROYECTO_ASOCIADO",
            type: "text",
            required: true,
          },
          {
            name: "obs",
            label: "OBSERVACIONES_DE_CÍRCULO",
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

const ProjectCard = ({ title, pct, date, status }: any) => (
  <div className="card-sase p-6 border-white/5 bg-[#0a0f18]/30 group hover:border-pink-500/30 transition-all">
    <div className="flex justify-between items-start mb-6">
      <h4 className="text-sm font-black text-white uppercase italic tracking-tighter">
        {title}
      </h4>
      <span className="text-[9px] font-black text-pink-500/60 uppercase">
        {date}
      </span>
    </div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
        {status}
      </span>
      <span className="text-[10px] font-black text-white italic">{pct}%</span>
    </div>
    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        className="h-full bg-pink-500"
      />
    </div>
  </div>
);

const EventRow = ({ title, time, room }: any) => (
  <div className="p-6 flex items-center justify-between group hover:bg-pink-500/[0.02] transition-colors">
    <div className="flex items-center gap-5">
      <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-pink-400 transition-colors">
        <span className="material-symbols-outlined">auto_stories</span>
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
    <span className="text-[10px] font-mono text-pink-500 bg-pink-500/10 px-3 py-1.5 rounded-lg border border-pink-500/20">
      {time}
    </span>
  </div>
);

const EvidenceThumb = ({ label, type }: any) => (
  <div className="card-sase p-6 border-white/5 bg-[#0a0f18]/20 flex flex-col items-center justify-center text-center group hover:border-white/20 transition-all">
    <div className="size-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-600 mb-3 group-hover:text-pink-500">
      <span className="material-symbols-outlined text-3xl">book_2</span>
    </div>
    <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1">
      {label}
    </p>
    <p className="text-[8px] font-black text-slate-600 uppercase">{type}_DOC</p>
  </div>
);

const ImpactStat = ({ label, value, color }: any) => (
  <div className="flex items-end justify-between border-b border-white/5 pb-4">
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
      {label}
    </span>
    <span
      className={`text-2xl font-black italic tracking-tighter text-${color}-500`}
    >
      {value}
    </span>
  </div>
);

export default DashboardLectura;
