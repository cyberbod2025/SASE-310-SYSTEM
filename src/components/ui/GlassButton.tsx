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
  const baseStyles = "relative overflow-hidden flex items-center justify-center gap-2 rounded-2xl font-semibold uppercase tracking-[0.22em] text-[10px] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    sm: "px-4 py-2 min-h-[40px]",
    md: "px-6 py-3 min-h-[48px]",
    lg: "px-8 py-4 min-h-[56px]"
  };

  const variantStyles = {
    primary: "bg-[linear-gradient(135deg,#816ab8_0%,#9a89c2_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_24px_40px_rgba(129,106,184,0.2)] hover:brightness-105 border border-[rgba(255,255,255,0.16)]",
    secondary: "bg-[rgba(121,118,124,0.12)] backdrop-blur-xl text-[var(--sase-text-main)] border border-[rgba(227,221,236,0.14)] hover:bg-[rgba(121,118,124,0.16)] hover:border-[rgba(227,221,236,0.18)]",
    danger: "bg-red-600 text-white shadow-[0_4px_15px_rgba(220,38,38,0.3)] hover:bg-red-500 hover:shadow-[0_8px_25px_rgba(220,38,38,0.4)] border border-red-400/30",
    ghost: "bg-transparent text-[var(--sase-text-muted)] hover:bg-[rgba(121,118,124,0.08)] hover:text-white",
    outline: "bg-[rgba(121,118,124,0.08)] border border-[rgba(227,221,236,0.14)] text-[var(--sase-text-main)] hover:border-[rgba(125,114,147,0.35)] hover:text-white hover:bg-[rgba(121,118,124,0.14)]"
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
