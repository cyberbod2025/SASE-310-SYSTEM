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
        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 pl-4">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors text-[18px]">
            {icon}
          </span>
        )}
        <input
          className={`
            w-full bg-white/40 backdrop-blur-[20px] 
            rounded-2xl px-6 ${icon ? "pl-12" : ""} py-3.5 
            text-sm font-medium text-slate-800 
            border border-white/60 shadow-sm
            placeholder:text-slate-400
            outline-none transition-all duration-300
            focus:bg-white/60 focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/5" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest pl-4 mt-1">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default GlassInput;
