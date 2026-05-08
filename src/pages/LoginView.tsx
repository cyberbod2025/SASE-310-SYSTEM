import React, { useState } from "react";
import { motion } from "framer-motion";

const metrics = [
  { label: "Visitantes", value: "500" },
  { label: "Stands", value: "28" },
  { label: "Tiempo activo", value: "18 min" },
  { label: "Promedio actual", value: "1 por stand" },
];

const zones = [
  { name: "Norte", color: "from-blue-400 to-cyan-300", active: true },
  { name: "Centro", color: "from-violet-400 to-purple-300", active: true },
  { name: "Este", color: "from-emerald-400 to-teal-300", active: false },
  { name: "Oeste", color: "from-amber-400 to-orange-300", active: true },
];

export const LoginView: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [grupo, setGrupo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen w-full flex items-stretch relative overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#1a1040] to-[#24243e]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.15),transparent_50%),radial-gradient(circle_at_80%_10%,rgba(139,92,246,0.12),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(6,182,212,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,rgba(15,12,41,0.4)_100%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 flex flex-col md:flex-row items-stretch gap-6 md:gap-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex-1 flex flex-col gap-5"
        >
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold text-cyan-300 uppercase tracking-[0.25em] mb-4">
              FERIA DE CIENCIAS 2026 &middot; ESD-310
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              Explora la feria, encuentra tu stand y sigue el flujo inteligente
            </h1>
            <p className="mt-3 text-sm md:text-base text-blue-200/70 font-medium leading-relaxed max-w-xl">
              Consulta zonas, presi&oacute;n de visitantes y recomendaciones para repartir mejor el recorrido.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm"
              >
                <p className="text-2xl md:text-3xl font-black text-white">{m.value}</p>
                <p className="text-[10px] font-semibold text-blue-200/60 uppercase tracking-[0.15em] mt-1">
                  {m.label}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-rose-500/10 to-orange-500/10 border border-rose-500/20 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="size-2 rounded-full bg-rose-400 animate-pulse" />
                <span className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.2em]">
                  Mayor presi&oacute;n
                </span>
              </div>
              <p className="text-lg font-bold text-white">Drones y Cartograf&iacute;a</p>
              <p className="text-xs text-rose-200/70 mt-1">3 visitantes en esta zona</p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-[0.2em]">
                  Mejor opci&oacute;n libre
                </span>
              </div>
              <p className="text-lg font-bold text-white">Rob&oacute;tica Creativa</p>
              <p className="text-xs text-emerald-200/70 mt-1">Zona ideal para redirigir visitantes</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-blue-200/60 uppercase tracking-[0.2em] mb-4">
              Mapa de zonas
            </p>
            <div className="flex flex-wrap gap-3">
              {zones.map((z) => (
                <div
                  key={z.name}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-gradient-to-r ${z.color} ${
                    z.active ? "border-white/20" : "border-white/5 opacity-40"
                  }`}
                >
                  <span className={`size-2 rounded-full ${z.active ? "bg-white" : "bg-gray-400"}`} />
                  <span className={`text-xs font-bold ${z.active ? "text-white" : "text-gray-400"}`}>
                    {z.name}
                  </span>
                  {z.active && (
                    <span className="text-[9px] text-white/70 font-semibold uppercase tracking-wider">
                      Activo
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              <span className="text-[9px] text-emerald-200/60 font-semibold tracking-wide">Norte</span>
              <span className="text-blue-200/30 text-[9px] mx-1">&middot;</span>
              <span className="size-1.5 rounded-full bg-violet-400" />
              <span className="text-[9px] text-violet-200/60 font-semibold tracking-wide">Centro</span>
              <span className="text-blue-200/30 text-[9px] mx-1">&middot;</span>
              <span className="size-1.5 rounded-full bg-teal-400" />
              <span className="text-[9px] text-teal-200/60 font-semibold tracking-wide">Este</span>
              <span className="text-blue-200/30 text-[9px] mx-1">&middot;</span>
              <span className="size-1.5 rounded-full bg-amber-400" />
              <span className="text-[9px] text-amber-200/60 font-semibold tracking-wide">Oeste</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="w-full md:w-[380px] lg:w-[420px] flex flex-col gap-5 shrink-0"
        >
          <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-white tracking-tight">Entrar a la feria</h2>
            <p className="text-xs text-blue-200/60 font-medium mt-2 leading-relaxed">
              Los alumnos ingresan con nombre, apellido y grupo. El acceso docente se realiza &uacute;nicamente desde SASE.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="feria-nombre" className="block text-[10px] font-bold text-blue-200/70 uppercase tracking-[0.2em] mb-1.5">
                  Nombre
                </label>
                <input
                  id="feria-nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-blue-200/30 text-sm font-medium outline-none focus:border-cyan-400/50 focus:bg-white/15 transition-all"
                  aria-label="Nombre"
                />
              </div>

              <div>
                <label htmlFor="feria-apellido" className="block text-[10px] font-bold text-blue-200/70 uppercase tracking-[0.2em] mb-1.5">
                  Apellido
                </label>
                <input
                  id="feria-apellido"
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Tu apellido"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-blue-200/30 text-sm font-medium outline-none focus:border-cyan-400/50 focus:bg-white/15 transition-all"
                  aria-label="Apellido"
                />
              </div>

              <div>
                <label htmlFor="feria-grupo" className="block text-[10px] font-bold text-blue-200/70 uppercase tracking-[0.2em] mb-1.5">
                  Grupo
                </label>
                <input
                  id="feria-grupo"
                  type="text"
                  value={grupo}
                  onChange={(e) => setGrupo(e.target.value)}
                  placeholder="Ej: 3A"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-blue-200/30 text-sm font-medium outline-none focus:border-cyan-400/50 focus:bg-white/15 transition-all"
                  aria-label="Grupo"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 text-white font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-violet-600/30 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                role="button"
              >
                Comenzar recorrido
              </button>
            </form>
          </div>

          <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <span className="material-icons text-indigo-300 text-xl">school</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Acceso docente solo desde SASE</h3>
                <p className="text-[11px] text-blue-200/60 mt-1 leading-relaxed">
                  El panel docente se abre desde SASE para proteger permisos, grupos y seguimiento institucional.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginView;
