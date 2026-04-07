import React from 'react';
import { motion } from 'framer-motion';

interface LiquidButtonProps {
  children: React.ReactNode;
  variant?: 'purple' | 'cyan';
  onClick?: () => void;
  className?: string;
  icon?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export const LiquidButton: React.FC<LiquidButtonProps> = ({ 
  children, 
  variant = 'purple', 
  onClick, 
  className = "",
  icon,
  type = "button",
  disabled = false
}) => {
  const variantClass = variant === 'purple' ? 'btn-liquid-purple' : 'btn-liquid-cyan';
  
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.05, translateY: -2 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`${variantClass} ${className}`}
    >
      {icon && <span className="material-icons text-sm">{icon}</span>}
      {children}
    </motion.button>
  );
};

interface LiquidSearchProps {
  placeholder?: string;
  className?: string;
  onSearch?: (val: string) => void;
}

export const LiquidSearch: React.FC<LiquidSearchProps> = ({ 
  placeholder = "Buscar...", 
  className = "",
  onSearch 
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <input 
        type="text" 
        placeholder={placeholder}
        className="input-liquid-search pr-12 w-full"
        onChange={(e) => onSearch?.(e.target.value)}
      />
      <div className="absolute right-1.5 p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-[0_4px_12px_rgba(59,130,246,0.5)] cursor-pointer hover:scale-110 active:scale-90 transition-all group-focus-within:shadow-[0_0_20px_rgba(59,130,246,0.6)]">
        <span className="material-icons text-white text-sm">search</span>
      </div>
    </div>
  );
};

interface LiquidCardProps {
  children: React.ReactNode;
  className?: string;
}

export const LiquidCard: React.FC<LiquidCardProps> = ({ children, className = "" }) => {
  return (
    <div className={`card-liquid-vibrant ${className}`}>
      {/* Internal Gloss Decorations */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-sase-purple/10 blur-[80px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-sase-cyan/10 blur-[80px] rounded-full pointer-events-none animate-pulse delay-700" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export const LiquidSwitch: React.FC<{ checked?: boolean; onChange?: (val: boolean) => void }> = ({ 
  checked = false, 
  onChange 
}) => {
  return (
    <div 
      onClick={() => onChange?.(!checked)}
      className="switch-liquid-glass"
    >
      <motion.div 
        animate={{ x: checked ? 32 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="switch-liquid-glass-knob"
      />
    </div>
  );
};

export const LiquidBubble: React.FC<{ icon: string; className?: string }> = ({ icon, className = "" }) => {
  return (
    <div className={`bubble-liquid-glass ${className}`}>
      <span className="material-icons text-white/80">{icon}</span>
    </div>
  );
};
