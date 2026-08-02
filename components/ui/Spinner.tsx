"use client";

import React from "react";
import { TwinOrbit } from "@/components/loading-ui/twin-orbit";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-3 h-3 m-1",
  md: "w-4.5 h-4.5 m-2",
  lg: "w-7 h-7 m-3",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <TwinOrbit
      className={cn(
        sizeMap[size],
        "text-[#2E3192] dark:text-indigo-400",
        className
      )}
    />
  );
}
