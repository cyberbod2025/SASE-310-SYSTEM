import React from "react";
import { useAuth } from "../../components/AuthProvider";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export const DiagnosticoColectivoIframe: React.FC = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = React.useState(true);

  // El PIN se extrae del perfil del usuario logueado en SASE
  const pin = profile?.acceso_pin || "";
  const iframeUrl = `/modulos/colectivo/index.html?pin=${pin}`;

  return (
    <div className="flex flex-col h-full w-full bg-[#16141b] overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#16141b] z-50">
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
          <p className="text-indigo-400 font-bold tracking-widest uppercase text-xs">
            Iniciando Módulo de Diagnóstico...
          </p>
        </div>
      )}
      
      <motion.iframe
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        src={iframeUrl}
        className="w-full h-full border-none"
        onLoad={() => setLoading(false)}
        title="Diagnóstico Colectivo Institutional"
      />
    </div>
  );
};
