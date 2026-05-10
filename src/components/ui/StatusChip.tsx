import React from "react";

type ChipVariant = "default" | "lavender" | "cyan" | "blue" | "success" | "warning" | "error";

interface StatusChipProps {
  label: string;
  variant?: ChipVariant;
  className?: string;
}

const variantStyles: Record<ChipVariant, string> = {
  default: "bg-[rgba(167,139,250,0.1)] text-[#C4B5FD] border-[rgba(167,139,250,0.2)]",
  lavender: "bg-[rgba(167,139,250,0.12)] text-[#C4B5FD] border-[rgba(167,139,250,0.25)]",
  cyan: "bg-[rgba(103,232,249,0.1)] text-[#67E8F9] border-[rgba(103,232,249,0.2)]",
  blue: "bg-[rgba(59,130,246,0.12)] text-[#93C5FD] border-[rgba(59,130,246,0.25)]",
  success: "bg-[rgba(34,197,94,0.1)] text-[#4ADE80] border-[rgba(34,197,94,0.2)]",
  warning: "bg-[rgba(250,204,21,0.1)] text-[#FDE047] border-[rgba(250,204,21,0.2)]",
  error: "bg-[rgba(255,71,87,0.1)] text-[#FF6B7A] border-[rgba(255,71,87,0.2)]",
};

export const StatusChip: React.FC<StatusChipProps> = ({
  label,
  variant = "default",
  className = "",
}) => {
  return (
    <span
      className={`
        inline-flex items-center
        text-[9px] font-black uppercase tracking-widest
        px-2.5 py-1 rounded-full
        border
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {label}
    </span>
  );
};

export default StatusChip;
