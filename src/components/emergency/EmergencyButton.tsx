import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, PhoneCall } from "lucide-react";
import { useApp } from "../../store";
import { EmergencyAlertModal } from "./EmergencyAlertModal";

export const EmergencyButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { myActiveAlert } = useApp();

  return (
    <>
      <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[100] flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-all duration-300 ${
          myActiveAlert 
            ? "bg-rose-600 animate-pulse ring-4 ring-rose-400/50" 
            : "bg-red-600 hover:bg-red-500 ring-4 ring-white/10"
        }`}
        aria-label="Pedir Ayuda Emergencia"
      >
        <div className="relative flex items-center justify-center">
          {myActiveAlert ? (
            <PhoneCall className="h-8 w-8 text-white" />
          ) : (
            <AlertCircle className="h-8 w-8 text-white" />
          )}
          
          <span className="absolute -top-12 right-0 whitespace-nowrap rounded-lg bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
            {myActiveAlert ? "ALERTA ACTIVA" : "PEDIR AYUDA"}
          </span>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <EmergencyAlertModal onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};
