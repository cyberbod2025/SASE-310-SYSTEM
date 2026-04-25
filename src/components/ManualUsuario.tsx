import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "./ui/GlassCard";
import { useApp } from "../store";

export const ManualUsuario = () => {
  const { 
    setIsAssistantOpen, 
    setAssistantStatus, 
    setAssistantSuggestion 
  } = useApp();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Activar Sasito proactivamente al entrar al manual

  useEffect(() => {
    setIsAssistantOpen(true);
    setAssistantSuggestion({
      text: "¡Hola! Estás en el manual integrado. Si necesitas ayuda con un módulo concreto, te acompaño desde aquí sin reiniciar el tour largo.",
      state: "attention",
      actionLabel: "ENTENDIDO"
    });
  }, [setAssistantSuggestion, setIsAssistantOpen]);

  const faqs = [
    {
      id: 1,
      title: "¿Cómo registrar una incidencia en clase?",
      content:
        "Dirígete al módulo de Detección Pedagógica, selecciona al alumno y haz clic en \"Reportar Incidencia\". SASE guardará la hora y fecha automáticamente para asegurar la integridad del registro.",
    },
    {
      id: 2,
      title: "¿Cómo funciona la Caja Negra de privacidad?",
      content:
        "La información sensible de UDEII y Enfermería está protegida por protocolos de cifrado. Solo el personal con el rol autorizado puede acceder a estos expedientes, y cada acceso queda registrado irreversiblemente en el log de auditoría.",
    },
    {
      id: 3,
      title: "¿Cómo realizar un pase de lista?",
      content:
        "En el módulo de Asistencia verás la lista sincronizada de tu grupo. Utiliza los selectores de presencia (P), Retardo (R) o Falta (F) y pulsa en \"Guardar Protocolo\" para finalizar.",
    },
    {
      id: 4,
      title: "¿Qué es el Semáforo de Riesgo?",
      content:
        "Es un algoritmo predictivo que analiza patrones de conducta, asistencia y desempeño académico. El estado 'INTERVENCION' indica que el núcleo SASE ha detectado una anomalía crítica que requiere actuación inmediata.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 p-6 lg:p-12 relative z-10 w-full max-w-5xl mx-auto h-full flex flex-col overflow-hidden"
    >
      {/* Mesh Background Effects */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-violet-600/10 blur-[120px] rounded-full animate-mesh-slow" />
      <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full animate-mesh-slower" />

      <div className="mb-12 text-center relative">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black tracking-[0.2em] uppercase mb-4"
        >
          <span className="material-icons text-xs">info</span>
          Centro de Inteligencia SASE
        </motion.div>
        <h1 className="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tighter title-sase">
          Manual del Usuario
        </h1>
        <p className="text-slate-400 text-sm lg:text-base max-w-2xl mx-auto font-medium">
          Optimiza tu interacción con el núcleo operativo. Resuelve dudas frecuentes o consulta directamente a Sasito para asistencia avanzada.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        {/* FAQ Section */}
        <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto pr-4 custom-scrollbar">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-2">
            Protocolos Frecuentes
          </h2>
          
          {faqs.map((faq) => (
            <GlassCard 
              key={faq.id} 
              className="p-0 overflow-hidden border-white/5 hover:border-violet-500/30 transition-all duration-500"
              hover
            >
              <button
                onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none group min-h-[64px]"
              >
                <span className="text-white font-bold text-sm lg:text-base group-hover:text-violet-300 transition-colors">
                  {faq.title}
                </span>
                <div className={`p-1 rounded-lg bg-white/5 transition-transform duration-500 ${activeFaq === faq.id ? 'rotate-180 bg-violet-500/20 text-violet-400' : 'text-slate-500'}`}>
                  <span className="material-icons text-sm">expand_more</span>
                </div>
              </button>

              <AnimatePresence>
                {activeFaq === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="px-6 pb-6 text-slate-400 text-sm leading-relaxed"
                  >
                    <div className="pt-4 border-t border-white/10 italic">
                      {faq.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          ))}
        </div>

        {/* Sasito Sidebar CTA */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-2">
            Asistencia IA
          </h2>
          
          <GlassCard 
            className="border-violet-500/30 bg-violet-500/5 relative group h-fit cursor-pointer hover:bg-violet-500/10 transition-colors"
            onClick={() => setIsAssistantOpen(true)}
          >
            <div className="flex flex-col gap-4 items-start py-2">
              <div className="flex items-center gap-3">
                <span className="material-icons text-violet-400 text-2xl">auto_awesome</span>
                <h3 className="text-white font-black text-sm uppercase tracking-wider">Llamar a Sasito</h3>
              </div>
              
              <p className="text-slate-400 text-xs leading-relaxed text-left">
                Haz clic aquí o en la esfera flotante para abrir el chat del asistente interactivo.
              </p>
              
              <div className="w-full flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">
                  Activar Copiloto
                </span>
                <span className="material-icons text-violet-400 text-sm group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>
          </GlassCard>

          <div className="p-6 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-3xl">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronización Activa</span>
             </div>
             <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                El Manual de SASE-310 se actualiza en tiempo real con cada despliegue oficial de ingeniería.
             </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ManualUsuario;
