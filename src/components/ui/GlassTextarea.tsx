import React from "react";

interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  icon?: string;
}

export const GlassTextarea: React.FC<GlassTextareaProps> = ({
  label,
  error,
  icon,
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
          <span className="material-icons absolute left-4 top-6 text-slate-400 group-focus-within:text-blue-600 transition-colors text-[18px]">
            {icon}
          </span>
        )}
        <textarea
          className={`
            w-full bg-white/40 backdrop-blur-[20px] 
            rounded-2xl px-6 ${icon ? "pl-12" : ""} py-5 
            text-sm font-medium text-slate-700 
            border border-slate-200 shadow-sm
            placeholder:text-slate-400
            outline-none transition-all duration-300
            focus:bg-white/80 focus:border-blue-500 focus:shadow-xl
            resize-none min-h-[120px]
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
