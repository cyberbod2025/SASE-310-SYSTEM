import React from "react";

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: string;
  loading?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  loading,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles = "relative overflow-hidden flex items-center justify-center gap-2 rounded-2xl font-bold uppercase tracking-[0.15em] text-[10px] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    sm: "px-4 py-2 min-h-[40px]",
    md: "px-6 py-3 min-h-[48px]",
    lg: "px-8 py-4 min-h-[56px]"
  };

  const variantStyles = {
    primary: "bg-blue-600 text-white shadow-[0_4px_15px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:shadow-[0_8px_25px_rgba(37,99,235,0.4)] border border-blue-400/30",
    secondary: "bg-white/8 backdrop-blur-xl text-slate-100 border border-white/10 hover:bg-white/12 hover:border-blue-400/30",
    danger: "bg-red-600 text-white shadow-[0_4px_15px_rgba(220,38,38,0.3)] hover:bg-red-500 hover:shadow-[0_8px_25px_rgba(220,38,38,0.4)] border border-red-400/30",
    ghost: "bg-transparent text-slate-300 hover:bg-white/8 hover:text-white",
    outline: "bg-white/5 border border-white/10 text-slate-200 hover:border-blue-400/40 hover:text-blue-300 hover:bg-blue-500/10"
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="material-icons animate-spin text-[16px]">refresh</span>
      ) : (
        <>
          {icon && <span className="material-icons text-[16px]">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default GlassButton;
