import React from 'react';
import { motion } from 'framer-motion';

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
      whileHover={{ scale: 1.05, translateY: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        bg-white/10 
        backdrop-blur-xl 
        border border-white/20 
        rounded-2xl 
        shadow-xl 
        p-6 
        cursor-pointer 
        transition-all 
        duration-300 
        group
        relative
        overflow-hidden
        ${className}
      `}
    >
      {/* Background Glow Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />
      
      <div className="relative z-10 flex flex-col h-full">
        {icon && (
          <div className="mb-4 text-blue-400 group-hover:text-blue-300 transition-colors">
            <span className="material-symbols-outlined text-4xl">
              {icon}
            </span>
          </div>
        )}
        
        {title && (
          <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors uppercase tracking-tight">
            {title}
          </h2>
        )}
        
        {description && (
          <p className="text-gray-300 text-sm mb-4 leading-relaxed font-medium">
            {description}
          </p>
        )}
        
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;
