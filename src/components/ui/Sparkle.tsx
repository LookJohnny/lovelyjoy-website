"use client";

import { cn } from "@/lib/utils";

interface SparkleProps {
  /** Width & height in px */
  size?: number;
  /** CSS color value, e.g. "#8ECAE6" or "currentColor" */
  color?: string;
  /** Animation delay in seconds */
  delay?: number;
  className?: string;
}

/**
 * Floating four-pointed star decoration -- the brand's sparkle symbol.
 * Animates with a gentle float + scale pulse via CSS keyframes
 * defined in globals.css (`sparkle-float`).
 */
export default function Sparkle({
  size = 20,
  color = "#8ECAE6",
  delay = 0,
  className,
}: SparkleProps) {
  return (
    <span
      className={cn("pointer-events-none inline-block", className)}
      style={{
        width: size,
        height: size,
        animation: `sparkle-float 3s ease-in-out ${delay}s infinite`,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/*
          Four-pointed star / diamond sparkle.
          Two mirrored cubic bezier curves per arm create the classic shape.
        */}
        <path d="M12 0C12 0 13.5 8.5 12 12C10.5 8.5 12 0 12 0ZM12 24C12 24 10.5 15.5 12 12C13.5 15.5 12 24 12 24ZM0 12C0 12 8.5 10.5 12 12C8.5 13.5 0 12 0 12ZM24 12C24 12 15.5 13.5 12 12C15.5 10.5 24 12 24 12Z" />
      </svg>
    </span>
  );
}
