import React from "react";

type FormFieldProps = {
  label?: string;
  name?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: "dark" | "light";
};

export function FormField({
  label,
  name,
  error,
  helperText,
  required,
  children,
  className = "",
  variant = "dark",
}: FormFieldProps) {
  const labelColor =
    variant === "dark" ? "text-slate-300" : "text-slate-600";

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className={`text-[9px] font-black ${labelColor} uppercase tracking-widest pl-1`}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider pl-1">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-[10px] font-medium text-slate-500 tracking-wide pl-1">
          {helperText}
        </p>
      )}
    </div>
  );
}
