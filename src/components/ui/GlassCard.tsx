import React, { useRef } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";

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
 * Luminous Refraction card — "The Radiant Prism" glass surface.
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
      rgba(123, 97, 255, 0.06),
      transparent 80%
    )
  `;

  return (
    <motion.div
      {...(rest as any)}
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
        boxShadow: "0 35px 90px rgba(123, 97, 255, 0.10)"
      }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={`
        relative overflow-hidden group
        backdrop-blur-[30px]
        bg-[rgba(255,255,255,0.55)]
        rounded-3xl transition-all duration-300
        ${onClick ? "cursor-pointer" : ""} 
        ${hover ? "card-sase-hover" : ""}
        ${className}
      `}
      style={{
        boxShadow: "var(--sase-shadow-md), inset 0 1px 0 rgba(255,255,255,0.60)",
      }}
      {...rest}
    >
      {/* 🔮 Frosted Edge (Light-catching refraction simulation) */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none z-0 bg-gradient-to-br from-white/35 via-transparent to-[rgba(123,97,255,0.03)]"></div>
      
      {/* 🔦 Spotlight Effect (Cursor Follower) */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: spotlightBackground }}
      />

      {/* 🌋 Ambient Glow (Primary tinted) */}
      <div className="absolute -inset-24 opacity-0 group-hover:opacity-10 shadow-[0_0_100px_rgba(123,97,255,0.12)] rounded-full blur-3xl pointer-events-none z-0"></div>

      <div className="relative z-10 p-6">
        {title && (
          <h3 className="title-sase text-lg font-bold text-white mb-2 tracking-[0.12em] flex items-center gap-3">
            {icon && (
              <div className="text-[var(--sase-tertiary)] transition-transform group-hover:scale-110">
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
          <p className="text-sm text-[var(--sase-text-muted)] leading-relaxed mb-4 font-medium">
            {description}
          </p>
        )}
        <div className="text-[var(--sase-text-main)]">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default GlassCard;
