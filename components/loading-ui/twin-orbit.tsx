"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TwinOrbitProps {
  className?: string;
  size?: "sm" | "md" | "lg" | string;
}

export function TwinOrbit({ className, size = "md" }: TwinOrbitProps) {
  const containerClasses =
    size === "sm"
      ? "w-5 h-5"
      : size === "md"
      ? "w-8 h-8"
      : size === "lg"
      ? "w-12 h-12"
      : className || "w-8 h-8";

  return (
    <div className={cn("relative inline-flex items-center justify-center pointer-events-none", containerClasses, className)}>
      {/* Center stationary core */}
      <span className="w-2 h-2 rounded-full bg-[#2E3192] dark:bg-indigo-400 shadow-2xs" />

      {/* Orbit 1: Primary Indigo Marker */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
        className="absolute inset-0 flex items-center justify-between"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#2E3192] dark:bg-indigo-300 shadow-xs" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#2E3192]/40 dark:bg-indigo-400/40" />
      </motion.div>

      {/* Orbit 2: Secondary Amber Marker (Reverse Rotation) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
        className="absolute inset-[-2px] flex items-center justify-between rotate-90"
      >
        <span className="w-2 h-2 rounded-full bg-[#F5A623] shadow-xs" />
        <span className="w-1 h-1 rounded-full bg-[#F5A623]/30" />
      </motion.div>
    </div>
  );
}
