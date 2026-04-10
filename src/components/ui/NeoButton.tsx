import React from "react";
import { motion } from "framer-motion";

type NeoButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: string;
  children: React.ReactNode;
};

export const NeoButton: React.FC<NeoButtonProps> = ({ icon, children, className = "", ...rest }) => {
  const baseShadow = "4px 4px 10px rgba(0,0,0,0.4), -2px -2px 8px rgba(255,255,255,0.03)";
  const insetShadow = "inset 4px 4px 10px rgba(0,0,0,0.5), inset -2px -2px 8px rgba(255,255,255,0.04)";

  return (
    <motion.button
      whileTap={{ scale: 0.98, boxShadow: insetShadow }}
      whileHover={{ boxShadow: insetShadow }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      style={{ transform: "translateZ(0)", boxShadow: baseShadow }}
      className={`relative inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 bg-[#131B2C] border border-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 active:translate-y-[1px] ${className}`}
      {...rest}
    >
      {icon && <span className="material-icons text-base opacity-80">{icon}</span>}
      <span className="whitespace-nowrap leading-none">{children}</span>
    </motion.button>
  );
};
