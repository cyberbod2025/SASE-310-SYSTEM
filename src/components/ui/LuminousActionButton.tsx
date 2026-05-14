import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface LuminousActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-[var(--sase-gradient-hero)]
    text-white
    shadow-[inset_0_2px_4px_rgba(255,255,255,0.25),0_8px_24px_rgba(167,139,250,0.2)]
    hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_12px_36px_rgba(167,139,250,0.28)]
    hover:brightness-110
  `,
  secondary: `
    bg-[rgba(167,139,250,0.08)]
    text-[var(--sase-text-main)]
    backdrop-blur-[20px]
    border border-[rgba(167,139,250,0.12)]
    shadow-[0_4px_20px_rgba(0,0,0,0.2)]
    hover:bg-[rgba(167,139,250,0.14)]
    hover:border-[rgba(167,139,250,0.2)]
  `,
  ghost: `
    bg-transparent
    text-[var(--sase-text-muted)]
    hover:bg-[rgba(167,139,250,0.06)]
    hover:text-[var(--sase-text-head)]
  `,
};

export const LuminousActionButton: React.FC<LuminousActionButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  type = "button",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden
        inline-flex items-center justify-center gap-2
        px-5 py-3
        rounded-[9999px]
        text-[11px] font-black uppercase tracking-[0.12em]
        transition-all duration-300
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {variant === "primary" && (
        <div className="absolute top-[2px] left-[12px] w-[40%] h-[40%] bg-gradient-to-br from-white/30 to-transparent rounded-full pointer-events-none opacity-60" />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default LuminousActionButton;
