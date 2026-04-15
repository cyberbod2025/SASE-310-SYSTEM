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
        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 pl-4 italic">
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
            w-full bg-white/5 backdrop-blur-[20px] 
            rounded-2xl px-6 ${icon ? "pl-12" : ""} py-5 
            text-sm font-medium text-slate-100 
            border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.2)]
            placeholder:text-slate-500
            outline-none transition-all duration-300
            focus:bg-white/8 focus:border-blue-400 focus:shadow-[0_16px_40px_rgba(37,99,235,0.18)]
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
