import React from "react";

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  icon?: string;
  options: { value: string; label: string }[];
}

export const GlassSelect: React.FC<GlassSelectProps> = ({
  label,
  error,
  icon,
  options,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 pl-4 italic">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors text-[18px]">
            {icon}
          </span>
        )}
        <select
          className={`
            w-full bg-white/5 backdrop-blur-[20px] 
            rounded-2xl px-6 ${icon ? "pl-12" : ""} py-4 
            text-sm font-black uppercase tracking-tight text-slate-100 
            border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.2)]
            appearance-none outline-none transition-all duration-300
            focus:bg-white/8 focus:border-blue-400 focus:shadow-[0_16px_40px_rgba(37,99,235,0.18)]
            cursor-pointer
            ${error ? "border-red-500 focus:border-red-500" : ""}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100 font-bold uppercase text-[10px]">
              {opt.label}
            </option>
          ))}
        </select>
        <span className="material-icons absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors">
          expand_more
        </span>
        {error && (
          <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest pl-4 mt-1">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
