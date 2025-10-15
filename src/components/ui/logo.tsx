import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className={cn("flex items-center", className)}>
      {/* Arabic Text */}
      <span className={cn("font-bold text-[#4A2C8C] tracking-wide", textSizeClasses[size])}>
        أعناب
      </span>
    </div>
  );
}
