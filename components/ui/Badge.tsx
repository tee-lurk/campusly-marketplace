import React from "react";
import { cn } from "@/lib/utils";
import { ListingStatus } from "@/lib/types";

type BadgeVariant =
  | "indigo"
  | "amber"
  | "green"
  | "red"
  | "muted"
  | "outline"
  | ListingStatus;

const variantMap: Record<string, string> = {
  indigo: "bg-indigo-100 text-brand-indigo dark:bg-indigo-950 dark:text-indigo-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  green: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  red: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
  muted: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  outline: "border border-brand-indigo text-brand-indigo",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  approved: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  rejected: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
  sold: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "indigo", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantMap[variant] || variantMap.indigo,
        className
      )}
    >
      {children}
    </span>
  );
}
