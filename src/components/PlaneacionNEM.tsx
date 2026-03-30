import React, { useState } from "react";
import { useApp } from "../store";

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
    }, 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 bg-[#020510] relative custom-scrollbar">
      {/* HUD Background Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-[url('/assets/branding/grid.png')] bg-repeat"></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Header with Robot Identity */}
        <div className="flex items-center gap-8 border-b border-blue-500/20 pb-8">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
            <img
              src="/assets/branding/SASE_ICON.png"
              alt="SASE AI"
              className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]"
            />
          </div>
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 uppercase tracking-tighter">
              Asistente de Planeación NEM
            </h1>
            <p className="text-blue-400/60 font-mono text-sm tracking-widest uppercase mt-1">
              Nueva Escuela Mexicana | Disciplina: Matemáticas
            </p>
          </div>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
            {/* PDA Selection */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                  1
                </span>
                <h3 className="text-xl font-bold text-white">
                  Selecciona el PDA
                </h3>
              </div>

              <div className="space-y-3">
                {pdas.map((pda) => (
                  <button
                    key={pda}
                    onClick={() => setSelectedPDA(pda)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      selectedPDA === pda
                        ? "bg-blue-600/30 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                        : "bg-black/20 border-white/5 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    <p className="text-sm">{pda}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Config Selection */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-8">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                  2
                </span>
                <h3 className="text-xl font-bold text-white">
                  Configuración del Proyecto
                </h3>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs text-blue-400/60 uppercase font-bold tracking-widest ml-1">
                    Metodología Sugerida
                  </span>
                  <select
                    className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500/50"
                    title="Seleccionar metodología pedagógica sugerida"
                  >
                    <option>STEAM (Indagación)</option>
                    <option>Aprendizaje Basado en Problemas (ABP)</option>
                    <option>Aprendizaje Servicio (AS)</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs text-blue-400/60 uppercase font-bold tracking-widest ml-1">
                    Eje Articulador
                  </span>
                  <select
                    className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500/50"
                    title="Seleccionar eje articulador de la Nueva Escuela Mexicana"
                  >
                    <option>Pensamiento Crítico</option>
                    <option>Inclusión</option>
                    <option>Vida Saludable</option>
                    <option>Interculturalidad Crítica</option>
                  </select>
                </label>
              </div>

              <button
                disabled={!selectedPDA || generating}
                onClick={handleGenerate}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_10px_30px_rgba(37,99,235,0.3)] flex items-center justify-center gap-3"
              >
                {generating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Procesando con IA...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">
                      auto_awesome
                    </span>
                    Generar Estructura STEAM
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white/5 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-10 relative overflow-hidden">
              {/* Success Badge */}
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-8 py-2 rounded-bl-3xl font-black text-xs tracking-widest">
                PROPUESTA GENERADA
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl font-black text-white mb-2">
                    Proyecto: El Pulso de mi Comunidad
                  </h2>
                  <p className="text-blue-400 font-mono uppercase tracking-widest">
                    Metodología: STEAM | Duración: 2 Semanas
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-blue-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">
                        science
                      </span>
                      Indagación
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Recolectar datos sobre el consumo de agua en 20 hogares de
                      la colonia para identificar patrones de desperdicio.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-blue-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">
                        calculate
                      </span>
                      Aplicación Matemática
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Cálculo de porcentajes de ahorro potencial y modelación de
                      gráficas circulares para presentar ante el Consejo
                      Escolar.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-blue-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">
                        emoji_objects
                      </span>
                      Producto Final
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Creación de un "Tablero Comunitario de Ahorro" y una
                      campaña audiovisual de concientización.
                    </p>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex gap-4">
                  <button className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all">
                    Descargar en PDF
                  </button>
                  <button className="px-8 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold uppercase tracking-widest rounded-xl transition-all">
                    Guardar en Bitácora
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="ml-auto px-8 py-3 text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    Nueva Planeación
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      `}</style>
    </div>
  );
};
