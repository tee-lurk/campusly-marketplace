import React from "react";
import { ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  isVerified?: boolean;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function VerifiedBadge({
  isVerified = true,
  size = "sm",
  showText = true,
  className,
}: VerifiedBadgeProps) {
  const iconSize = size === "sm" ? 14 : size === "md" ? 16 : 18;
  const textSize = size === "sm" ? "text-2xs" : size === "md" ? "text-xs" : "text-sm";

  if (isVerified) {
    if (!showText) {
      return (
        <span
          className={cn("inline-flex items-center flex-shrink-0", className)}
          title="Verified Student"
        >
          <svg
            aria-hidden="true"
            className={cn(
              "fill-sky-500 text-white flex-shrink-0",
              size === "sm" ? "w-3.5 h-3.5" : size === "md" ? "w-4 h-4" : "w-5 h-5"
            )}
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </span>
      );
    }

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 font-semibold text-sky-500 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 px-2 py-0.5 rounded-full shadow-2xs",
          textSize,
          className
        )}
        title="Verified Student"
      >
        <svg
          aria-hidden="true"
          className="w-3.5 h-3.5 fill-sky-500 text-white flex-shrink-0"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        <span>Verified</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 px-2 py-0.5 rounded-full",
        textSize,
        className
      )}
      title="Not Verified"
    >
      <ShieldOff size={iconSize - 2} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
      {showText && <span>Not Verified</span>}
    </span>
  );
}
