import React from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  title?: string;
  icon?: string;
  description?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  title,
  icon,
  description,
  onClick,
  children,
  className = "",
  hover,
}) => {
  return (
    <motion.div
      whileHover={hover || onClick ? { 
        translateY: -4,
        backgroundColor: "rgba(255, 255, 255, 0.15)"
      } : {}}
      whileTap={hover || onClick ? { scale: 0.99 } : {}}
      onClick={onClick}
      className={`
        bg-white/10 backdrop-blur-[24px] 
        rounded-2xl shadow-xl 
        border border-white/20 
        border-t-4 border-[var(--color-rol)]
        p-6 transition-all duration-300
        relative overflow-hidden
        ${(onClick || hover) ? "cursor-pointer" : ""} 
        ${className}
      `}
      style={{ WebkitBackdropFilter: "blur(24px)" }}
    >
      <div className="relative z-10">
        {title && (
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2 border-b border-white/5 pb-2" title={title}>
            {icon && (
              <span className="material-icons text-[14px] opacity-70">
                {icon}
              </span>
            )}
            {title}
          </h3>
        )}
        
        {description && (
          <p className="text-sm text-slate-600 font-medium leading-relaxed mb-4">
            {description}
          </p>
        )}

        <div className="text-slate-800">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default GlassCard;
