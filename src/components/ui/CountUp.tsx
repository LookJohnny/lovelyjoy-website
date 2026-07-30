"use client";

import { useEffect, useRef, useState } from "react";
import {
  useMotionValue,
  useSpring,
  useInView,
  useReducedMotion,
  motion,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export default function CountUp({
  end,
  duration = 1.5,
  suffix = "",
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  // `mounted` is false on the server AND on the first client render, so the SSR
  // markup — and what a non-JS crawler or a slow connection sees — always
  // contains the REAL number (`end`), never 0.
  const [mounted, setMounted] = useState(false);
  const isInView = useInView(ref, { once: true, margin: "-40px 0px" });
  const prefersReducedMotion = useReducedMotion();

  // Start at the real value so post-hydration frames also show `end` — the
  // rendered number never dips to 0 at any point.
  const motionValue = useMotionValue(end);
  const springValue = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0,
  });
  const rounded = useTransform(springValue, (latest) => Math.round(latest));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isInView || prefersReducedMotion) return;
    // Keep the count-up feel without ever showing 0: when the section enters
    // the viewport, jump (no animation) to ~70% of the value, then spring up
    // to 100%. Skipped entirely under prefers-reduced-motion, where the final
    // value simply stays on screen.
    motionValue.jump(Math.round(end * 0.7));
    motionValue.set(end);
  }, [mounted, isInView, prefersReducedMotion, end, motionValue]);

  return (
    <span
      ref={ref}
      className={cn("text-4xl font-bold text-sky-brand", className)}
    >
      {mounted ? (
        <motion.span>{rounded}</motion.span>
      ) : (
        // SSR / pre-hydration fallback. Matches the first client render (no
        // hydration mismatch) and exposes the real value to crawlers.
        <span>{end}</span>
      )}
      {suffix && <span>{suffix}</span>}
    </span>
  );
}
