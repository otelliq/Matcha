import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        className={`
          px-4 py-2 border rounded-lg transition-colors
          focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent
          ${error ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}
