import React, { useState } from "react";
import { GlassCard } from "./ui/GlassCard";
import { GlassButton } from "./ui/GlassButton";
import { motion, AnimatePresence } from "framer-motion";

export const PlaneacionNEM = () => {
  const [step, setStep] = useState(1);
  const [selectedPDA, setSelectedPDA] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  const pdas = [
    "Resuelve problemas de porcentajes en diversas situaciones.",
    "Utiliza estrategias para calcular el valor faltante en problemas de proporcionalidad directa.",
    "Interpreta y comunica información mediante gráficas de barras y circulares.",
    "Resuelve ecuaciones de la forma Ax + B = C utilizando propiedades de la igualdad.",
  ];

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setStep(3);
    }, 2500);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-fade-in flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="size-16 bg-blue-50 rounded-3xl flex items-center justify-center border border-blue-100 shadow-sm">
             <span className="material-icons text-blue-600 text-3xl">psychology</span>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3 italic uppercase">
               Asistente NEM
            </h1>
            <p className="text-slate-500 font-medium tracking-tight mt-1">Planificación analítica bajo los ejes articuladores de la Nueva Escuela Mexicana.</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <GlassCard className="p-0 border border-slate-200 bg-white">
               <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                  <span className="size-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs italic">01</span>
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight">Proceso de Aprendizaje (PDA)</h3>
               </div>
               <div className="p-8 space-y-4">
                  {pdas.map((pda) => (
                    <button
                      key={pda}
                      onClick={() => setSelectedPDA(pda)}
                      className={`w-full text-left p-6 rounded-3xl border-2 transition-all group ${
                        selectedPDA === pda ? "border-blue-500 bg-blue-50/50 shadow-xl" : "border-slate-100 bg-slate-50/30 hover:border-blue-200"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                         <div className={`size-10 rounded-2xl flex items-center justify-center transition-all ${selectedPDA === pda ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-400 group-hover:bg-blue-50"}`}>
                            <span className="material-icons">task_alt</span>
                         </div>
                         <p className={`text-xs font-black uppercase tracking-tight leading-relaxed ${selectedPDA === pda ? 'text-blue-700' : 'text-slate-600'}`}>{pda}</p>
                      </div>
                    </button>
                  ))}
               </div>
            </GlassCard>

            <GlassCard className="p-0 border border-slate-200 bg-white flex flex-col">
               <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                  <span className="size-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs italic">02</span>
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight">Ejes Articuladores</h3>
               </div>
               <div className="p-8 space-y-8 flex-1">
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Metodología Pedagógica</label>
                       <select title="Metodología" className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all">
                          <option>STEAM (Indagación Científica)</option>
                          <option>Aprendizaje Basado en Problemas (ABP)</option>
                          <option>Aprendizaje Servicio (AS)</option>
                          <option>Aprendizaje Basado en Proyectos Comunitarios</option>
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Eje Articulador (NEM)</label>
                       <select title="Eje Articulador" className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all">
                          <option>Pensamiento Crítico</option>
                          <option>Inclusión</option>
                          <option>Fomento a la Lectura</option>
                          <option>Interculturalidad Crítica</option>
                          <option>Igualdad de Género</option>
                       </select>
                    </div>
                  </div>

                  <GlassButton 
                    variant="primary" 
                    className="w-full h-16 mt-auto shadow-2xl" 
                    onClick={handleGenerate}
                    disabled={!selectedPDA || generating}
                    loading={generating}
                  >
                    <span className="material-icons mr-2">auto_awesome</span>
                    Diseñar Estructura Analítica
                  </GlassButton>
               </div>
            </GlassCard>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 pb-20">
             <GlassCard className="p-0 border border-slate-200 bg-white overflow-hidden shadow-2xl">
                <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                   <div>
                      <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black rounded-lg uppercase tracking-widest mb-3 inline-block">Propuesta Pedagógica</span>
                      <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">Proyecto: El Pulso de mi Comunidad</h2>
                      <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mt-1">Estrategia STEAM | Ciclo Escolar 2024-2025</p>
                   </div>
                   <div className="flex gap-3">
                      <GlassButton variant="outline" className="h-12 px-6">Descargar Proyecto</GlassButton>
                      <GlassButton variant="primary" className="h-12 px-6">Publicar en Bitácora</GlassButton>
                   </div>
                </div>
                
                <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                   {[
                     { title: 'Fase de Indagación', icon: 'science', text: 'Análisis detallado del consumo de recursos en 20 hogares para detectar patrones críticos.' },
                     { title: 'Aplicación Matemática', icon: 'calculate', text: 'Modelación de porcentajes de ahorro y construcción de gráficas circulares comunitarias.' },
                     { title: 'Evidencia Social', icon: 'groups', text: 'Campaña audiovisual de impacto comunitario y presentación de resultados en asamblea escolar.' }
                   ].map((col, i) => (
                     <div key={i} className="space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="size-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600">
                              <span className="material-icons text-xl">{col.icon}</span>
                           </div>
                           <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{col.title}</h4>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed text-justify italic">"{col.text}"</p>
                     </div>
                   ))}
                </div>

                <div className="px-10 py-8 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className="size-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                         <span className="material-icons text-sm">verified</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Alineado al Marco Curricular 2022</p>
                   </div>
                   <button onClick={() => setStep(1)} className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors italic">Diseñar nueva planeación</button>
                </div>
             </GlassCard>
                
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <GlassCard className="p-8 border border-slate-200 bg-blue-50/50">
                   <h4 className="text-[11px] font-black text-blue-800 uppercase tracking-widest mb-4">Evaluación Formativa</h4>
                   <p className="text-xs text-blue-700 font-medium leading-relaxed italic">Rubrica de desempeño basada en la autonomía del estudiante y la capacidad de interpretación de datos reales del entorno inmediato.</p>
                </GlassCard>
                <GlassCard className="p-8 border border-slate-200 bg-emerald-50/50">
                   <h4 className="text-[11px] font-black text-emerald-800 uppercase tracking-widest mb-4">Inclusión y Equidad</h4>
                   <p className="text-xs text-emerald-700 font-medium leading-relaxed italic">Ajustes razonables para garantizar el acceso a la información mediante materiales multimodales y lenguaje claro en todas las fases.</p>
                </GlassCard>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
