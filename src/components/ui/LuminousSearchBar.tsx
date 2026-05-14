import React from "react";

interface LuminousSearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

export const LuminousSearchBar: React.FC<LuminousSearchBarProps> = ({
  value,
  onChange,
  placeholder = "Buscar...",
  className = "",
}) => {
  return (
    <div className={`relative group ${className}`}>
      <span className="material-icons absolute left-5 top-1/2 -translate-y-1/2 text-[var(--sase-text-muted)] group-focus-within:text-[#A78BFA] transition-colors text-xl z-10">
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full h-14
          bg-[var(--sase-panel)]
          backdrop-blur-[24px]
          rounded-2xl
          pl-12 pr-20
          text-sm font-medium text-[var(--sase-text-head)]
          border border-[rgba(167,139,250,0.08)]
          shadow-[0_10px_40px_rgba(0,0,0,0.2)]
          placeholder:text-[var(--sase-text-muted)]
          outline-none
          transition-all duration-300
          focus:bg-[rgba(20,24,38,0.85)]
          focus:border-[rgba(167,139,250,0.25)]
          focus:shadow-[0_0_0_4px_rgba(167,139,250,0.06),0_10px_40px_rgba(0,0,0,0.25)]
        "
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <span className="text-[10px] font-black text-[var(--sase-text-muted)] uppercase tracking-widest bg-[rgba(167,139,250,0.06)] px-2 py-1 rounded-lg border border-[rgba(167,139,250,0.1)]">
          CTRL+F
        </span>
      </div>
    </div>
  );
};

export default LuminousSearchBar;
