import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  ChevronLeft,
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
  | "embedded"
  | "error"
  | "denied"
  | "unavailable";

export const ExternalModuleLauncher: React.FC<{
  module: EcosystemModuleDescriptor;
}> = ({ module }) => {
  const { session } = useAuth();
  const { setCurrentModule, logEvent } = useApp();
  const [status, setStatus] = useState<LaunchStatus>("verifying");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const [iframeReady, setIframeReady] = useState(false);

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

      const rawText = await response.text();

      let data: any = null;

      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        throw new Error(
          `El servidor no devolvió JSON válido para ${module.name}. Status: ${response.status}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
          data?.message ||
          `No se pudo iniciar ${module.name}. Status: ${response.status}`
        );
      }

      if (!data?.url) {
        throw new Error(
          `Respuesta incompleta del servidor para ${module.name}. Falta URL de lanzamiento.`
        );
      }

      setStatus("launching");
      setIframeReady(false);
      setIframeUrl(data.url);
      await logEvent(module.key.toUpperCase(), "LAUNCH_MODULE", "SUCCESS");
      window.setTimeout(() => {
        setStatus("embedded");
      }, 350);
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
    <div className="h-full w-full flex items-center justify-center p-4 md:p-6 bg-[var(--sase-bg)] bg-[radial-gradient(circle_at_0%_0%,rgba(129,106,184,0.15),transparent_45%),radial-gradient(circle_at_100%_0%,rgba(59,130,246,0.12),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(175,166,60,0.10),transparent_50%)]">
      {status === "embedded" && iframeUrl ? (
        <div className="h-full w-full rounded-[2rem] overflow-hidden border border-[rgba(255,255,255,0.10)] bg-[rgba(17,24,39,0.72)] shadow-[0_36px_90px_rgba(0,0,0,0.5),0_0_34px_rgba(129,106,184,0.18)] backdrop-blur-[34px] flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[rgba(11,10,14,0.82)]">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setCurrentModule(AppModule.HOME)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/8 text-slate-100 hover:bg-white/14 border border-white/10 transition-colors text-xs font-black uppercase tracking-widest"
              >
                <ChevronLeft className="w-4 h-4" />
                Volver a SASE
              </button>
              <div className="min-w-0">
                <p className="text-white font-black leading-none truncate">{module.name}</p>
                <p className="text-[11px] text-slate-400 uppercase tracking-[0.22em] truncate">Módulo integrado con paleta SASE</p>
              </div>
            </div>
          </div>

          <div className="relative flex-1 bg-[#0b0a0e]">
            {!iframeReady && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#0b0a0e]/92 text-slate-200">
                <Loader2 className={`w-8 h-8 animate-spin ${module.accentClass}`} />
                <p className="text-sm font-medium">Cargando {module.name} dentro de SASE...</p>
              </div>
            )}
            <iframe
              src={iframeUrl}
              title={module.name}
              className="w-full h-full border-0"
              onLoad={() => setIframeReady(true)}
            />
          </div>
        </div>
      ) : (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[rgba(17,24,39,0.78)] backdrop-blur-[34px] rounded-3xl shadow-[0_36px_90px_rgba(0,0,0,0.46),0_0_34px_rgba(129,106,184,0.16)] overflow-hidden border border-white/10"
      >
        <div className="bg-[rgba(11,10,14,0.74)] p-8 flex justify-center relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_35%_20%,rgba(129,106,184,0.28),transparent_45%)]" />
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
                Preparando handoff seguro. El módulo se abrirá dentro de SASE...
              </p>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-[#816ab8] via-[#3b82f6] to-[#afa63c]"
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

        <div className="px-8 py-4 bg-[#0b0a0e]/80 border-t border-white/10 text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">
          Ecosistema SASE • Handoff firmado • {module.key}
        </div>
      </motion.div>
      )}
    </div>
  );
};
