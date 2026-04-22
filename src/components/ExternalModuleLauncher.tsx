import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useApp } from "../store";
import { AppModule } from "../types";
import type { EcosystemModuleDescriptor } from "../hooks/useEcosystemModules";

type LaunchStatus =
  | "verifying"
  | "launching"
  | "error"
  | "denied"
  | "unavailable";

export const ExternalModuleLauncher: React.FC<{
  module: EcosystemModuleDescriptor;
}> = ({ module }) => {
  const { session } = useAuth();
  const { setCurrentModule } = useApp();
  const [status, setStatus] = useState<LaunchStatus>("verifying");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleLaunch = async () => {
    if (!session) {
      setStatus("error");
      setErrorMsg("No se encontro una sesion valida para lanzar el modulo.");
      return;
    }

    try {
      setStatus("verifying");
      const response = await fetch("/api/modules/launch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ module: module.key }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setStatus("denied");
          setErrorMsg(data.error || module.deniedMessage);
          return;
        }

        if (response.status === 404) {
          setStatus("unavailable");
          setErrorMsg(data.error || "El modulo no esta disponible en este momento.");
          return;
        }

        throw new Error(data.error || `No se pudo lanzar ${module.name}.`);
      }

      if (!data.url) {
        throw new Error("No se recibio una URL valida de lanzamiento.");
      }

      setStatus("launching");
      setTimeout(() => {
        window.location.href = data.url;
      }, 1200);
    } catch (error: any) {
      console.error("External module launch error", error);
      setStatus("error");
      setErrorMsg(error?.message || `No se pudo lanzar ${module.name}.`);
    }
  };

  useEffect(() => {
    handleLaunch();
  }, []);

  return (
    <div className="h-full w-full flex items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#0B1120]/90 rounded-3xl shadow-2xl overflow-hidden border border-white/10"
      >
        <div className="bg-slate-900 p-8 flex justify-center relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white/5 to-transparent" />
          <motion.div
            animate={status === "launching" ? { y: [0, -10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className={module.accentClass}
          >
            <Rocket className="w-16 h-16" />
          </motion.div>
        </div>

        <div className="p-8 text-center text-slate-100">
          <h2 className="text-2xl font-bold mb-2">{module.name}</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">{module.launchSubtitle}</p>

          {status === "verifying" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <Loader2 className={`w-8 h-8 animate-spin ${module.accentClass}`} />
              <p className="text-slate-400 font-medium italic">
                Verificando acceso institucional al modulo...
              </p>
            </div>
          )}

          {status === "launching" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                <ShieldCheck className="w-6 h-6" />
                <span>Acceso Autorizado</span>
              </div>
              <p className="text-slate-400">
                Preparando handoff seguro. Estas siendo redirigido...
              </p>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                />
              </div>
            </div>
          )}

          {status === "denied" && (
            <div className="flex flex-col items-center gap-4 py-4 text-amber-400">
              <AlertCircle className="w-12 h-12" />
              <p className="font-bold text-lg">Acceso Restringido</p>
              <p className="text-slate-400 text-sm">{errorMsg || module.deniedMessage}</p>
              <button
                onClick={() => setCurrentModule(AppModule.HOME)}
                className="mt-4 px-6 py-2 bg-white/5 text-slate-200 rounded-full font-semibold hover:bg-white/10 transition-colors"
              >
                Regresar al Inicio
              </button>
            </div>
          )}

          {status === "unavailable" && (
            <div className="flex flex-col items-center gap-4 py-4 text-slate-300">
              <AlertCircle className="w-12 h-12 text-slate-500" />
              <p className="font-bold text-lg">Modulo No Disponible</p>
              <p className="text-slate-400 text-sm">{errorMsg}</p>
              <button
                onClick={() => setCurrentModule(AppModule.HOME)}
                className="mt-4 px-6 py-2 bg-white/5 text-slate-200 rounded-full font-semibold hover:bg-white/10 transition-colors"
              >
                Regresar al Inicio
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4 py-4 text-rose-400">
              <AlertCircle className="w-12 h-12" />
              <p className="font-bold">Error de Conexion</p>
              <p className="text-slate-400 text-sm italic">{errorMsg}</p>
              <button
                onClick={handleLaunch}
                className="mt-4 px-6 py-2 bg-white/5 text-slate-100 rounded-full font-semibold flex items-center gap-2 hover:bg-white/10"
              >
                Reintentar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="px-8 py-4 bg-slate-950/80 border-t border-white/10 text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">
          Ecosistema SASE • Handoff firmado • {module.key}
        </div>
      </motion.div>
    </div>
  );
};
