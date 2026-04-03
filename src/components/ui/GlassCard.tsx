import React from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  title?: string;
  icon?: string;
  description?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  title,
  icon,
  description,
  onClick,
  children,
  className = "",
}) => {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.02, 
        translateY: -4,
        boxShadow: "0 40px 80px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.15)"
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`glass-card-quantum relative overflow-hidden transition-all duration-500 liquid-glass gpu-accelerated ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {/* 🔮 Glass Shine (Efecto de Destello Interno) */}
      <div className="glass-shine" />

      {/* 🌋 Neural Pulse (Resplandor en hover) */}
      <div className="absolute -inset-24 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-radial-glow blur-3xl z-[-1]" />

      <div className="relative z-10">
        {title && (
          <h3 className="title-sase text-lg font-black text-white mb-2 tracking-widest text-glow-blue flex items-center gap-2">
            {icon && (
              <span className="material-icons text-blue-400 group-hover:scale-110 transition-transform">
                {icon}
              </span>
            )}
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-slate-400/90 leading-relaxed mb-4 font-medium brightness-125">
            {description}
          </p>
        )}
        <div className="text-slate-200">
          {children}
        </div>
      </div>

      <style>{`
        .bg-radial-glow {
          background: radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.03), transparent 60%);
        }
      `}</style>
    </motion.div>
  );
};

export default GlassCard;
