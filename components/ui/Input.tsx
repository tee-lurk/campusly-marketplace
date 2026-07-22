import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  hint?: string;
  inputPrefix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, inputPrefix, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary dark:text-gray-200"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {inputPrefix && (
            <span className="absolute left-3.5 text-text-muted select-none text-sm font-medium pointer-events-none">
              {inputPrefix}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full rounded-btn border bg-card dark:bg-card-dark text-text-primary dark:text-gray-100 placeholder:text-text-muted",
              "px-3.5 py-2.5 text-sm transition-all duration-150",
              "focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:border-brand-indigo",
              typeof inputPrefix === "string" && inputPrefix.length > 2
                ? "pl-14"
                : inputPrefix
                ? "pl-10"
                : "",
              error
                ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                : "border-border-soft dark:border-border-dark",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-text-muted">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary dark:text-gray-200"
          >
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            "w-full rounded-btn border bg-card dark:bg-card-dark text-text-primary dark:text-gray-100 placeholder:text-text-muted",
            "px-3.5 py-2.5 text-sm transition-all duration-150 resize-y min-h-[120px]",
            "focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:border-brand-indigo",
            error
              ? "border-red-400 focus:ring-red-400 focus:border-red-400"
              : "border-border-soft dark:border-border-dark",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-text-muted">{hint}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary dark:text-gray-200"
          >
            {label}
          </label>
        )}
        <select
          id={inputId}
          ref={ref}
          className={cn(
            "w-full rounded-btn border bg-card dark:bg-card-dark text-text-primary dark:text-gray-100",
            "px-3.5 py-2.5 text-sm transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:border-brand-indigo",
            error
              ? "border-red-400"
              : "border-border-soft dark:border-border-dark",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
