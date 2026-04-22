import React from "react";

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  icon,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--sase-text-muted)] pl-4">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-[var(--sase-text-muted)] group-focus-within:text-[var(--sase-accent)] transition-colors text-[18px]">
            {icon}
          </span>
        )}
        <input
          className={`
            w-full bg-[rgba(121,118,124,0.08)] backdrop-blur-[10px]
            rounded-2xl px-6 ${icon ? "pl-12" : ""} py-3.5 
            text-sm font-medium text-[var(--sase-text-head)]
            border border-[rgba(227,221,236,0.15)] shadow-[0_24px_60px_rgba(18,16,23,0.18)]
            placeholder:text-[var(--sase-text-muted)]
            outline-none transition-all duration-300
            focus:bg-[rgba(121,118,124,0.12)] focus:border-[rgba(125,114,147,0.55)] focus:ring-8 focus:ring-[rgba(125,114,147,0.08)]
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/5" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-[9px] font-semibold text-[#c57b8a] uppercase tracking-widest pl-4 mt-1">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default GlassInput;
