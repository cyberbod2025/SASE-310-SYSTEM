import React from "react";

interface LuminousPanelProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const LuminousPanel: React.FC<LuminousPanelProps> = ({
  children,
  className = "",
  hover = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-[var(--sase-panel)]
        backdrop-blur-[30px] saturate-[160%]
        rounded-[2rem]
        border border-[rgba(167,139,250,0.08)]
        shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
        ${onClick ? "cursor-pointer" : ""}
        ${hover ? "transition-all duration-300 hover:bg-[rgba(20,24,38,0.85)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(167,139,250,0.1)] hover:-translate-y-0.5" : ""}
        ${className}
      `}
    >
      <div className="absolute inset-0 rounded-[2rem] pointer-events-none z-0 bg-gradient-to-br from-white/[0.04] via-transparent to-[rgba(167,139,250,0.03)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default LuminousPanel;
