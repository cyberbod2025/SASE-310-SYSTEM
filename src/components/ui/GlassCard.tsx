import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";

interface GlassCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: string;
  icon?: string | React.ReactNode;
  description?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  hover?: boolean;
}

/**
 * 🔮 GlassCard - High-Fidelity Liquid Glass Edition
 * Implementa refracción avanzada, iluminación dinámica (spotlight),
 * y bordes de cristal con gradiente cónico.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  title,
  icon,
  description,
  onClick,
  children,
  className = "",
  hover = false,
  ...rest
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 🎯 Spotlight Logic (Efecto de resplandor que sigue al cursor)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const spotlightBackground = useMotionTemplate`
    radial-gradient(
      650px circle at ${mouseX}px ${mouseY}px,
      rgba(59, 130, 246, 0.07),
      transparent 80%
    )
  `;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 100, 
        damping: 15,
        delay: 0.1 
      }}
      whileHover={{ 
        scale: 1.015, 
        translateY: -5,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.1)"
      }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={`
        relative overflow-hidden group
        backdrop-blur-[24px] 
        bg-white/5 dark:bg-slate-900/40
        border border-white/10 dark:border-white/5
        rounded-3xl transition-all duration-300
        ${onClick ? "cursor-pointer" : ""} 
        ${hover ? "card-sase-hover" : ""}
        ${className}
      `}
      {...rest}
    >
      {/* 🔮 Borde de Cristal (Simulado con gradiente cónico) */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none z-0 border border-transparent bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
      
      {/* 🔦 Spotlight Efect (Cursor Follower) */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: spotlightBackground }}
      />

      {/* 🌋 Neural Pulse (Internal Glow) */}
      <div className="absolute -inset-24 opacity-0 group-hover:opacity-10 shadow-[0_0_100px_rgba(59,130,246,0.3)] rounded-full blur-3xl pointer-events-none z-0"></div>

      <div className="relative z-10 p-6">
        {title && (
          <h3 className="title-sase text-lg font-black text-white mb-2 tracking-widest text-glow-blue flex items-center gap-3">
            {icon && (
              <div className="text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-transform group-hover:scale-110">
                {typeof icon === "string" ? (
                  <span className="material-icons">{icon}</span>
                ) : (
                  icon
                )}
              </div>
            )}
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-slate-400/80 leading-relaxed mb-4 font-medium">
            {description}
          </p>
        )}
        <div className="text-slate-200">
          {children}
        </div>
      </div>

      <style>{`
        .text-glow-blue {
          text-shadow: 0 0 10px rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </motion.div>
  );
};

export default GlassCard;
