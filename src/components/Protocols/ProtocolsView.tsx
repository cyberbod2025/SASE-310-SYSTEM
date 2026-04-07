import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../supabase/client";
import { Protocol, ProtocolType } from "../../types";
import { ProtocolDetailModal } from "./ProtocolDetailModal";
import { toast } from "react-hot-toast";
import { GlassCard } from "../ui/GlassCard";
import { GlassButton } from "../ui/GlassButton";
import { GlassInput } from "../ui/GlassInput";

export const ProtocolsView: React.FC = () => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [filterType, setFilterType] = useState<ProtocolType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProtocols();
  }, []);

  const fetchProtocols = async () => {
    try {
      const { data, error } = await supabase.from("protocolos" as any).select("*").order("titulo");
      if (error) throw error;
      const dbProtocols = (data as any[]) || [];

      const builtinProtocols: Protocol[] = [
        { id: "built-in-asi", titulo: "Abuso Sexual Infantil (ASI)", tipo: "seguridad", objetivo: "Protección inmediata, no revictimización y denuncia obligatoria.", activacion: "Relato del alumno o indicadores físicos/psicológicos detectados.", fuente: "Lineamientos SEP 2025", roles_responsables: ["Directivo", "Trabajador Social"], icono: "shield_person" },
        { id: "built-in-drogas", titulo: "Prevención de Adicciones", tipo: "legal", objetivo: "Contención de riesgos y canalización ante consumo de sustancias.", activacion: "Sospecha o detección de consumo/posesión de sustancias psicoactivas.", fuente: "Estrategia: Si te drogas te dañas", roles_responsables: ["Prefectura", "Orientación"], icono: "medication" },
        { id: "built-in-maltrato", titulo: "Maltrato Infantil", tipo: "seguridad", objetivo: "Detección y atención de violencia física o emocional doméstica.", activacion: "Observación de marcas de violencia o negligencia grave.", fuente: "Marco de Convivencia Escolar", roles_responsables: ["Docente", "Dirección"], icono: "favorite" },
        { id: "built-in-ciberacoso", titulo: "Ciberacoso / Grooming", tipo: "seguridad", objetivo: "Atención a la violencia digital y protección de la identidad.", activacion: "Evidencia de hostigamiento en redes sociales o mensajería.", fuente: "Ley Olimpia y Protocolo SEP", roles_responsables: ["Orientación", "Dirección"], icono: "devices" },
      ];

      const combined = [...builtinProtocols];
      dbProtocols.forEach((p) => { if (!combined.some((c) => c.titulo === p.titulo)) combined.push(p); });
      setProtocols(combined);
    } catch (err) {
      toast.error("Error al sincronizar protocolos normativos");
    } finally {
      setLoading(false);
    }
  };

  const filteredProtocols = protocols.filter((p) => {
    if (!p) return false;
    if (filterType !== "all" && p.tipo !== filterType) return false;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return p.titulo?.toLowerCase()?.includes(searchLower) || p.activacion?.toLowerCase()?.includes(searchLower);
    }
    return true;
  });

  const stats = {
    all: protocols.length,
    convivencia: protocols.filter((p) => p.tipo === "convivencia").length,
    salud: protocols.filter((p) => p.tipo === "salud").length,
    pc: protocols.filter((p) => p.tipo === "proteccion_civil" || p.tipo === "seguridad").length,
    apoyo: protocols.filter((p) => p.tipo === "apoyo").length,
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-fade-in flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3 uppercase italic">
              <span className="material-icons text-blue-600 text-3xl">gavel</span>
              Protocolos Normativos
           </h1>
           <p className="text-slate-500 font-medium tracking-tight mt-1">Marco jurídico y operativo para la salvaguarda de la integridad estudiantil.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-1 space-y-6">
            <GlassCard className="p-6 border border-slate-200 bg-white shadow-sm">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Filtros de Búsqueda</h3>
               <GlassInput 
                 placeholder="Buscar por caso..." 
                 value={searchQuery} 
                 onChange={e => setSearchQuery(e.target.value)} 
                 className="mb-8"
               />
               
               <div className="space-y-3">
                  <button onClick={() => setFilterType('all')} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${filterType === 'all' ? 'bg-blue-600 border-blue-500 text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200'}`}>
                     <span className="text-[11px] font-black uppercase tracking-widest">Todos</span>
                     <span className="font-black text-xs">{stats.all}</span>
                  </button>
                  <button onClick={() => setFilterType('convivencia')} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${filterType === 'convivencia' ? 'bg-rose-600 border-rose-500 text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-rose-200'}`}>
                     <span className="text-[11px] font-black uppercase tracking-widest">Convivencia</span>
                     <span className="font-black text-xs">{stats.convivencia}</span>
                  </button>
                  <button onClick={() => setFilterType('salud')} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${filterType === 'salud' ? 'bg-amber-600 border-amber-500 text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-amber-200'}`}>
                     <span className="text-[11px] font-black uppercase tracking-widest">Salud</span>
                     <span className="font-black text-xs">{stats.salud}</span>
                  </button>
                  <button onClick={() => setFilterType('proteccion_civil')} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${filterType === 'proteccion_civil' ? 'bg-cyan-600 border-cyan-500 text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-cyan-200'}`}>
                     <span className="text-[11px] font-black uppercase tracking-widest">PC / Emergencias</span>
                     <span className="font-black text-xs">{stats.pc}</span>
                  </button>
               </div>
            </GlassCard>

            <div className="p-6 bg-blue-50 border border-blue-100 rounded-[2rem]">
               <div className="flex gap-4">
                  <span className="material-icons text-blue-600">verified_user</span>
                  <div>
                     <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">Nota Legal</p>
                     <p className="text-[10px] text-blue-700 font-medium leading-relaxed italic">
                        La aplicación de estos protocolos es de observancia obligatoria para todo el personal del plantel SASE-310.
                     </p>
                  </div>
               </div>
            </div>
         </div>

         <div className="lg:col-span-3">
            {loading ? (
               <div className="h-96 flex flex-col items-center justify-center gap-4 opacity-50">
                  <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando marco jurídico...</p>
               </div>
            ) : filteredProtocols.length === 0 ? (
               <div className="h-96 flex flex-col items-center justify-center text-center opacity-30 grayscale grayscale-[50%] bg-white/40 border-2 border-slate-200 rounded-[3rem] border-dashed">
                  <span className="material-icons text-6xl mb-4">search_off</span>
                  <p className="text-xs font-black uppercase tracking-[0.2em]">Sin protocolos coincidentes</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                  {filteredProtocols.map((proto, idx) => (
                    <motion.div 
                      key={proto.id} 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: idx * 0.05 }}
                    >
                       <GlassCard 
                         hover 
                         className="p-8 h-full flex flex-col justify-between border border-slate-200 bg-white group cursor-pointer"
                         onClick={() => setSelectedProtocol(proto)}
                       >
                          <div className="space-y-6">
                             <div className="flex justify-between items-start">
                                <div className="size-14 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center text-slate-400 transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-xl group-hover:scale-110">
                                   <span className="material-icons text-3xl">{proto.icono || "menu_book"}</span>
                                </div>
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border shadow-sm uppercase tracking-widest ${
                                  proto.tipo === 'convivencia' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                  proto.tipo === 'salud' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                  proto.tipo === 'seguridad' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                  'bg-cyan-50 text-cyan-600 border-cyan-100'
                                }`}>
                                   {proto.tipo}
                                </span>
                             </div>
                             <div>
                                <h3 className="text-lg font-black text-slate-800 uppercase italic tracking-tighter mb-2 leading-tight group-hover:text-blue-600 transition-colors">{proto.titulo}</h3>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3 italic">"{proto.objetivo}"</p>
                             </div>
                          </div>
                          <div className="pt-8 flex items-center justify-between">
                             <div className="flex -space-x-2">
                                {proto.roles_responsables.slice(0,3).map((rol, i) => (
                                   <div key={i} title={rol} className="size-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-400 uppercase">
                                      {rol.slice(0,1)}
                                   </div>
                                ))}
                             </div>
                             <div className="flex items-center gap-2 text-blue-600">
                                <span className="text-[10px] font-black uppercase tracking-widest">Protocolo Activo</span>
                                <span className="material-icons text-sm">arrow_forward</span>
                             </div>
                          </div>
                       </GlassCard>
                    </motion.div>
                  ))}
               </div>
            )}
         </div>
      </div>

      <AnimatePresence>
        {selectedProtocol && (
          <ProtocolDetailModal
            protocol={selectedProtocol}
            onClose={() => setSelectedProtocol(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
