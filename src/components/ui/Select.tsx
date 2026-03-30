import React from "react";

type SelectProps = {
  label?: string;
  name: string;
  error?: string;
  helperText?: string;
  variant?: "dark" | "light";
  children: React.ReactNode;
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name">;

export function Select({
  label,
  name,
  error,
  helperText,
  variant = "dark",
  className = "",
  children,
  ...props
}: SelectProps) {
  const baseStyles =
    variant === "dark"
      ? "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium outline-none transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20 appearance-none"
      : "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-bold outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 appearance-none";

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
      <div className="relative">
        <select
          id={name}
          name={name}
          title={props.title || label}
          className={`${baseStyles} ${errorStyles} ${className}`}
          {...props}
        >
          {children}
        </select>
        <span
          className={`material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-lg ${
            variant === "dark" ? "text-slate-500" : "text-slate-400"
          }`}
        >
          expand_more
        </span>
      </div>
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
