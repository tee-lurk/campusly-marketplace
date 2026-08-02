"use client";

import React from "react";
import { TwinOrbit } from "@/components/loading-ui/twin-orbit";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return <TwinOrbit size={size} className={className} />;
}
