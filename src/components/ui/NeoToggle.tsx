import React from "react";
import { motion } from "framer-motion";

type NeoToggleProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
};

export const NeoToggle: React.FC<NeoToggleProps> = ({ checked, onChange, label, disabled }) => {
  return (
    <label className={`flex items-center gap-3 select-none ${disabled ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          onClick={() => !disabled && onChange(!checked)}
          className="relative w-12 h-7 rounded-full bg-[#0F1626] border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
          style={{ transform: "translateZ(0)" }}
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-300 shadow-[0_4px_12px_rgba(0,0,0,0.3)] ${checked ? "left-5" : "left-1"}`}
            style={{ filter: "drop-shadow(0 0 6px rgba(59,130,246,0.35))", transform: "translateZ(0)" }}
          />
          <span className="sr-only">{label || "Interruptor"}</span>
        </motion.button>
        {label && <span className="text-xs font-semibold text-slate-200">{label}</span>}
      </div>
    </label>
  );
};
