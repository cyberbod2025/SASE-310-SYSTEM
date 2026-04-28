import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, PhoneCall } from "lucide-react";
import { useApp } from "../../store";
import { EmergencyAlertModal } from "./EmergencyAlertModal";

const HOLD_MS = 1200;

export const EmergencyButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [holding, setHolding] = useState(false);
  const timerRef = useRef<number | null>(null);
  const { myActiveAlert } = useApp();

  const clearHold = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setHolding(false);
  };

  const startHold = () => {
    if (myActiveAlert || timerRef.current) return;
    setHolding(true);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setHolding(false);
      setIsOpen(true);
    }, HOLD_MS);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      startHold();
    }
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      clearHold();
    }
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onPointerDown={startHold}
        onPointerUp={clearHold}
        onPointerCancel={clearHold}
        onPointerLeave={clearHold}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onClick={(event) => {
          event.preventDefault();
          if (myActiveAlert) setIsOpen(true);
        }}
        className={`fixed bottom-6 right-6 z-[100] flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-all duration-300 ${
          myActiveAlert
            ? "bg-rose-600 animate-pulse ring-4 ring-rose-400/50"
            : "bg-red-600 hover:bg-red-500 ring-4 ring-white/10"
        }`}
        aria-label={myActiveAlert ? "Alerta activa" : "Mantener presionado para pedir ayuda"}
      >
        <div className="relative flex items-center justify-center">
          {myActiveAlert ? (
            <PhoneCall className="h-8 w-8 text-white" />
          ) : (
            <AlertCircle className="h-8 w-8 text-white" />
          )}

          {holding && !myActiveAlert && (
            <span className="absolute inset-0 rounded-full border-4 border-white/80 animate-ping" />
          )}

          <span className="absolute -top-12 right-0 whitespace-nowrap rounded-lg bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
            {myActiveAlert ? "ALERTA ACTIVA" : holding ? "MANTEN PRESIONADO" : "PEDIR AYUDA"}
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
