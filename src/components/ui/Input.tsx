import React from "react";

type InputProps = {
  label?: string;
  name: string;
  error?: string;
  helperText?: string;
  leftIcon?: string;
  rightElement?: React.ReactNode;
  variant?: "dark" | "light";
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">;

export function Input({
  label,
  name,
  error,
  helperText,
  leftIcon,
  rightElement,
  variant = "dark",
  className = "",
  type = "text",
  autoComplete,
  ...props
}: InputProps) {
  const inferredAutoComplete = autoComplete ?? inferAutoComplete(type);

  const baseStyles =
    variant === "dark"
      ? "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-medium outline-none transition-all duration-300 ease-in-out focus:border-[#B799FF] focus:bg-white/10 focus:ring-4 focus:ring-[#B799FF]/20 placeholder:text-slate-500"
      : "w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm font-bold outline-none transition-all duration-300 ease-in-out focus:border-[#B799FF] focus:ring-4 focus:ring-[#B799FF]/20 placeholder:text-slate-400";

  const errorStyles = error
    ? "border-red-400 focus:border-red-400 focus:ring-red-500/20"
    : "";

  const paddingLeft = leftIcon ? "pl-11" : "";
  const paddingRight = rightElement ? "pr-11" : "";

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
      <div className="relative group">
        {leftIcon && (
          <span
            className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-400 transition-colors text-xl ${
              variant === "dark" ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {leftIcon}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          autoComplete={inferredAutoComplete}
          title={props.title || label || props.placeholder}
          className={`${baseStyles} ${errorStyles} ${paddingLeft} ${paddingRight} ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors">
            {rightElement}
          </div>
        )}
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

function inferAutoComplete(type: string): string | undefined {
  switch (type) {
    case "email":
      return "email";
    case "password":
      return "current-password";
    case "tel":
      return "tel";
    case "url":
      return "url";
    case "text":
      return "off";
    default:
      return undefined;
  }
}
