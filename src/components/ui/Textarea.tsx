import React from "react";

type TextareaProps = {
  label?: string;
  name: string;
  error?: string;
  helperText?: string;
  variant?: "dark" | "light";
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name">;

export function Textarea({
  label,
  name,
  error,
  helperText,
  variant = "dark",
  className = "",
  ...props
}: TextareaProps) {
  const baseStyles =
    variant === "dark"
      ? "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-medium outline-none transition-all duration-300 ease-in-out focus:border-[#3B82F6] focus:bg-white/10 focus:ring-4 focus:ring-[#3B82F6]/20 placeholder:text-slate-500 resize-none"
      : "w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm font-bold outline-none transition-all duration-300 ease-in-out focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/20 placeholder:text-slate-400 resize-none";

  const errorStyles = error
    ? "border-red-400 focus:border-red-400 focus:ring-red-500/20"
    : "";

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={name}
          className={`text-[9px] font-black uppercase tracking-widest pl-1 ${
            variant === "dark" ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {label}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        title={props.title || label || props.placeholder}
        className={`${baseStyles} ${errorStyles} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider pl-1">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          className={`text-[10px] font-medium tracking-wide pl-1 ${
            variant === "dark" ? "text-slate-500" : "text-slate-400"
          }`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
