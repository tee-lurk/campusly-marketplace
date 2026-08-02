import React from "react";
import { cn } from "@/lib/utils";
import { FadeArc } from "@/components/loading-ui/fade-arc";

type Variant = "primary" | "ghost" | "destructive" | "secondary";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-indigo text-white shadow-btn hover:shadow-btn-hover hover:bg-brand-indigo-dark active:scale-[0.98] disabled:bg-gray-300 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed",
  ghost:
    "border border-brand-indigo text-brand-indigo bg-transparent hover:bg-brand-indigo hover:text-white active:scale-[0.98] disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed",
  secondary:
    "bg-gray-100 text-text-body hover:bg-gray-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700",
  destructive:
    "border border-red-400 text-red-500 bg-transparent hover:bg-red-50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-red-950",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-5 py-2.5 text-sm rounded-btn",
  lg: "px-6 py-3 text-base rounded-btn",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 select-none cursor-pointer",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <FadeArc className="w-4 h-4 flex-shrink-0" />}
      {children}
    </button>
  );
}
