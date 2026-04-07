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
        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 pl-4 italic">
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
            w-full bg-white/40 backdrop-blur-[20px] 
            rounded-2xl px-6 ${icon ? "pl-12" : ""} py-4 
            text-sm font-black uppercase tracking-tight text-slate-700 
            border border-slate-200 shadow-sm
            appearance-none outline-none transition-all duration-300
            focus:bg-white/80 focus:border-blue-500 focus:shadow-xl
            cursor-pointer
            ${error ? "border-red-500 focus:border-red-500" : ""}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-slate-800 font-bold uppercase text-[10px]">
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
